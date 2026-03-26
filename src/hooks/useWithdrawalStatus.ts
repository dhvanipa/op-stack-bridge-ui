"use client";

import { useQuery } from "@tanstack/react-query";
import { publicClientL1 } from "@/lib/clients";
import { l2Chain } from "@/config/chains";
import { deserializeBigInt } from "@/lib/utils";
import type { TransactionRecord, WithdrawalStatus } from "@/types/transaction";

export function useWithdrawalStatus(tx: TransactionRecord | undefined) {
  const isWithdrawal = tx?.direction === "withdrawal";
  const isFinalized = tx?.status === "finalized";
  const hasReceipt = !!tx?.receiptData;

  return useQuery<WithdrawalStatus | null>({
    queryKey: ["withdrawalStatus", tx?.id],
    queryFn: async () => {
      if (!tx?.receiptData) return null;

      const receipt = deserializeBigInt(tx.receiptData) as Parameters<
        typeof publicClientL1.getWithdrawalStatus
      >[0]["receipt"];

      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const status = await publicClientL1.getWithdrawalStatus({
          receipt,
          targetChain: l2Chain,
        } as any);
        return status as WithdrawalStatus;
      } catch {
        return null;
      }
    },
    refetchInterval: 60_000,
    enabled: isWithdrawal && !isFinalized && hasReceipt,
  });
}
