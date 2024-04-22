import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import hre from "hardhat";
import { ethers } from "hardhat";
import { mainnet, linea } from "../../scripts/addresses";

const networkToCanonicalMessageService: any = {
    "sepolia": "0xB218f8A4Bc926cF1cA7b3423c154a0D627Bdb7E5",
    "linea_sepolia": "0x971e727e956690b9957be6d51Ec16E73AcAC83A7",
    "ethereum": "0xd19d4B5d358258f05D7B411E21A1460D11B0876F",
    "linea": "0x508Ca82Df566dCD1B0DE8296e70a96332cD644ec",
}

const networkToLatestDeployment: any = {
    "sepolia": mainnet,
    "linea_sepolia": linea,
    "ethereum": ethers.ZeroAddress,
    "linea": ethers.ZeroAddress,
}

const networkToCounterpart : any = {
    "sepolia": "linea_sepolia",
    "linea_sepolia": "sepolia",
    "ethereum": "linea",
    "linea": "ethereum",
}

const networkToDollarAddress: any = {
    "sepolia": `0x19E4B6e93353fA905c038E2D44344cA135fC6ada`,
    "linea_sepolia": `0xd9369fAbB632962F1Bd4B32C065854A1eB5682A6`,
    "ethereum": ethers.ZeroAddress,
    "linea": ethers.ZeroAddress,
}

const networkToApprovedNFTs: any = {
    "sepolia": ['0xed462de62fEAD82ebB1df9fa58C93c8043255D23', '0x809B5dE33ACBbf469954e04091943BEE2c7ef4E2'],
    "linea_sepolia": ['0x2Ae35144e35a3c0b77ae7104e4CE1c9ef2857e8e', '0xd4316420646663942b459B49d9eBC4c16Dd67a13'],
    "ethereum": [],
    "linea": [],
}

const BorrowDAPPModule = buildModule("BorrowDAPPModule", (m) => {
    // what network are we deploying to? 
    const network = hre.network.name;
    console.log("network", network);

    if (false === Object.keys(networkToCanonicalMessageService).includes(network))
        throw new Error(`Unsupported network ${network}`);

    const canonicalMessageService = networkToCanonicalMessageService[network];
    const otherSide = networkToLatestDeployment[networkToCounterpart[network]];
    const dollar = networkToDollarAddress[network];
    const approvedNFTs = networkToApprovedNFTs[network];

    const borrowDAPP = m.contract("BorrowDAPP", [canonicalMessageService, otherSide, dollar, approvedNFTs], {});
    const settings = hre.config.solidity;
    console.log("soldity settings", JSON.stringify(settings, null, 2));
    return { borrowDAPP };
});

export default BorrowDAPPModule;
