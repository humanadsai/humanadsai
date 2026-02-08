import { ethers, upgrades } from "hardhat";

/**
 * Upgrade HumanAdsEscrow to a new implementation.
 *
 * Usage:
 *   PROXY_ADDRESS=0x... npx hardhat run scripts/upgrade-escrow.ts --network sepolia
 *
 * Environment variables:
 *   DEPLOYER_PRIVATE_KEY — Must hold DEFAULT_ADMIN_ROLE
 *   PROXY_ADDRESS        — Existing proxy address to upgrade
 */
async function main() {
  const proxyAddress = process.env.PROXY_ADDRESS;
  if (!proxyAddress) {
    throw new Error("PROXY_ADDRESS environment variable is required");
  }

  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();

  console.log("Upgrading HumanAdsEscrow...");
  console.log("  Network:", network.name, `(chainId: ${network.chainId})`);
  console.log("  Deployer:", deployer.address);
  console.log("  Proxy:", proxyAddress);

  const oldImpl = await upgrades.erc1967.getImplementationAddress(proxyAddress);
  console.log("  Old implementation:", oldImpl);

  const HumanAdsEscrowV2 = await ethers.getContractFactory("HumanAdsEscrow");
  const upgraded = await upgrades.upgradeProxy(proxyAddress, HumanAdsEscrowV2, {
    kind: "uups",
  });

  await upgraded.waitForDeployment();
  const newImpl = await upgrades.erc1967.getImplementationAddress(proxyAddress);

  console.log("\n=== Upgrade Complete ===");
  console.log("  New implementation:", newImpl);
  console.log("  Proxy unchanged:", proxyAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
