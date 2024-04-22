// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

interface IERC20 {
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 value) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 value) external returns (bool);
    function transferFrom(address from, address to, uint256 value) external returns (bool);
    function mint(address to, uint256 amount) external;
}

/**
 * @dev Required interface of an ERC721 compliant contract.
 */
interface IERC721 {
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);
    function balanceOf(address owner) external view returns (uint256 balance);
    function ownerOf(uint256 tokenId) external view returns (address owner);
    function safeTransferFrom(address from, address to, uint256 tokenId, bytes calldata data) external;
    function safeTransferFrom(address from, address to, uint256 tokenId) external;
    function transferFrom(address from, address to, uint256 tokenId) external;
    function approve(address to, uint256 tokenId) external;
    function setApprovalForAll(address operator, bool approved) external;
    function getApproved(uint256 tokenId) external view returns (address operator);
    function isApprovedForAll(address owner, address operator) external view returns (bool);
    function nextTokenId() external view returns (uint256);
    function safeMint(address to) external;
}


interface IMessageService {
  event MessageSent(
    address indexed _from,
    address indexed _to,
    uint256 _fee,
    uint256 _value,
    uint256 _nonce,
    bytes _calldata,
    bytes32 indexed _messageHash
  );
  event MessageClaimed(bytes32 indexed _messageHash);
  error FeeTooLow();
  error ValueShouldBeGreaterThanFee();
  error ValueSentTooLow();
  error MessageSendingFailed(address destination);
  error FeePaymentFailed(address recipient);
  function sendMessage(address _to, uint256 _fee, bytes calldata _calldata) external payable;
  function claimMessage(
    address _from,
    address _to,
    uint256 _fee,
    uint256 _value,
    address payable _feeRecipient,
    bytes calldata _calldata,
    uint256 _nonce
  ) external;
  function sender() external view returns (address);
}

struct NFT {
    address nftAddress;
    uint256 tokenId;
}

function tokenUUID (NFT memory _nft) pure returns (bytes32) {
    return keccak256(abi.encodePacked(_nft.nftAddress, _nft.tokenId));
}

interface IBorrowDAPP {
    function incrementMeaninglessCounter() external;
    function incrementOnOtherSide() external;
    function approveNftContract(address _nftContract) external;
    function depositNFT(address _nftAddress, uint256 _tokenId) external;
    function borrowEth (uint256 amountRequested) external;
}

contract BorrowDAPP {
    uint256 public meaninglessCounter = 0;
    IMessageService public canonicalMessageService;
    IBorrowDAPP public otherSide;
    IERC20 public dollars;
    
    mapping(address => bool) approvedNftContracts;
    mapping(bytes32 => address) public nftOwners; // tokenUUID -> owner
    mapping(bytes32 => uint256) public nftValues; // tokenUUID -> value .. the value the user has been credited for locking thier token

    event CounterIncremented(address indexed caller);
    event NftDeposited(address indexed nftAddress, uint256 indexed tokenId, bytes32 indexed tokenUUID);
    event LoanGranted();
    event LoanDenied();

    constructor(address _messageService, address _otherSide, address _dollars, address[] memory _approvedNftContracts) {
        canonicalMessageService = IMessageService(_messageService);
        otherSide = IBorrowDAPP(_otherSide);
        dollars = IERC20(_dollars);
        dollars.mint(address(this), 100_000_000 ether); // proto type... this is fine
        approveNftContracts(_approvedNftContracts);
    }

    function setOtherSide(address _otherSide) public {
        otherSide = IBorrowDAPP(_otherSide);
    }

    function incrementMeaninglessCounter() public payable {
        meaninglessCounter++;
        emit CounterIncremented(msg.sender);
    }

    function incrementOnOtherSide() public {
        canonicalMessageService
            .sendMessage(address(otherSide), 0, abi.encodeWithSignature("incrementMeaninglessCounter()"));
    }

    function approveNftContracts(address[] memory _nftContract) public {
        for (uint256 i = 0; i < _nftContract.length; i++) {
            approvedNftContracts[_nftContract[i]] = true;
        }
    }

    function depositNFT(address _nftAddress, uint256 _tokenId) public payable {
        require(approvedNftContracts[_nftAddress], "NFT contract not approved");
        
        // transfer the NFT to this contract
        IERC721(_nftAddress).transferFrom(msg.sender, address(this), _tokenId);

        // record that the NFT is owned by the depositor
        bytes32 _tokenUUID = tokenUUID(NFT(_nftAddress, _tokenId));
        nftOwners[_tokenUUID] = msg.sender;

        // credit the user with some fraction of the value of their deposited NFT
        // to make this PoC simple we will credit everyone with 5 dollars
        nftValues[_tokenUUID] = 5 ether;

        // send a message to the other side of the bridge just saying that the user is credited with 5 dollars
        canonicalMessageService
            .sendMessage{value: msg.value}(address(otherSide), msg.value/2, abi.encodeWithSignature("claimCredit(address,uint256)", msg.sender, nftValues[_tokenUUID]));

        emit NftDeposited(_nftAddress, _tokenId, _tokenUUID);
    }

    function claimCredit(address borrower, uint256 credit) public payable {
        // transfer 5 dollars to the borrower
        dollars.transfer(borrower, credit);
    }
}