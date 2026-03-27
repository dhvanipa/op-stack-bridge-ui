// Classify block explorer transactions as deposits or withdrawals
// by matching contract addresses and decoding calldata

import { decodeFunctionData } from "viem";
import { bridgeConfig } from "@/config/bridge.config";
import { L1StandardBridgeABI, L2StandardBridgeABI } from "@/lib/abis";
import { L2_TO_L1_MESSAGE_PASSER, L2_STANDARD_BRIDGE } from "@/lib/constants";
import type { BlockExplorerTransaction } from "@/lib/explorer";

const DEPOSIT_FUNCTIONS = ["bridgeETH", "bridgeETHTo", "bridgeERC20To"];
const WITHDRAWAL_FUNCTIONS = ["bridgeETH", "bridgeETHTo", "bridgeERC20To"];

export function isDeposit(tx: BlockExplorerTransaction): boolean {
  const to = tx.to.toLowerCase();

  // ETH deposit via OptimismPortal (direct value transfer)
  if (
    to === bridgeConfig.contracts.OptimismPortalProxy.toLowerCase() &&
    tx.value !== "0"
  ) {
    return true;
  }

  // ERC-20 or ETH deposit via L1StandardBridge
  if (to === bridgeConfig.contracts.L1StandardBridgeProxy.toLowerCase()) {
    try {
      const { functionName } = decodeFunctionData({
        abi: L1StandardBridgeABI,
        data: tx.input as `0x${string}`,
      });
      return DEPOSIT_FUNCTIONS.includes(functionName);
    } catch {
      return false;
    }
  }

  return false;
}

export function isWithdrawal(tx: BlockExplorerTransaction): boolean {
  const to = tx.to.toLowerCase();

  // ETH withdrawal via L2ToL1MessagePasser (initiateWithdrawal)
  if (to === L2_TO_L1_MESSAGE_PASSER.toLowerCase() && tx.value !== "0") {
    return true;
  }

  // ETH or ERC-20 withdrawal via L2StandardBridge
  if (to === L2_STANDARD_BRIDGE.toLowerCase()) {
    try {
      const { functionName } = decodeFunctionData({
        abi: L2StandardBridgeABI,
        data: tx.input as `0x${string}`,
      });
      return WITHDRAWAL_FUNCTIONS.includes(functionName);
    } catch {
      return false;
    }
  }

  return false;
}
