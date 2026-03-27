"use client";

import { useState, useCallback } from "react";
import { useWalletClient } from "wagmi";
import { walletActionsL1 } from "viem/op-stack";
import { publicClientL1, publicClientL2 } from "@/lib/clients";
import { l2Chain } from "@/config/chains";
import { deserializeBigInt, classifyTransactionError } from "@/lib/utils";

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

export function useProveWithdrawal() {
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

        // Build prove args — waitToProve resolves quickly if status is ready-to-prove
        // l2Chain from defineChain is a generic Chain; OP Stack actions need typed
        // contract addresses. Contracts are configured at runtime in chains.ts.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const targetChain = l2Chain as any;

        const { output, withdrawal: withdrawalForProof } =
          await publicClientL1.waitToProve({
            receipt: receipt!,
            targetChain,
          });

        // Build the prove withdrawal parameters
        const proveArgs = await publicClientL2.buildProveWithdrawal({
          output,
          withdrawal: withdrawalForProof,
        });

        // Execute prove on L1
        const hash = await l1Wallet.proveWithdrawal({
          ...proveArgs,
          targetChain,
        });

        setTxHash(hash);
        return hash;
      } catch (err) {
        console.error("Prove error:", err);
        setError(classifyTransactionError(err, "Prove withdrawal failed. Please try again."));
      } finally {
        setIsLoading(false);
      }
    },
    [walletClient]
  );

  return { prove, isLoading, txHash, error };
}
