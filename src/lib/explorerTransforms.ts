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
): { amount: string; tokenSymbol: string; tokenDecimals: number } {
  // Try decoding calldata for ERC-20 bridge calls
  try {
    const { functionName, args } = decodeFunctionData({
      abi,
      data: tx.input as `0x${string}`,
    });

    if (functionName === "bridgeERC20To" && args) {
      const localToken = (args[0] as string).toLowerCase();
      const rawAmount = args[3] as bigint;

      // Match token from config
      const token = bridgeConfig.tokens.find((t) => {
        const addr =
          direction === "deposit" ? t.l1Address : t.l2Address;
        return typeof addr === "string" && addr.toLowerCase() === localToken;
      });

      return {
        amount: rawAmount.toString(),
        tokenSymbol: token?.symbol ?? "ERC20",
        tokenDecimals: token?.decimals ?? 18,
      };
    }
  } catch {
    // Not an ERC-20 call, fall through to ETH
  }

  // Native ETH transfer — store raw wei value
  return {
    amount: tx.value,
    tokenSymbol: bridgeConfig.l1.nativeCurrency.symbol,
    tokenDecimals: bridgeConfig.l1.nativeCurrency.decimals,
  };
}

export function explorerTxToDeposit(
  tx: BlockExplorerTransaction
): TransactionRecord {
  const { amount, tokenSymbol, tokenDecimals } = decodeAmountAndToken(
    tx,
    L1StandardBridgeABI,
    "deposit"
  );

  return {
    id: tx.hash,
    direction: "deposit",
    status: "confirmed",
    l1TxHash: tx.hash as `0x${string}`,
    amount,
    tokenSymbol,
    tokenDecimals,
    from: tx.from as `0x${string}`,
    to: tx.from as `0x${string}`,
    timestamp: parseInt(tx.timeStamp) * 1000,
  };
}

export function explorerTxToWithdrawal(
  tx: BlockExplorerTransaction
): TransactionRecord {
  const { amount, tokenSymbol, tokenDecimals } = decodeAmountAndToken(
    tx,
    L2StandardBridgeABI,
    "withdrawal"
  );

  return {
    id: tx.hash,
    direction: "withdrawal",
    status: "waiting-to-prove",
    l2TxHash: tx.hash as `0x${string}`,
    amount,
    tokenSymbol,
    tokenDecimals,
    from: tx.from as `0x${string}`,
    to: tx.from as `0x${string}`,
    timestamp: parseInt(tx.timeStamp) * 1000,
  };
}
