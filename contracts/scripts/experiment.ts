import { ethers } from "hardhat"
import dotenv from 'dotenv';
import BorrowDAPPJSON from "../artifacts/contracts/BorrowDAPP.sol/BorrowDAPP.json";
import IMessageServiceJSON from "../artifacts/contracts/BorrowDAPP.sol/IMessageService.json";
import IERC721JSON from "../artifacts/contracts/BorrowDAPP.sol/IERC721.json";
import { addRecord } from "./maintainRecords";
import { mainnet, linea } from "./addresses";

dotenv.config();

const mainnetMessageService = '0xB218f8A4Bc926cF1cA7b3423c154a0D627Bdb7E5'
const lineaMessageService = '0x971e727e956690b9957be6d51Ec16E73AcAC83A7'

async function main() {
    // connect to the contracts on sepolia and linea sepolia
    const mainnetProvider = new ethers.JsonRpcProvider(`https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`)
    const mainnetSigner = new ethers.Wallet(process.env.SEPOLIA_PRIVATE_KEY as string, mainnetProvider)
    const mainnetContract = new ethers.Contract(mainnet, BorrowDAPPJSON.abi, mainnetSigner)

    console.log(`L1 balance ${mainnetSigner.address} ...... ${ethers.formatEther(await mainnetProvider.getBalance(mainnetSigner.address))}`)

    const lineaProvider = new ethers.JsonRpcProvider(`https://linea-sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`)
    const lineaSigner = new ethers.Wallet(process.env.LINEA_SEPOLIA_PRIVATE_KEY as string, lineaProvider)
    const lineaContract = new ethers.Contract(linea, BorrowDAPPJSON.abi, lineaSigner)

    console.log(`L2 balance ${lineaSigner.address} ...... ${ethers.formatEther(await lineaProvider.getBalance(lineaSigner.address))}`)

    { // ensure everything is connected correctly
        if (mainnetMessageService !== await mainnetContract.canonicalMessageService())
            throw new Error("mainnet message service address is incorrect")

        if (lineaMessageService !== await lineaContract.canonicalMessageService())
            throw new Error("linea message service address is incorrect")

        if (linea !== await mainnetContract.otherSide()) {
            console.log(`Setting the other side of mainnet to ${linea}`)
            await mainnetContract.setOtherSide(linea)
        }

        if (mainnet !== await lineaContract.otherSide()) {
            console.log(`Setting the other side of linea to ${mainnet}`)
            await lineaContract.setOtherSide(mainnet)
        }
    }

    const initalMainnetCounterValue = await mainnetContract.meaninglessCounter()
    console.log("initalMainnetCounterValue", initalMainnetCounterValue.toString())

    const initalLineaCounterValue = await lineaContract.meaninglessCounter()
    console.log("initalLineaCounterValue", initalLineaCounterValue.toString())

    // similar but from L1 -> L2
    const mainnetMessageServiceContract = new ethers.Contract(mainnetMessageService, IMessageServiceJSON.abi, mainnetSigner)
    {
        const fee = ethers.parseEther("0.00001")
        const extraFee = ethers.parseEther("0.000011")
        
        const calldata = lineaContract.interface.encodeFunctionData("incrementMeaninglessCounter")
        console.log("calldata", calldata)

        const response = await mainnetMessageServiceContract.sendMessage(linea, fee, calldata, { value: extraFee + fee });
        console.log("response", response)

        const receipt = await response.wait()
        console.log("receipt", receipt)

        const events = await mainnetMessageServiceContract.queryFilter(mainnetMessageServiceContract.filters.MessageSent(), receipt.blockNumber)
        console.log("events", events)

        if (1 !== events.length)
            console.log(`${'-'.repeat(20)}\nWARNING! Multiple events found. Current code cannot handle this properly\n${'-'.repeat(20)}`)

        const event: any = events[0] // this will do for now but eventually MUST be replaced with logic to ensure we pick the correct event from the list

        const eventObj = {
            _from: event.args._from,
            _to: event.args._to,
            _fee: event.args._fee,
            _value: event.args._value,
            _nonce: event.args._nonce,
            _calldata: event.args._calldata,
            _messageHash: event.args._messageHash,
        }

        await addRecord({
            ...eventObj,
            _fee: ethers.formatEther(eventObj._fee),
            _value: ethers.formatEther(eventObj._value),
            direction: "L1 -> L2",
            description: "increment meaningless counter"
        })

        console.log("eventObj", eventObj)
    }

    { // Deposit an NFT on L1 --> get cash on L2
        const nftContract = new ethers.Contract('0xed462de62fEAD82ebB1df9fa58C93c8043255D23', IERC721JSON.abi, mainnetSigner)
        const nextTokenId = await nftContract.nextTokenId()
        console.log("nextTokenId", nextTokenId.toString())

        const result = await nftContract.safeMint(mainnetSigner.address)
        console.log("Minting NFT...")
        await result.wait()

        // approve the borrowDAPP contract to take the NFT
        const alreadyApproved = await nftContract.isApprovedForAll(mainnetSigner.address, mainnet)
        if (false === alreadyApproved) {
            const result2 = await nftContract.setApprovalForAll(mainnet, true);
            console.log("Approving borrowDAPP to take NFT...")
            await result2.wait()
        }

        const result3 = await mainnetContract.depositNFT(await nftContract.getAddress(), nextTokenId, {
            value: ethers.parseEther("0.00001") * 2n
        })
        console.log("depositing NFT on L1...");
        const receipt3 = await result3.wait()

        // get any "MessageSent" events
        const events = await mainnetMessageServiceContract.queryFilter(mainnetMessageServiceContract.filters.MessageSent(), receipt3.blockNumber)
        console.log("events", events)

        const event: any = events[0]
        const eventObj = {
            _from: event.args._from,
            _to: event.args._to,
            _fee: event.args._fee,
            _value: event.args._value,
            _nonce: event.args._nonce,
            _calldata: event.args._calldata,
            _messageHash: event.args._messageHash,
        }

        await addRecord({
            ...eventObj,
            _fee: ethers.formatEther(eventObj._fee),
            _value: ethers.formatEther(eventObj._value),
            direction: "L1 -> L2",
            description: "depositing NFT on L1 for cash on L2"
        })
    }
}
main()