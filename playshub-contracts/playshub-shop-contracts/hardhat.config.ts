import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@openzeppelin/hardhat-upgrades";
import { HttpNetworkAccountsUserConfig } from "hardhat/types";
import { configDotenv } from "dotenv";

configDotenv();

// Set your preferred authentication method
//
// If you prefer using a mnemonic, set a MNEMONIC environment variable
// to a valid mnemonic
const MNEMONIC = process.env.MNEMONIC;

// If you prefer to be authenticated using a private key, set a PRIVATE_KEY environment variable
const PRIVATE_KEY = process.env.PRIVATE_KEY;

const accounts: HttpNetworkAccountsUserConfig | undefined = MNEMONIC
  ? { mnemonic: MNEMONIC }
  : PRIVATE_KEY
  ? [PRIVATE_KEY]
  : undefined;

if (accounts == null) {
  console.warn(
    "Could not find MNEMONIC or PRIVATE_KEY environment variables. It will not be possible to execute transactions in your example."
  );
}

const config: HardhatUserConfig = {
  solidity: "0.8.24",

  networks: {
    arbsep: {
      url: "https://sepolia-rollup.arbitrum.io/rpc",
      accounts,
    },
    "bsc-testnet": {
      url: "https://bsc-testnet-rpc.publicnode.com",
      accounts,
    },
  },

  typechain: {
    target: "ethers-v6",
  },

  etherscan: {
    apiKey: {
      bscTestnet: process.env.BSCSCAN_API_KEY!,
    },
  },
};

export default config;
