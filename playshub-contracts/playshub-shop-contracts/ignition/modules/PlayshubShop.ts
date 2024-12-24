// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { configDotenv } from "dotenv";
import { zeroAddress, parseEther } from "viem";

configDotenv();

const PlayshubShopModule = buildModule("PlayshubShopModule", (m) => {
  const PlayshubShop = m.contract("PlayshubShop", [
    m.getParameter("owner", process.env.OWNER_ADDRESS),
    m.getParameter("ids", [
      5n,
      6n,
      7n,
      8n,
      9n,
      10n,
      11n,
      12n,
      13n,
      14n,
      15n,
      16n,
      17n,
      18n,
      19n,
      20n,
      21n,
    ]),
    m.getParameter("names", [
      "pack_coin_ads",
      "pack_gem_ads",
      "pack_shard_ads",
      "pack_coin_1",
      "pack_coin_2",
      "pack_coin_3",
      "pack_shard_1",
      "pack_shard_2",
      "pack_shard_3",
      "pack_gem_1",
      "pack_gem_2",
      "pack_gem_3",
      "sub_vip1_monthly",
      "sub_vip2_monthly",
      "pack_coin_1",
      "pack_gem_1",
      "pack_shard_1",
    ]),
    m.getParameter("prices", [
      parseEther("0.001"),
      parseEther("0.001"),
      parseEther("0.001"),
      parseEther("0.001"),
      parseEther("0.001"),
      parseEther("0.001"),
      parseEther("0.001"),
      parseEther("0.001"),
      parseEther("0.001"),
      parseEther("0.001"),
      parseEther("0.001"),
      parseEther("0.001"),
      parseEther("0.001"),
      parseEther("0.001"),
      parseEther("0.001"),
      parseEther("0.001"),
      parseEther("0.001"),
    ]),
  ]);

  return { PlayshubShop };
});

export default PlayshubShopModule;
