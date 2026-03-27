"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { bridgeConfig } from "@/config/bridge.config";
import { Loader2, ExternalLink, CheckCircle2, ArrowRight } from "lucide-react";
import {
  DEPOSIT_CONFIRMATION_MINUTES,
  FINALIZE_WAIT_DAYS,
} from "@/lib/constants";
import type { BridgeDirection } from "@/types/transaction";
import type { TokenConfig } from "@/types/bridge";
import { useState } from "react";

interface ReviewModalProps {
  open: boolean;
  onClose: () => void;
  direction: BridgeDirection;
  amount: string;
  token: TokenConfig;
  onConfirm: () => void;
  isConfirming: boolean;
  txHash?: string;
  isSuccess?: boolean;
  error?: string;
}

function getInitialChecks(dir: BridgeDirection) {
  return dir === "deposit" ? [false] : [false, false, false];
}

export function ReviewModal({
  open,
  onClose,
  direction,
  amount,
  token,
  onConfirm,
  isConfirming,
  txHash,
  isSuccess,
  error,
}: ReviewModalProps) {
  const [prevDirection, setPrevDirection] = useState(direction);
  const [checks, setChecks] = useState<boolean[]>(getInitialChecks(direction));

  if (prevDirection !== direction) {
    setPrevDirection(direction);
    setChecks(getInitialChecks(direction));
  }

  const allChecked = checks.length > 0 && checks.every(Boolean);
  const fromChain =
    direction === "deposit" ? bridgeConfig.l1.name : bridgeConfig.l2.name;
  const toChain =
    direction === "deposit" ? bridgeConfig.l2.name : bridgeConfig.l1.name;
  const explorer =
    direction === "deposit"
      ? bridgeConfig.l1.blockExplorer
      : bridgeConfig.l2.blockExplorer;

  const toggleCheck = (i: number) => {
    setChecks((prev) => {
      const next = [...prev];
      next[i] = !next[i];
      return next;
    });
  };

  const handleClose = () => {
    setChecks(direction === "deposit" ? [false] : [false, false, false]);
    onClose();
  };

  const primaryGradient = `linear-gradient(135deg, ${bridgeConfig.theme.primaryColor}, #8b5cf6)`;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="bg-card/95 backdrop-blur-2xl border-white/[0.08] text-white sm:max-w-[420px] shadow-[0_8px_40px_-12px_rgba(0,0,0,0.6)]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold tracking-tight">Review Bridge</DialogTitle>
        </DialogHeader>

        {isSuccess && txHash ? (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-green-500/20 blur-xl" />
              <CheckCircle2 className="relative h-14 w-14 text-green-400" />
            </div>
            <p className="text-lg font-semibold tracking-tight">Transaction Submitted</p>
            <p className="text-sm text-white/50 text-center leading-relaxed max-w-[300px]">
              {direction === "deposit"
                ? `Your deposit of ${amount} ${token.symbol} will arrive on ${toChain} in ~${DEPOSIT_CONFIRMATION_MINUTES} minutes.`
                : `Your withdrawal of ${amount} ${token.symbol} has been initiated. You'll need to prove and finalize it over the next ~${FINALIZE_WAIT_DAYS} days.`}
            </p>
            <a
              href={`${explorer}/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors duration-200"
            >
              View on Explorer <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <Button
              onClick={handleClose}
              className="mt-3 w-full h-12 bg-white/[0.08] hover:bg-white/[0.12] border border-white/[0.06] text-white font-medium"
            >
              Done
            </Button>
          </div>
        ) : (
          <>
            {/* Route summary */}
            <div className="flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-white/[0.03] border border-white/[0.05]">
              <span className="text-sm font-medium">{fromChain}</span>
              <ArrowRight className="h-3.5 w-3.5 text-white/30" />
              <span className="text-sm font-medium">{toChain}</span>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-white/40">Amount</span>
                <span className="font-mono font-semibold">
                  {amount} {token.symbol}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/40">Estimated Time</span>
                <span className="font-medium">
                  {direction === "deposit"
                    ? `~${DEPOSIT_CONFIRMATION_MINUTES} min`
                    : `~${FINALIZE_WAIT_DAYS} days`}
                </span>
              </div>
              {direction === "withdrawal" && (
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">Transactions</span>
                  <span className="font-medium">3 required</span>
                </div>
              )}
            </div>

            <Separator className="bg-white/[0.06]" />

            <div className="space-y-3">
              {direction === "deposit" ? (
                <label className="flex items-start gap-3 text-sm cursor-pointer group">
                  <Checkbox
                    checked={checks[0]}
                    onCheckedChange={() => toggleCheck(0)}
                    className="mt-0.5"
                  />
                  <span className="text-white/50 group-hover:text-white/70 transition-colors leading-relaxed">
                    I understand this deposit will take approximately{" "}
                    {DEPOSIT_CONFIRMATION_MINUTES} minutes to complete and cannot
                    be reversed.
                  </span>
                </label>
              ) : (
                <>
                  <label className="flex items-start gap-3 text-sm cursor-pointer group">
                    <Checkbox
                      checked={checks[0]}
                      onCheckedChange={() => toggleCheck(0)}
                      className="mt-0.5"
                    />
                    <span className="text-white/50 group-hover:text-white/70 transition-colors leading-relaxed">
                      I understand this withdrawal requires 3 transactions over
                      ~{FINALIZE_WAIT_DAYS} days.
                    </span>
                  </label>
                  <label className="flex items-start gap-3 text-sm cursor-pointer group">
                    <Checkbox
                      checked={checks[1]}
                      onCheckedChange={() => toggleCheck(1)}
                      className="mt-0.5"
                    />
                    <span className="text-white/50 group-hover:text-white/70 transition-colors leading-relaxed">
                      Gas costs may change between now and when I prove/finalize.
                    </span>
                  </label>
                  <label className="flex items-start gap-3 text-sm cursor-pointer group">
                    <Checkbox
                      checked={checks[2]}
                      onCheckedChange={() => toggleCheck(2)}
                      className="mt-0.5"
                    />
                    <span className="text-white/50 group-hover:text-white/70 transition-colors leading-relaxed">
                      This action cannot be reversed once initiated.
                    </span>
                  </label>
                </>
              )}
            </div>

            {error && (
              <div className="rounded-lg bg-red-500/8 border border-red-500/15 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <DialogFooter>
              <Button
                onClick={onConfirm}
                disabled={!allChecked || isConfirming}
                className="btn-glow w-full h-12 text-[15px] font-semibold tracking-wide text-white border-0 shadow-lg shadow-indigo-500/20 transition-all duration-300 disabled:opacity-40 disabled:shadow-none"
                style={{ background: !allChecked || isConfirming ? undefined : primaryGradient }}
              >
                {isConfirming ? (
                  <>
                    <Loader2 className="mr-2 h-4.5 w-4.5 animate-spin" />
                    Confirming...
                  </>
                ) : (
                  `Confirm ${direction === "deposit" ? "Deposit" : "Withdrawal"}`
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
