// ============================================================================
// BRIDGE CONFIGURATION
// This is the ONLY file you need to edit to deploy your own OP Stack bridge UI.
// Fill in your chain details, contract addresses, and supported tokens below.
// ============================================================================

import type { BridgeConfig } from "@/types/bridge";

export const bridgeConfig: BridgeConfig = {
  // ── Branding ──────────────────────────────────────────────────────────
  appName: "DUST Bridge",
  logoUrl: "/dust.png",
  theme: {
    primaryColor: "#6366f1",
    gradientFrom: "#0f0c29",
    gradientTo: "#302b63",
  },

  // ── L1 (Settlement Layer) ─────────────────────────────────────────────
  l1: {
    chainId: 1,
    name: "Ethereum",
    rpcUrl: "https://ethereum-rpc.publicnode.com",
    blockExplorer: "https://etherscan.io",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    iconUrl: "/ethereum.svg",
  },

  // ── L2 (Your OP Stack Rollup) ─────────────────────────────────────────
  l2: {
    chainId: 55378, // Replace with your L2 chain ID
    name: "DUST Mainnet", // Replace with your L2 name
    rpcUrl: "https://rpc.dustproject.org", // Replace with your L2 RPC
    blockExplorer: "https://explorer.dustproject.org", // Replace with your explorer
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    iconUrl: "/dust.png", // Replace with your L2 chain icon
  },

  // ── L1 Contract Addresses (from your op-deployer output) ──────────────
  contracts: {
    OptimismPortalProxy: "0xf573a6da7a5b5de9fbadfc26cffc595ad04dc7d4",
    L1StandardBridgeProxy: "0x74dc019e8ea61aca7e9136ac6d97047201776517",
    L1CrossDomainMessengerProxy: "0x554af8ef8faa88d2de11f07593a9d7577cf20d03",
    DisputeGameFactoryProxy: "0xfcd88154a329557499535e7c803f3b3bd7fa1115",
  },

  // ── Supported Tokens ──────────────────────────────────────────────────
  tokens: [
    {
      symbol: "ETH",
      name: "Ether",
      decimals: 18,
      l1Address: "native",
      l2Address: "native",
    },
    // Add ERC-20 tokens here:
    // {
    //   symbol: "USDC",
    //   name: "USD Coin",
    //   decimals: 6,
    //   l1Address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    //   l2Address: "0x7F5c764cBc14f9669B88837ca1490cCa17c31607",
    // },
  ],
};
