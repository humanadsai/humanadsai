import { ethers } from "hardhat";

/**
 * Grant ARBITER_ROLE to the Treasury address on HumanAdsEscrow.
 *
 * Usage:
 *   TS_NODE_PROJECT=tsconfig.hardhat.json npx hardhat run scripts/grant-arbiter-role.ts --network sepolia
 *
 * Environment variables:
 *   DEPLOYER_PRIVATE_KEY — Admin wallet private key (must have DEFAULT_ADMIN_ROLE)
 */
async function main() {
  const [admin] = await ethers.getSigners();
  console.log("Admin address:", admin.address);

  const ESCROW_PROXY = "0xbA71c6a6618E507faBeDF116a0c4E533d9282f6a";
  const TREASURY_ADDRESS = "0x0B9F043D4BcD45B95B72d4D595dEA8a31acdc017";

  // ARBITER_ROLE = keccak256("ARBITER_ROLE")
  const ARBITER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("ARBITER_ROLE"));
  console.log("ARBITER_ROLE hash:", ARBITER_ROLE);

  // Minimal ABI for AccessControl
  const abi = [
    "function grantRole(bytes32 role, address account) external",
    "function hasRole(bytes32 role, address account) external view returns (bool)",
    "function DEFAULT_ADMIN_ROLE() external view returns (bytes32)",
  ];

  const escrow = new ethers.Contract(ESCROW_PROXY, abi, admin);

  // Check if admin has DEFAULT_ADMIN_ROLE
  const DEFAULT_ADMIN_ROLE = await escrow.DEFAULT_ADMIN_ROLE();
  const isAdmin = await escrow.hasRole(DEFAULT_ADMIN_ROLE, admin.address);
  console.log("Admin has DEFAULT_ADMIN_ROLE:", isAdmin);

  if (!isAdmin) {
    console.error("ERROR: The signer does not have DEFAULT_ADMIN_ROLE. Cannot grant roles.");
    process.exit(1);
  }

  // Check if Treasury already has ARBITER_ROLE
  const alreadyHasRole = await escrow.hasRole(ARBITER_ROLE, TREASURY_ADDRESS);
  if (alreadyHasRole) {
    console.log("Treasury already has ARBITER_ROLE. No action needed.");
    return;
  }

  // Grant ARBITER_ROLE to Treasury
  console.log(`Granting ARBITER_ROLE to Treasury (${TREASURY_ADDRESS})...`);
  const tx = await escrow.grantRole(ARBITER_ROLE, TREASURY_ADDRESS);
  console.log("Transaction hash:", tx.hash);

  await tx.wait();
  console.log("Transaction confirmed!");

  // Verify
  const hasRole = await escrow.hasRole(ARBITER_ROLE, TREASURY_ADDRESS);
  console.log("Treasury now has ARBITER_ROLE:", hasRole);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
