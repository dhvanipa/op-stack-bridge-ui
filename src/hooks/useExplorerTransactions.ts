"use client";

import { useQuery } from "@tanstack/react-query";
import { bridgeConfig } from "@/config/bridge.config";
import { fetchExplorerTxList } from "@/lib/explorer";
import { isDeposit, isWithdrawal } from "@/lib/explorerFilters";
import {
  explorerTxToDeposit,
  explorerTxToWithdrawal,
} from "@/lib/explorerTransforms";
import type { TransactionRecord } from "@/types/transaction";

export function useExplorerTransactions(address?: string) {
  const l1ApiUrl = bridgeConfig.l1.explorerApiUrl;
  const l2ApiUrl = bridgeConfig.l2.explorerApiUrl;

  const deposits = useQuery<TransactionRecord[]>({
    queryKey: ["explorerDeposits", address],
    queryFn: async () => {
      if (!l1ApiUrl || !address) return [];
      const txs = await fetchExplorerTxList(l1ApiUrl, address);
      return txs.filter(isDeposit).map(explorerTxToDeposit);
    },
    enabled: !!address && !!l1ApiUrl,
    staleTime: 60_000,
    refetchInterval: 60_000,
    retry: 1,
    retryDelay: 5000,
  });

  const withdrawals = useQuery<TransactionRecord[]>({
    queryKey: ["explorerWithdrawals", address],
    queryFn: async () => {
      if (!l2ApiUrl || !address) return [];
      const txs = await fetchExplorerTxList(l2ApiUrl, address, {
        filterby: "from",
      });
      return txs.filter(isWithdrawal).map(explorerTxToWithdrawal);
    },
    enabled: !!address && !!l2ApiUrl,
    staleTime: 60_000,
    refetchInterval: 60_000,
    retry: 1,
    retryDelay: 5000,
  });

  return {
    deposits: deposits.data ?? [],
    withdrawals: withdrawals.data ?? [],
    isLoading: deposits.isLoading || withdrawals.isLoading,
    isError: deposits.isError || withdrawals.isError,
  };
}
