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
    <div className="flex items-start gap-3 rounded-lg border border-white/5 bg-white/5 p-3">
      <div
        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
          isDeposit ? "bg-green-500/20" : "bg-orange-500/20"
        }`}
      >
        {isDeposit ? (
          <ArrowDown className="h-4 w-4 text-green-400" />
        ) : (
          <ArrowUp className="h-4 w-4 text-orange-400" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="font-medium text-sm">
            {isDeposit ? "Deposit" : "Withdrawal"}
          </span>
          <StatusBadge status={tx.status} />
        </div>

        <p className="text-sm text-muted-foreground mt-0.5">
          {formatUnits(BigInt(tx.amount), tx.tokenDecimals)} {tx.tokenSymbol}
        </p>

        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-muted-foreground">
            {formatTimeAgo(tx.timestamp)}
          </span>

          <div className="flex items-center gap-2">
            {txHashForLink && (
              <a
                href={`${explorer}/tx/${txHashForLink}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-white"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        </div>

        {tx.direction === "withdrawal" && tx.status !== "finalized" && (
          <div className="mt-2 flex justify-end">
            <WithdrawalActions tx={tx} />
          </div>
        )}
      </div>
    </div>
  );
}
