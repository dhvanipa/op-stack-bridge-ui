"use client";

import { useState, useCallback } from "react";
import { useWalletClient } from "wagmi";
import { walletActionsL1 } from "viem/op-stack";
import { publicClientL1, publicClientL2 } from "@/lib/clients";
import { l2Chain } from "@/config/chains";
import { deserializeBigInt, classifyTransactionError, validateReceiptShape } from "@/lib/utils";

import type { TransactionRecord } from "@/types/transaction";

type WithdrawalReceipt = Parameters<
  typeof publicClientL1.getWithdrawalStatus
>[0]["receipt"];

async function resolveReceipt(tx: TransactionRecord): Promise<WithdrawalReceipt | null> {
  if (tx.receiptData) {
    const parsed = deserializeBigInt(tx.receiptData);
    if (!validateReceiptShape(parsed)) {
      console.error("Invalid receipt data for tx", tx.id);
      return null;
    }
    return parsed as WithdrawalReceipt;
  }
  if (tx.l2TxHash) {
    return (await publicClientL2.getTransactionReceipt({
      hash: tx.l2TxHash,
    })) as unknown as WithdrawalReceipt;
  }
  return null;
}

interface UseProveWithdrawalOptions {
  onSuccess?: (txId: string, proveTxHash: `0x${string}`) => void;
}

export function useProveWithdrawal({ onSuccess }: UseProveWithdrawalOptions = {}) {
  const { data: walletClient } = useWalletClient();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

  const prove = useCallback(
    async (tx: TransactionRecord) => {
      if (!walletClient) return;

      setIsLoading(true);
      setError(undefined);
      setTxHash(undefined);

      try {
        const l1Wallet = walletClient.extend(walletActionsL1());
        const receipt = await resolveReceipt(tx);
        if (!receipt) return;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const targetChain = l2Chain as any;

        const { output, withdrawal: withdrawalForProof } =
          await publicClientL1.waitToProve({
            receipt: receipt!,
            targetChain,
          });

        const proveArgs = await publicClientL2.buildProveWithdrawal({
          output,
          withdrawal: withdrawalForProof,
        });

        const hash = await l1Wallet.proveWithdrawal({
          ...proveArgs,
          targetChain,
        });

        setTxHash(hash);

        // Persist status update immediately so it survives component unmount
        onSuccess?.(tx.id, hash);

        return hash;
      } catch (err) {
        console.error("Prove error:", err);
        setError(classifyTransactionError(err, "Prove withdrawal failed. Please try again."));
      } finally {
        setIsLoading(false);
      }
    },
    [walletClient, onSuccess]
  );

  return { prove, isLoading, txHash, error };
}
