"use client";

import { useMemo, useEffect, useRef } from "react";
import { useTransactionHistory, useTransactionStore } from "@/hooks/useTransactionHistory";
import { useExplorerTransactions } from "@/hooks/useExplorerTransactions";
import { reconstructReceiptData } from "@/lib/reconstructReceipt";
import type { TransactionRecord } from "@/types/transaction";

// Max concurrent receipt fetches to avoid flooding the RPC
const MAX_CONCURRENT_HYDRATIONS = 3;

export function useMergedTransactions(address?: string) {
  const {
    transactions: localTransactions,
    addTransaction,
    updateTransaction,
    updateStatus,
  } = useTransactionHistory(address);

  const {
    deposits: explorerDeposits,
    withdrawals: explorerWithdrawals,
    isLoading: isLoadingExplorer,
  } = useExplorerTransactions(address);

  // Track which receipts we're currently hydrating to avoid duplicates
  const hydratingRef = useRef<Set<string>>(new Set());

  // Merge: explorer first, then localStorage overlays (localStorage wins)
  const transactions = useMemo(() => {
    const map = new Map<string, TransactionRecord>();

    // Insert explorer transactions first
    for (const tx of explorerDeposits) {
      map.set(tx.id, tx);
    }
    for (const tx of explorerWithdrawals) {
      map.set(tx.id, tx);
    }

    // Overlay localStorage transactions (richer data wins)
    for (const tx of localTransactions) {
      const existing = map.get(tx.id);
      if (existing) {
        // Merge: keep all localStorage fields, fill in any missing from explorer
        map.set(tx.id, { ...existing, ...tx });
      } else {
        map.set(tx.id, tx);
      }
    }

    // Sort by timestamp descending (newest first)
    return Array.from(map.values()).sort(
      (a, b) => b.timestamp - a.timestamp
    );
  }, [localTransactions, explorerDeposits, explorerWithdrawals]);

  // Hydrate missing receipts for withdrawals discovered via explorer
  const updateTransactionStore = useTransactionStore(
    (s) => s.updateTransaction
  );
  const addTransactionStore = useTransactionStore((s) => s.addTransaction);

  useEffect(() => {
    let cancelled = false;

    const withdrawalsNeedingReceipts = transactions.filter(
      (tx) =>
        tx.direction === "withdrawal" &&
        !tx.receiptData &&
        tx.l2TxHash &&
        tx.status !== "finalized" &&
        !hydratingRef.current.has(tx.id)
    );

    // Process in batches
    const batch = withdrawalsNeedingReceipts.slice(
      0,
      MAX_CONCURRENT_HYDRATIONS
    );

    for (const tx of batch) {
      hydratingRef.current.add(tx.id);

      reconstructReceiptData(tx.l2TxHash!)
        .then((receiptData) => {
          if (cancelled) return;

          // Persist to Zustand store so it survives and doesn't need re-fetching
          const existsInStore = useTransactionStore
            .getState()
            .transactions.some((t) => t.id === tx.id);

          if (existsInStore) {
            updateTransactionStore(tx.id, { receiptData });
          } else {
            // Explorer-only tx: add to store with receipt data
            addTransactionStore({ ...tx, receiptData });
          }
        })
        .catch((err) => {
          console.error(
            `Failed to reconstruct receipt for ${tx.l2TxHash}:`,
            err
          );
        })
        .finally(() => {
          hydratingRef.current.delete(tx.id);
        });
    }

    return () => {
      cancelled = true;
    };
  }, [transactions, updateTransactionStore, addTransactionStore]);

  const hasActionable = transactions.some(
    (tx) =>
      tx.status === "ready-to-prove" || tx.status === "ready-to-finalize"
  );

  return {
    transactions,
    addTransaction,
    updateTransaction,
    updateStatus,
    hasActionable,
    isLoadingExplorer,
  };
}
