import { expect } from "chai";
import hre from "hardhat";
import { ethers } from "hardhat";
import { setCode, mineUpTo } from "@nomicfoundation/hardhat-network-helpers";

describe("BorrowDAPP", () => {
    it("increment counter", async () => {
        const BorrowDAPP = await hre.ethers.getContractFactory("BorrowDAPP");
        const borrowDAPP = await BorrowDAPP.deploy(ethers.ZeroAddress, ethers.ZeroAddress);

        const dappAddress = await borrowDAPP.getAddress();
        expect(ethers.isAddress(dappAddress)).to.equal(true);

        const initalValue = await borrowDAPP.meaninglessCounter();
        expect(initalValue).to.equal(0n);

        await borrowDAPP.incrementMeaninglessCounter();

        const afterIncrement = await borrowDAPP.meaninglessCounter();
        expect(afterIncrement).to.equal(1n);
    })
});