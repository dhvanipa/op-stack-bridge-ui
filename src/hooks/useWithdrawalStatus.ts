"use client";

import { useQuery } from "@tanstack/react-query";
import { publicClientL1, publicClientL2 } from "@/lib/clients";
import { l2Chain } from "@/config/chains";
import { deserializeBigInt, validateReceiptShape } from "@/lib/utils";
import type { TransactionRecord, WithdrawalStatus } from "@/types/transaction";

type WithdrawalReceipt = Parameters<
  typeof publicClientL1.getWithdrawalStatus
>[0]["receipt"];

export function useWithdrawalStatus(tx: TransactionRecord | undefined) {
  const isWithdrawal = tx?.direction === "withdrawal";
  const isFinalized = tx?.status === "finalized";
  const canResolveReceipt = !!tx?.receiptData || !!tx?.l2TxHash;

  return useQuery<WithdrawalStatus | null>({
    queryKey: ["withdrawalStatus", tx?.id],
    queryFn: async () => {
      if (!tx) return null;

      let receipt: WithdrawalReceipt | null = null;

      if (tx.receiptData) {
        const parsed = deserializeBigInt(tx.receiptData);
        if (!validateReceiptShape(parsed)) {
          console.error("Invalid receipt data for tx", tx.id);
          return null;
        }
        receipt = parsed as WithdrawalReceipt;
      } else if (tx.l2TxHash) {
        receipt = (await publicClientL2.getTransactionReceipt({
          hash: tx.l2TxHash,
        })) as unknown as WithdrawalReceipt;
      }

      if (!receipt) return null;

      try {
        const status = await publicClientL1.getWithdrawalStatus({
          receipt,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          targetChain: l2Chain as any,
        });
        return status as WithdrawalStatus;
      } catch {
        return null;
      }
    },
    refetchInterval: 60_000,
    enabled: isWithdrawal && !isFinalized && canResolveReceipt,
  });
}
