"use client";

import { useState, useCallback } from "react";
import { useWalletClient } from "wagmi";
import { walletActionsL1 } from "viem/op-stack";
import { publicClientL1 } from "@/lib/clients";
import { l2Chain } from "@/config/chains";
import { deserializeBigInt } from "@/lib/utils";
import { getWithdrawals } from "viem/op-stack";
import type { TransactionRecord } from "@/types/transaction";

export function useFinalizeWithdrawal() {
  const { data: walletClient } = useWalletClient();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

  const finalize = useCallback(
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

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const [withdrawal] = getWithdrawals(receipt as any);

        const hash = await l1Wallet.finalizeWithdrawal({
          withdrawal,
          targetChain: l2Chain,
        } as Parameters<typeof l1Wallet.finalizeWithdrawal>[0]);

        setTxHash(hash);
        return hash;
      } catch (err) {
        console.error("Finalize error:", err);
        const message =
          err instanceof Error ? err.message : "";
        if (message.includes("User rejected") || message.includes("denied")) {
          setError("Transaction rejected by user");
        } else if (message.includes("insufficient funds")) {
          setError("Insufficient funds for gas");
        } else {
          setError("Finalize withdrawal failed. Please try again.");
        }
      } finally {
        setIsLoading(false);
      }
    },
    [walletClient]
  );

  return { finalize, isLoading, txHash, error };
}
