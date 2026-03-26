"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { TransactionRecord, TransactionStatus } from "@/types/transaction";
import { serializeBigInt, deserializeBigInt } from "@/lib/utils";

interface TransactionStore {
  transactions: TransactionRecord[];
  addTransaction: (tx: TransactionRecord) => void;
  updateTransaction: (
    id: string,
    updates: Partial<TransactionRecord>
  ) => void;
  getByAddress: (address: string) => TransactionRecord[];
}

export const useTransactionStore = create<TransactionStore>()(
  persist(
    (set, get) => ({
      transactions: [],

      addTransaction: (tx) =>
        set((state) => ({
          transactions: [tx, ...state.transactions],
        })),

      updateTransaction: (id, updates) =>
        set((state) => ({
          transactions: state.transactions.map((tx) =>
            tx.id === id ? { ...tx, ...updates } : tx
          ),
        })),

      getByAddress: (address) => {
        const lower = address.toLowerCase();
        return get().transactions.filter(
          (tx) =>
            tx.from.toLowerCase() === lower || tx.to.toLowerCase() === lower
        );
      },
    }),
    {
      name: "op-bridge-transactions",
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          return deserializeBigInt(str) as ReturnType<
            typeof JSON.parse
          >;
        },
        setItem: (name, value) => {
          localStorage.setItem(name, serializeBigInt(value));
        },
        removeItem: (name) => {
          localStorage.removeItem(name);
        },
      },
    }
  )
);

export function useTransactionHistory(address?: string) {
  const { transactions, addTransaction, updateTransaction } =
    useTransactionStore();

  const userTransactions = address
    ? transactions.filter(
        (tx) =>
          tx.from.toLowerCase() === address.toLowerCase() ||
          tx.to.toLowerCase() === address.toLowerCase()
      )
    : [];

  const hasActionable = userTransactions.some(
    (tx) =>
      tx.status === "ready-to-prove" || tx.status === "ready-to-finalize"
  );

  const updateStatus = (id: string, status: TransactionStatus) =>
    updateTransaction(id, { status });

  return {
    transactions: userTransactions,
    addTransaction,
    updateTransaction,
    updateStatus,
    hasActionable,
  };
}
