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
import { Loader2, ExternalLink, CheckCircle2 } from "lucide-react";
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

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="bg-card border-white/10 text-white sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Review Bridge</DialogTitle>
        </DialogHeader>

        {isSuccess && txHash ? (
          <div className="flex flex-col items-center gap-4 py-6">
            <CheckCircle2 className="h-16 w-16 text-green-400" />
            <p className="text-lg font-medium">Transaction Submitted</p>
            <p className="text-sm text-muted-foreground text-center">
              {direction === "deposit"
                ? `Your deposit of ${amount} ${token.symbol} will arrive on ${toChain} in ~${DEPOSIT_CONFIRMATION_MINUTES} minutes.`
                : `Your withdrawal of ${amount} ${token.symbol} has been initiated. You'll need to prove and finalize it over the next ~${FINALIZE_WAIT_DAYS} days.`}
            </p>
            <a
              href={`${explorer}/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 text-sm"
            >
              View on Explorer <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <Button onClick={handleClose} className="mt-2 w-full">
              Done
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">From</span>
                <span>{fromChain}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">To</span>
                <span>{toChain}</span>
              </div>
              <Separator className="bg-white/10" />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-medium">
                  {amount} {token.symbol}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Estimated Time</span>
                <span>
                  {direction === "deposit"
                    ? `~${DEPOSIT_CONFIRMATION_MINUTES} minutes`
                    : `~${FINALIZE_WAIT_DAYS} days (3 transactions)`}
                </span>
              </div>
            </div>

            <Separator className="bg-white/10" />

            <div className="space-y-3">
              {direction === "deposit" ? (
                <label className="flex items-start gap-3 text-sm cursor-pointer">
                  <Checkbox
                    checked={checks[0]}
                    onCheckedChange={() => toggleCheck(0)}
                    className="mt-0.5"
                  />
                  <span className="text-muted-foreground">
                    I understand this deposit will take approximately{" "}
                    {DEPOSIT_CONFIRMATION_MINUTES} minutes to complete and cannot
                    be reversed.
                  </span>
                </label>
              ) : (
                <>
                  <label className="flex items-start gap-3 text-sm cursor-pointer">
                    <Checkbox
                      checked={checks[0]}
                      onCheckedChange={() => toggleCheck(0)}
                      className="mt-0.5"
                    />
                    <span className="text-muted-foreground">
                      I understand this withdrawal requires 3 transactions over
                      ~{FINALIZE_WAIT_DAYS} days.
                    </span>
                  </label>
                  <label className="flex items-start gap-3 text-sm cursor-pointer">
                    <Checkbox
                      checked={checks[1]}
                      onCheckedChange={() => toggleCheck(1)}
                      className="mt-0.5"
                    />
                    <span className="text-muted-foreground">
                      Gas costs may change between now and when I prove/finalize.
                    </span>
                  </label>
                  <label className="flex items-start gap-3 text-sm cursor-pointer">
                    <Checkbox
                      checked={checks[2]}
                      onCheckedChange={() => toggleCheck(2)}
                      className="mt-0.5"
                    />
                    <span className="text-muted-foreground">
                      This action cannot be reversed once initiated.
                    </span>
                  </label>
                </>
              )}
            </div>

            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <DialogFooter>
              <Button
                onClick={onConfirm}
                disabled={!allChecked || isConfirming}
                className="w-full h-12 text-base font-semibold"
                style={{ backgroundColor: bridgeConfig.theme.primaryColor }}
              >
                {isConfirming ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
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
