import { ethers, upgrades } from "hardhat";

/**
 * Deploy HumanAdsEscrow via UUPS proxy.
 *
 * Usage:
 *   npx hardhat run scripts/deploy-escrow.ts --network sepolia
 *
 * Environment variables:
 *   DEPLOYER_PRIVATE_KEY — Deployer wallet private key
 *   FEE_VAULT_ADDRESS    — Platform fee recipient (default: deployer)
 *   ARBITER_ADDRESS      — Backend arbiter wallet (default: deployer)
 *
 * For Sepolia: uses existing hUSD at 0x62C2225D5691515BD4ee36539D127d0dB7dCeb67
 * For local:   deploys MockHUSD first
 */
async function main() {
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();

  console.log("Deploying HumanAdsEscrow...");
  console.log("  Network:", network.name, `(chainId: ${network.chainId})`);
  console.log("  Deployer:", deployer.address);

  // Determine hUSD token address
  let tokenAddress: string;

  if (network.chainId === 11155111n) {
    // Sepolia — use existing hUSD
    tokenAddress = "0x62C2225D5691515BD4ee36539D127d0dB7dCeb67";
    console.log("  Using existing hUSD:", tokenAddress);
  } else if (network.chainId === 31337n) {
    // Local hardhat — deploy mock
    console.log("  Deploying MockHUSD...");
    const MockHUSD = await ethers.getContractFactory("MockHUSD");
    const mockHusd = await MockHUSD.deploy();
    await mockHusd.waitForDeployment();
    tokenAddress = await mockHusd.getAddress();
    console.log("  MockHUSD deployed:", tokenAddress);
  } else {
    throw new Error(`Unsupported network: ${network.name} (${network.chainId})`);
  }

  const feeVault = process.env.FEE_VAULT_ADDRESS || deployer.address;
  const arbiter = process.env.ARBITER_ADDRESS || deployer.address;
  const feeBps = 1000; // 10%

  console.log("  Fee vault:", feeVault);
  console.log("  Arbiter:", arbiter);
  console.log("  Fee BPS:", feeBps);

  // Deploy via UUPS proxy
  const HumanAdsEscrow = await ethers.getContractFactory("HumanAdsEscrow");
  const escrow = await upgrades.deployProxy(
    HumanAdsEscrow,
    [tokenAddress, feeVault, feeBps, deployer.address, arbiter],
    { kind: "uups" }
  );

  await escrow.waitForDeployment();
  const escrowAddress = await escrow.getAddress();

  console.log("\n=== Deployment Complete ===");
  console.log("  Proxy address:", escrowAddress);
  console.log(
    "  Implementation:",
    await upgrades.erc1967.getImplementationAddress(escrowAddress)
  );
  console.log("\nNext steps:");
  console.log("  1. Verify on Etherscan:");
  console.log(
    `     npx hardhat verify --network ${network.name} ${escrowAddress}`
  );
  console.log("  2. Transfer DEFAULT_ADMIN_ROLE to multi-sig (for mainnet)");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
