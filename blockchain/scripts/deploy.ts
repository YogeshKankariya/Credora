import { network } from "hardhat";

const { ethers } = await network.connect();

async function main() {
  const registry = await ethers.deployContract("KYCRegistry");

  await registry.waitForDeployment();

  const address = await registry.getAddress();

  console.log(`KYCRegistry deployed to: ${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});