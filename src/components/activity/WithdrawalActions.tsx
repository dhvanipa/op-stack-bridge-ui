"use client";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useProveWithdrawal } from "@/hooks/useProveWithdrawal";
import { useFinalizeWithdrawal } from "@/hooks/useFinalizeWithdrawal";
import { useTransactionHistory } from "@/hooks/useTransactionHistory";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { bridgeConfig } from "@/config/bridge.config";
import { toast } from "sonner";
import type { TransactionRecord } from "@/types/transaction";
import { useEffect } from "react";

interface WithdrawalActionsProps {
  tx: TransactionRecord;
}

export function WithdrawalActions({ tx }: WithdrawalActionsProps) {
  const { address } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { updateTransaction } = useTransactionHistory(address);
  const {
    prove,
    isLoading: isProving,
    error: proveError,
    txHash: proveHash,
  } = useProveWithdrawal();
  const {
    finalize,
    isLoading: isFinalizing,
    error: finalizeError,
    txHash: finalizeHash,
  } = useFinalizeWithdrawal();

  const needsL1 = chainId !== bridgeConfig.l1.chainId;

  useEffect(() => {
    if (proveHash) {
      updateTransaction(tx.id, {
        status: "waiting-to-finalize",
        proveTxHash: proveHash,
      });
      toast.success("Withdrawal proved! Finalization available in ~7 days.");
    }
  }, [proveHash, tx.id, updateTransaction]);

  useEffect(() => {
    if (finalizeHash) {
      updateTransaction(tx.id, {
        status: "finalized",
        finalizeTxHash: finalizeHash,
      });
      toast.success("Withdrawal finalized! Funds are now on L1.");
    }
  }, [finalizeHash, tx.id, updateTransaction]);

  useEffect(() => {
    if (proveError) toast.error(proveError);
    if (finalizeError) toast.error(finalizeError);
  }, [proveError, finalizeError]);

  if (tx.status === "waiting-to-prove") {
    return (
      <span className="text-xs text-muted-foreground">
        Waiting for output root (~1 hour)
      </span>
    );
  }

  if (tx.status === "ready-to-prove") {
    if (needsL1) {
      return (
        <Button
          size="sm"
          variant="secondary"
          onClick={() => switchChain({ chainId: bridgeConfig.l1.chainId })}
        >
          Switch to {bridgeConfig.l1.name}
        </Button>
      );
    }
    return (
      <Button
        size="sm"
        onClick={() => prove(tx)}
        disabled={isProving}
        className="bg-indigo-600 hover:bg-indigo-700"
      >
        {isProving ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          "Prove"
        )}
      </Button>
    );
  }

  if (tx.status === "waiting-to-finalize") {
    return (
      <span className="text-xs text-muted-foreground">
        Challenge period (~7 days)
      </span>
    );
  }

  if (tx.status === "ready-to-finalize") {
    if (needsL1) {
      return (
        <Button
          size="sm"
          variant="secondary"
          onClick={() => switchChain({ chainId: bridgeConfig.l1.chainId })}
        >
          Switch to {bridgeConfig.l1.name}
        </Button>
      );
    }
    return (
      <Button
        size="sm"
        onClick={() => finalize(tx)}
        disabled={isFinalizing}
        className="bg-indigo-600 hover:bg-indigo-700"
      >
        {isFinalizing ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          "Finalize"
        )}
      </Button>
    );
  }

  return null;
}
