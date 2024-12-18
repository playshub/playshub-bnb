import { ethers, upgrades } from "hardhat";

async function main() {
  console.log("Start deploying...");
  const [owner] = await ethers.getSigners();

  const Factory = await ethers.getContractFactory("PlayshubShop");
  const contract = await upgrades.deployProxy(
    Factory,
    [
      owner.address,
      ["1-Shards", "2-Shards", "3-Shards", "1-Gem", "2-Gem", "3-Gem"],
      [
        ethers.parseEther("0.001"),
        ethers.parseEther("0.004"),
        ethers.parseEther("0.01"),
        ethers.parseEther("0.001"),
        ethers.parseEther("0.004"),
        ethers.parseEther("0.01"),
      ],
    ],
    {
      initializer: "initialize",
      kind: "uups",
    }
  );
  console.log(`Deploying at tx ${contract.deploymentTransaction()?.hash}`);
  await contract.waitForDeployment();

  console.log("Contract deployed at address:", contract.target);
  console.log(
    "Contract deployed at block:",
    await ethers.provider.getBlockNumber()
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
