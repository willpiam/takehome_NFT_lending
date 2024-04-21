import { promises as fs } from 'fs';
import { ethers } from 'hardhat';
import BorrowDAPPJSON from "../artifacts/contracts/BorrowDAPP.sol/BorrowDAPP.json";
import IMessageServiceJSON from "../artifacts/contracts/BorrowDAPP.sol/IMessageService.json";
import dotenv from 'dotenv';
dotenv.config();

const mainnetMessageService = '0xB218f8A4Bc926cF1cA7b3423c154a0D627Bdb7E5'
const lineaMessageService = '0x971e727e956690b9957be6d51Ec16E73AcAC83A7'

const lineaProvider = new ethers.JsonRpcProvider(`https://linea-sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`)
const lineaSigner = new ethers.Wallet(process.env.LINEA_SEPOLIA_PRIVATE_KEY as string, lineaProvider)

const mainnet = '0xE95F71071C7BDA7C2550a4329D986aB6465c8772'
const linea = '0xF966fED9CB35471A1025815384e973C87eE0eA4D'

const processMessages = async () => {
  const filename = 'records.json';
  const data = await fs.readFile(filename, { encoding: 'utf8' });
  const records = JSON.parse(data);

  const l2InboxContractAbi = [
    "function inboxL1L2MessageStatus(bytes32 messageHash) view returns (uint256)"
  ]

  const l2InboxContract = new ethers.Contract(lineaMessageService, l2InboxContractAbi, lineaSigner)

  const lineaMessageServiceContract = new ethers.Contract(lineaMessageService, IMessageServiceJSON.abi, lineaSigner)

  for (const record of records) {
    // process each record
    // console.log("Processing record", record);

    if (record.direction === "L1 -> L2") {
      const status : bigint = await l2InboxContract.inboxL1L2MessageStatus(record._messageHash)
      console.log("Status", status.toString())

      if (0n === status) {
        const timeDelta = Date.now() - new Date(record.timestamp).getTime()
        const timeDeltaMinutes = (timeDelta / 1000 / 60).toFixed(3)
        console.log(`Message not yet processed. Skipping. (fee: ${record._fee}, value: ${record._value}, elapsed: ${timeDeltaMinutes})`)
        continue;
      }

      if (2n === status) {
        console.log(`Message already claimed. Skipping.`)
        continue;
      }

      console.log(`Claiming message ${record._messageHash}`)

      const response = await lineaMessageServiceContract.claimMessage(
        record._from,
        record._to,
        ethers.parseEther(record._fee),
        ethers.parseEther(record._value),
        ethers.ZeroAddress,
        record._calldata,
        record._nonce,
      ).catch((error) => 'failed')

      if ('failed' === response) {
        console.log(`Failed to claim message ${record._messageHash}`)
        continue;
      }

      console.log("response", response)

      const receipt = await response.wait()

      // console.log("receipt", receipt)
      console.log(`Message ${record._messageHash} claimed.`)






    }
    else {
      console.log("Not doing this direction yet. Skipping.")
      continue;
    }
  }


}

processMessages();