# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a Hardhat Ignition module that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
```

deploy to sepolia

```shell
npx hardhat ignition deploy ./ignition/modules/BorrowDAPP.ts --network sepolia
```
You may need to delete ignition/deployments/chain-<something>

## Sepolia Deployments
- [First Version (sepolia)](https://sepolia.etherscan.io/address/0x7228856ED40d2812dEDAF33Ea4366be331300048#code)
- [First Version (linea sepolia)](https://sepolia.lineascan.build/address/0x43cb588c5603a1afc5e784493be091f444b6ab5b#code)


## Run only relevent tests

## scripts

### one.ts

This script demonstrates calling a function from a contract deployed on another network.

### processMessages.ts

This script traverses a list of all messageHashes one.ts has submitted and checks the other network to see if the message has been posted by the postmen. If it has, this script will then call claimMessage.


// would not work for the life of me

 {
    "_from": "0xb9de884375757E8bd1b138Cf3F1d2fA3bbf3f803",
    "_to": "0xF966fED9CB35471A1025815384e973C87eE0eA4D",
    "_fee": "0.001",
    "_value": "0.0011",
    "_nonce": "1429",
    "_calldata": "0xcf88871b",
    "_messageHash": "0xd247a646d3f5d5ebd0cf0382e355566c45e512523dd968becb4110c7de23919c",
    "direction": "L1 -> L2",
    "timestamp": "2024-4-21 17:16:26"
  },