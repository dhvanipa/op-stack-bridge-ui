"use client";

import { Badge } from "@/components/ui/badge";
import type { TransactionStatus } from "@/types/transaction";

const statusConfig: Record<
  TransactionStatus,
  { label: string; className: string; dot: string }
> = {
  pending: {
    label: "Pending",
    dot: "bg-yellow-400",
    className: "bg-yellow-500/10 text-yellow-400/90 border-yellow-500/20",
  },
  confirmed: {
    label: "Confirmed",
    dot: "bg-emerald-400",
    className: "bg-emerald-500/10 text-emerald-400/90 border-emerald-500/20",
  },
  "waiting-to-prove": {
    label: "Awaiting Proof",
    dot: "bg-yellow-400",
    className: "bg-yellow-500/10 text-yellow-400/90 border-yellow-500/20",
  },
  "ready-to-prove": {
    label: "Ready to Prove",
    dot: "bg-indigo-400 animate-pulse",
    className: "bg-indigo-500/10 text-indigo-400/90 border-indigo-500/20",
  },
  "waiting-to-finalize": {
    label: "Awaiting Finalize",
    dot: "bg-yellow-400",
    className: "bg-yellow-500/10 text-yellow-400/90 border-yellow-500/20",
  },
  "ready-to-finalize": {
    label: "Ready to Finalize",
    dot: "bg-indigo-400 animate-pulse",
    className: "bg-indigo-500/10 text-indigo-400/90 border-indigo-500/20",
  },
  finalized: {
    label: "Complete",
    dot: "bg-emerald-400",
    className: "bg-emerald-500/10 text-emerald-400/90 border-emerald-500/20",
  },
};

export function StatusBadge({ status }: { status: TransactionStatus }) {
  const config = statusConfig[status];
  return (
    <Badge variant="outline" className={`${config.className} gap-1.5 font-medium text-[11px] tracking-wide`}>
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </Badge>
  );
}
