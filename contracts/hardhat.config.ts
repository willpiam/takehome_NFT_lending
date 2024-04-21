import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import dotenv from 'dotenv';
dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    hardhat: {},
    sepolia: {
      url: `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: [process.env.SEPOLIA_PRIVATE_KEY as string]
    },
    linea_sepolia: {
      url: `https://linea-sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`, 
      accounts: [process.env.LINEA_SEPOLIA_PRIVATE_KEY as string],
      // gas: 2100000,
      // gasPrice: 8000000000,
      // gasMultiplier: 1,
    }

  }
};

export default config;
