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
    "sepolia": "0xE95F71071C7BDA7C2550a4329D986aB6465c8772",
    "linea_sepolia": "0xF966fED9CB35471A1025815384e973C87eE0eA4D",
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
