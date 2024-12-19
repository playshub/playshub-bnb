import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";
import { configDotenv } from "dotenv";

configDotenv();

const config: HardhatUserConfig = {
  solidity: "0.8.27",
  networks: {
    "bsc-testnet": {
      url: "https://bsc-testnet.infura.io/v3/d82c144005ff47b58237d52b3267a564",
      accounts:
        process.env.DEPLOYER_PRIVATE_KEY !== undefined
          ? [process.env.DEPLOYER_PRIVATE_KEY]
          : [],
    },
    opbnb: {
      url: "https://opbnb-mainnet.infura.io/v3/d82c144005ff47b58237d52b3267a564",
      accounts:
        process.env.DEPLOYER_PRIVATE_KEY !== undefined
          ? [process.env.DEPLOYER_PRIVATE_KEY]
          : [],
      ignition: {
        gasPrice: 1000000000n,
        maxPriorityFeePerGas: 1000000000n,
      },
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};

export default config;
