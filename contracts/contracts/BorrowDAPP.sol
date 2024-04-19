// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

struct NFT {
    address nftAddress;
    uint256 tokenId;
}

function tokenUUID (NFT memory _nft) pure returns (bytes32) {
    return keccak256(abi.encodePacked(_nft.nftAddress, _nft.tokenId));
}

contract BorrowDAPP {
    uint256 public meaninglessCounter = 0;

    event NftDeposited();
    event LoanGranted();
    event LoanDenied();

    function incrementMeaninglessCounter() public {
        meaninglessCounter++;
    }

    function depositNFT(address _nftAddress, uint256 _tokenId) public {
        /* 
        Get value of NFT from oracle or exchange
            | cannot get value   -> reject
            | otherwise          -> continue
        Check we have permission to move the NFT
            | no permission      -> reject
            | otherwise          -> continue
        Transfer NFT to contract
        Record that the NFT is owned by the depositor
        Emit event
        */
    }

    function _grantLoan(uint256 amount) private {
        /*
        Lock ALL NFTs deposited by the borrower
        Transfer amount of ETH to borrower
        Record that the borrower owes the amount of ETH
        Emit event
        */
    }

    function _denyLoan() private {
        /*
        Emit event
        */
    }

    function borrowEth (uint256 amountRequested) public {
        /*
            LOOP over each deposited NFT
                check value of NFT
                if value of tokens seen > (N * amountRequested)
                    _grantLoan(amountRequested)
                    exit
                else
                    continue
            END LOOP
            _denyLoan()
        */
    }
}