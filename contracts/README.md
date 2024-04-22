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

--grep "string to match with test"

## scripts

### experiment.ts

This script demonstrates calling a function from a contract deployed on another network.

### processMessages.ts

This script traverses a list of all messageHashes one.ts has submitted and checks the other network to see if the message has been posted by the postmen. If it has, this script will then call claimMessage.

