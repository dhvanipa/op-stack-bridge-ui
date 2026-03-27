"use client";

import { useState, useCallback } from "react";
import { useWalletClient } from "wagmi";
import { walletActionsL1 } from "viem/op-stack";
import { publicClientL1, publicClientL2 } from "@/lib/clients";
import { l2Chain } from "@/config/chains";
import { deserializeBigInt } from "@/lib/utils";

import type { TransactionRecord } from "@/types/transaction";

export function useProveWithdrawal() {
  const { data: walletClient } = useWalletClient();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

  const prove = useCallback(
    async (tx: TransactionRecord) => {
      if (!walletClient || !tx.receiptData) return;

      setIsLoading(true);
      setError(undefined);
      setTxHash(undefined);

      try {
        const l1Wallet = walletClient.extend(walletActionsL1());
        const receipt = deserializeBigInt(tx.receiptData) as Parameters<
          typeof publicClientL1.getWithdrawalStatus
        >[0]["receipt"];

        // Build prove args — waitToProve resolves quickly if status is ready-to-prove
        const { output, withdrawal: withdrawalForProof } =
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await publicClientL1.waitToProve({
            receipt: receipt!,
            targetChain: l2Chain,
          } as any);

        // Build the prove withdrawal parameters
        const proveArgs = await publicClientL2.buildProveWithdrawal({
          output,
          withdrawal: withdrawalForProof,
        });

        // Execute prove on L1
        const hash = await l1Wallet.proveWithdrawal({
          ...proveArgs,
          targetChain: l2Chain,
        } as Parameters<typeof l1Wallet.proveWithdrawal>[0]);

        setTxHash(hash);
        return hash;
      } catch (err) {
        console.error("Prove error:", err);
        const message =
          err instanceof Error ? err.message : "";
        if (message.includes("User rejected") || message.includes("denied")) {
          setError("Transaction rejected by user");
        } else if (message.includes("insufficient funds")) {
          setError("Insufficient funds for gas");
        } else {
          setError("Prove withdrawal failed. Please try again.");
        }
      } finally {
        setIsLoading(false);
      }
    },
    [walletClient]
  );

  return { prove, isLoading, txHash, error };
}
