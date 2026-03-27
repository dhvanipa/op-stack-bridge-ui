"use client";

import { ArrowDown, ArrowUp, ExternalLink } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { WithdrawalActions } from "./WithdrawalActions";
import { formatTimeAgo } from "@/lib/utils";
import { formatUnits } from "viem";
import { bridgeConfig } from "@/config/bridge.config";
import type { TransactionRecord } from "@/types/transaction";
import { useWithdrawalStatus } from "@/hooks/useWithdrawalStatus";
import { useTransactionHistory } from "@/hooks/useTransactionHistory";
import { useAccount } from "wagmi";
import { useEffect } from "react";

export function TransactionItem({ tx }: { tx: TransactionRecord }) {
  const { address } = useAccount();
  const { updateStatus } = useTransactionHistory(address);
  const { data: liveStatus } = useWithdrawalStatus(tx);

  // Update stored status when live status changes
  useEffect(() => {
    if (liveStatus && liveStatus !== tx.status) {
      updateStatus(tx.id, liveStatus);
    }
  }, [liveStatus, tx.id, tx.status, updateStatus]);

  const isDeposit = tx.direction === "deposit";
  const explorer = isDeposit
    ? bridgeConfig.l1.blockExplorer
    : bridgeConfig.l2.blockExplorer;
  const txHashForLink = isDeposit ? tx.l1TxHash : tx.l2TxHash;

  return (
    <div className="group rounded-xl border border-white/[0.06] bg-white/[0.03] p-3.5 transition-all duration-200 hover:bg-white/[0.05] hover:border-white/[0.1]">
      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
            isDeposit
              ? "bg-emerald-500/15 text-emerald-400"
              : "bg-orange-500/15 text-orange-400"
          }`}
        >
          {isDeposit ? (
            <ArrowDown className="h-4 w-4" />
          ) : (
            <ArrowUp className="h-4 w-4" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium text-sm tracking-tight">
              {isDeposit ? "Deposit" : "Withdrawal"}
            </span>
            <StatusBadge status={tx.status} />
          </div>

          <p className="text-sm font-mono text-white/50 mt-1">
            {formatUnits(BigInt(tx.amount), tx.tokenDecimals)} {tx.tokenSymbol}
          </p>

          <div className="flex items-center justify-between mt-2.5">
            <span className="text-xs text-white/30">
              {formatTimeAgo(tx.timestamp)}
            </span>

            <div className="flex items-center gap-2">
              {txHashForLink && (
                <a
                  href={`${explorer}/tx/${txHashForLink}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/20 hover:text-white/60 transition-colors duration-200"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          </div>

          {tx.direction === "withdrawal" && tx.status !== "finalized" && (
            <div className="mt-2.5 flex justify-end">
              <WithdrawalActions tx={tx} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
