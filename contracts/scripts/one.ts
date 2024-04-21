import { ethers } from "hardhat"
import dotenv from 'dotenv';
import BorrowDAPPJSON from "../artifacts/contracts/BorrowDAPP.sol/BorrowDAPP.json";
import IMessageServiceJSON from "../artifacts/contracts/BorrowDAPP.sol/IMessageService.json";
import { addRecord } from "./maintainRecords";

dotenv.config();

const mainnetMessageService = '0xB218f8A4Bc926cF1cA7b3423c154a0D627Bdb7E5'
const lineaMessageService = '0x971e727e956690b9957be6d51Ec16E73AcAC83A7'

const lineaFeeCollector = '0x362b7eC38BadB9539e8ceDE816a07040d690568F'

async function main() {
    // connect to the contracts on sepolia nad linea sepolia
    const mainnet = '0x6169fdBcd32F680539db24e6b2aa8CAfD3D4799F'
    const linea = '0x41Ba2D6520Ed895BC956cfD5fd445dD3cAE5d5f0'

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

    // connect directly to the linea message service and use it to call something on the mainnet contract
    const lineaMessageServiceContract = new ethers.Contract(lineaMessageService, IMessageServiceJSON.abi, lineaSigner)
    if (false) {
        const fee = ethers.parseEther("0.001")
        const extraFee = ethers.parseEther("0.0011")
        const calldata = mainnetContract.interface.encodeFunctionData("incrementMeaninglessCounter")
        console.log("calldata", calldata)
        const response = await lineaMessageServiceContract.sendMessage(
            mainnet,
            fee,
            mainnetContract.interface.encodeFunctionData("incrementMeaninglessCounter"),
            {
                value: extraFee + fee
            });
        // console.log("response", response)

        const receipt = await response.wait()
        // console.log("receipt", receipt)

        // get the MessageSent event
        const events = await lineaMessageServiceContract.queryFilter(lineaMessageServiceContract.filters.MessageSent(), receipt.blockNumber)
        if (1 !== events.length)
            console.log(`${'-'.repeat(20)}\nWARNING! Multiple events found. Current code cannot handle this properly\n${'-'.repeat(20)}`)

        const event: any = events[0] // this will do for now but eventually MUST be replaced with logic to ensure we pick the correct event from the list
        // console.log("event (json)", JSON.stringify(event, null, 2))
        // console.log("event (object)", event)

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
            direction: "L2 -> L1"
        })

        console.log("eventObj", eventObj)

        // check that 

        // wait some time
        const delay = 30 // seconds
        console.log(`waiting ${delay} seconds`)
        await new Promise(resolve => setTimeout(resolve, delay * 1000))
        console.log("done waiting")

        {// check inboxL2L1MessageStatus[messageHash] (0: unknown, 1: received)
            const abi = [
                "function inboxL2L1MessageStatus(bytes32 messageHash) view returns (uint256)"
            ]
            const contract = new ethers.Contract(mainnetMessageService, abi, mainnetSigner)
            const status = await contract.inboxL2L1MessageStatus(eventObj._messageHash)
            console.log("message status on mainnet", status.toString())

            if ('0' === status.toString()) {
                console.log("Mainnet has not seen this message hash. Returning early as the issue has already occured")
                return
            }
        }


        const mainnetMessageServiceContract = new ethers.Contract(mainnetMessageService, IMessageServiceJSON.abi, mainnetSigner)
        // on the other side we need to claim the message
        const claimResponse = await mainnetMessageServiceContract.claimMessage(
            eventObj._from,
            eventObj._to,
            eventObj._fee,
            eventObj._value,
            ethers.ZeroAddress, // fee recipient - if zero fees go to msg.sender
            eventObj._calldata,
            eventObj._nonce,
        );

        console.log("claimResponse", claimResponse)

        const claimReceipt = await claimResponse.wait()

        console.log("claimReceipt", claimReceipt)

    }

    // similar but from L1 -> L2
    const mainnetMessageServiceContract = new ethers.Contract(mainnetMessageService, IMessageServiceJSON.abi, mainnetSigner)
    {
        const fee = ethers.parseEther("0.00001")
        const extraFee = ethers.parseEther("0.000011")
        const calldata = lineaContract.interface.encodeFunctionData("incrementMeaninglessCounter")

        console.log("calldata", calldata)
        const response = await mainnetMessageServiceContract.sendMessage(
            linea,
            fee,
            calldata,
            {
                value: extraFee + fee
            });

        console.log("response", response)

        const receipt = await response.wait()

        console.log("receipt", receipt)

        const events = await mainnetMessageServiceContract.queryFilter(mainnetMessageServiceContract.filters.MessageSent(), receipt.blockNumber)

        console.log("events", events)

        if (1 !== events.length)
            console.log(`${'-'.repeat(20)}\nWARNING! Multiple events found. Current code cannot handle this properly\n${'-'.repeat(20)}`)

        const event: any = events[0] // this will do for now but eventually MUST be replaced with logic to ensure we pick the correct event from the list
        // console.log("event (json)", JSON.stringify(event, null, 2))
        // console.log("event (object)", event)

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
            direction: "L1 -> L2"
        })

        console.log("eventObj", eventObj)



    }







}
main()