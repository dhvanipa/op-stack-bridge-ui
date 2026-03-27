"use client";

import { useState, useCallback } from "react";
import { useWalletClient } from "wagmi";
import { walletActionsL1 } from "viem/op-stack";
import { publicClientL1, publicClientL2 } from "@/lib/clients";
import { l2Chain } from "@/config/chains";
import { deserializeBigInt, classifyTransactionError } from "@/lib/utils";
import { getWithdrawals } from "viem/op-stack";
import type { TransactionRecord } from "@/types/transaction";

type WithdrawalReceipt = Parameters<
  typeof publicClientL1.getWithdrawalStatus
>[0]["receipt"];

async function resolveReceipt(tx: TransactionRecord): Promise<WithdrawalReceipt | null> {
  if (tx.receiptData) {
    return deserializeBigInt(tx.receiptData) as WithdrawalReceipt;
  }
  if (tx.l2TxHash) {
    return (await publicClientL2.getTransactionReceipt({
      hash: tx.l2TxHash,
    })) as unknown as WithdrawalReceipt;
  }
  return null;
}

export function useFinalizeWithdrawal() {
  const { data: walletClient } = useWalletClient();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

  const finalize = useCallback(
    async (tx: TransactionRecord) => {
      if (!walletClient) return;

      setIsLoading(true);
      setError(undefined);
      setTxHash(undefined);

      try {
        const l1Wallet = walletClient.extend(walletActionsL1());
        const receipt = await resolveReceipt(tx);
        if (!receipt) return;

        const [withdrawal] = getWithdrawals(receipt as Parameters<typeof getWithdrawals>[0]);

        const hash = await l1Wallet.finalizeWithdrawal({
          withdrawal,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          targetChain: l2Chain as any,
        });

        setTxHash(hash);
        return hash;
      } catch (err) {
        console.error("Finalize error:", err);
        setError(classifyTransactionError(err, "Finalize withdrawal failed. Please try again."));
      } finally {
        setIsLoading(false);
      }
    },
    [walletClient]
  );

  return { finalize, isLoading, txHash, error };
}
