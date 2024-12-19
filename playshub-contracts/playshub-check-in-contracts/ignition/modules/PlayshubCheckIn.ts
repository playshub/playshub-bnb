// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { configDotenv } from "dotenv";
import { zeroAddress, parseEther } from "viem";

configDotenv();

const PlayshubCheckInModule = buildModule("PlayshubCheckInModule", (m) => {
  const PlayshubCheckIn = m.contract("PlayshubCheckIn", [
    m.getParameter("owner", process.env.OWNER_ADDRESS),
    m.getParameter("tokens", [zeroAddress]),
    m.getParameter("values", [parseEther("0.000075")]),
  ]);

  return { PlayshubCheckIn };
});

export default PlayshubCheckInModule;
