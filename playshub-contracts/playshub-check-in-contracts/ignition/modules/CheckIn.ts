// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { configDotenv } from "dotenv";
import { zeroAddress, parseEther } from "viem";

configDotenv();

const CheckInModule = buildModule("CheckInModule", (m) => {
  const checkIn = m.contract("CheckIn", [
    m.getParameter("owner", process.env.OWNER_ADDRESS),
    m.getParameter("tokens", [zeroAddress]),
    m.getParameter("values", [parseEther("0.000075")]),
  ]);

  return { checkIn };
});

export default CheckInModule;
