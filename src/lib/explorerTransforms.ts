// Convert raw block explorer transactions into TransactionRecord objects

import { decodeFunctionData } from "viem";
import { bridgeConfig } from "@/config/bridge.config";
import { L1StandardBridgeABI, L2StandardBridgeABI } from "@/lib/abis";
import type { BlockExplorerTransaction } from "@/lib/explorer";
import type { TransactionRecord } from "@/types/transaction";

function decodeAmountAndToken(
  tx: BlockExplorerTransaction,
  abi: typeof L1StandardBridgeABI | typeof L2StandardBridgeABI,
  direction: "deposit" | "withdrawal"
): { amount: string; tokenSymbol: string } {
  // Try decoding calldata for ERC-20 bridge calls
  try {
    const { functionName, args } = decodeFunctionData({
      abi,
      data: tx.input as `0x${string}`,
    });

    if (functionName === "bridgeERC20To" && args) {
      const localToken = (args[0] as string).toLowerCase();
      const amount = (args[3] as bigint).toString();

      // Match token from config
      const token = bridgeConfig.tokens.find((t) => {
        const addr =
          direction === "deposit" ? t.l1Address : t.l2Address;
        return typeof addr === "string" && addr.toLowerCase() === localToken;
      });

      return {
        amount,
        tokenSymbol: token?.symbol ?? "ERC20",
      };
    }
  } catch {
    // Not an ERC-20 call, fall through to ETH
  }

  // Native ETH transfer
  return {
    amount: tx.value,
    tokenSymbol: bridgeConfig.l1.nativeCurrency.symbol,
  };
}

export function explorerTxToDeposit(
  tx: BlockExplorerTransaction
): TransactionRecord {
  const { amount, tokenSymbol } = decodeAmountAndToken(
    tx,
    L1StandardBridgeABI,
    "deposit"
  );

  return {
    id: tx.hash,
    direction: "deposit",
    status: "confirmed", // on-chain deposits are always confirmed
    l1TxHash: tx.hash as `0x${string}`,
    amount,
    tokenSymbol,
    from: tx.from as `0x${string}`,
    to: tx.from as `0x${string}`, // bridge sends to self by default
    timestamp: parseInt(tx.timeStamp) * 1000,
  };
}

export function explorerTxToWithdrawal(
  tx: BlockExplorerTransaction
): TransactionRecord {
  const { amount, tokenSymbol } = decodeAmountAndToken(
    tx,
    L2StandardBridgeABI,
    "withdrawal"
  );

  return {
    id: tx.hash,
    direction: "withdrawal",
    status: "waiting-to-prove", // will be updated by status polling
    l2TxHash: tx.hash as `0x${string}`,
    amount,
    tokenSymbol,
    from: tx.from as `0x${string}`,
    to: tx.from as `0x${string}`,
    timestamp: parseInt(tx.timeStamp) * 1000,
  };
}
