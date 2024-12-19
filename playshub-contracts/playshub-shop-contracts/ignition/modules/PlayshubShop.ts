// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { configDotenv } from "dotenv";
import { zeroAddress, parseEther } from "viem";

configDotenv();

const PlayshubShopModule = buildModule("PlayshubShopModule", (m) => {
  const PlayshubShop = m.contract("PlayshubShop", [
    m.getParameter("owner", process.env.OWNER_ADDRESS),
    m.getParameter("ids", [1n, 2n, 3n, 4n, 5n, 6n]),
    m.getParameter("names", [
      "1-Shards",
      "2-Shards",
      "3-Shards",
      "1-Gem",
      "2-Gem",
      "3-Gem",
    ]),
    m.getParameter("prices", [
      parseEther("0.001"),
      parseEther("0.004"),
      parseEther("0.01"),
      parseEther("0.001"),
      parseEther("0.004"),
      parseEther("0.01"),
    ]),
  ]);

  return { PlayshubShop };
});

export default PlayshubShopModule;
