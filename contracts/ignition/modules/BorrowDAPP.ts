import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import hre from "hardhat";
import { ethers } from "hardhat";

const networkToCanonicalMessageService: any = {
    "sepolia": "0xB218f8A4Bc926cF1cA7b3423c154a0D627Bdb7E5",
    "linea_sepolia": "0x971e727e956690b9957be6d51Ec16E73AcAC83A7",
    "ethereum": "0xd19d4B5d358258f05D7B411E21A1460D11B0876F",
    "linea": "0x508Ca82Df566dCD1B0DE8296e70a96332cD644ec",
}

const networkToLatestDeployment: any = {
    "sepolia": "0x6169fdBcd32F680539db24e6b2aa8CAfD3D4799F",
    "linea_sepolia": "0x41Ba2D6520Ed895BC956cfD5fd445dD3cAE5d5f0",
    "ethereum": ethers.ZeroAddress,
    "linea": ethers.ZeroAddress,
}

const networkToCounterpart : any = {
    "sepolia": "linea_sepolia",
    "linea_sepolia": "sepolia",
    "ethereum": "linea",
    "linea": "ethereum",
}

const BorrowDAPPModule = buildModule("BorrowDAPPModule", (m) => {
    // what network are we deploying to? 
    const network = hre.network.name;
    console.log("network", network);

    if (false === Object.keys(networkToCanonicalMessageService).includes(network))
        throw new Error(`Unsupported network ${network}`);

    const canonicalMessageService = networkToCanonicalMessageService[network];

    const otherSide = networkToLatestDeployment[networkToCounterpart[network]];

    const borrowDAPP = m.contract("BorrowDAPP", [canonicalMessageService, otherSide], {});
    const settings = hre.config.solidity;
    console.log("soldity settings", JSON.stringify(settings, null, 2));
    return { borrowDAPP };
});

export default BorrowDAPPModule;
