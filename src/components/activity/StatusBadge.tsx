"use client";

import { Badge } from "@/components/ui/badge";
import type { TransactionStatus } from "@/types/transaction";

const statusConfig: Record<
  TransactionStatus,
  { label: string; className: string }
> = {
  pending: {
    label: "Pending",
    className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  },
  confirmed: {
    label: "Confirmed",
    className: "bg-green-500/20 text-green-400 border-green-500/30",
  },
  "waiting-to-prove": {
    label: "Waiting to Prove",
    className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  },
  "ready-to-prove": {
    label: "Ready to Prove",
    className:
      "bg-indigo-500/20 text-indigo-400 border-indigo-500/30 animate-pulse-subtle",
  },
  "waiting-to-finalize": {
    label: "Waiting to Finalize",
    className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  },
  "ready-to-finalize": {
    label: "Ready to Finalize",
    className:
      "bg-indigo-500/20 text-indigo-400 border-indigo-500/30 animate-pulse-subtle",
  },
  finalized: {
    label: "Complete",
    className: "bg-green-500/20 text-green-400 border-green-500/30",
  },
};

export function StatusBadge({ status }: { status: TransactionStatus }) {
  const config = statusConfig[status];
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}
