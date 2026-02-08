import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@openzeppelin/hardhat-upgrades";

const DEPLOYER_KEY = process.env.DEPLOYER_PRIVATE_KEY ?? "0x" + "00".repeat(32);

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: { enabled: true, runs: 200 },
      evmVersion: "paris",
    },
  },
  paths: {
    tests: "./test/escrow",
  },
  networks: {
    hardhat: {},
    sepolia: {
      url: "https://ethereum-sepolia-rpc.publicnode.com",
      accounts: [DEPLOYER_KEY],
      chainId: 11155111,
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY ?? "",
  },
};

export default config;
