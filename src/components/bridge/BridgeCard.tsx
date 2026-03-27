"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChainSelector } from "./ChainSelector";
import { AmountInput } from "./AmountInput";
import { BridgeButton } from "./BridgeButton";
import { ReviewModal } from "./ReviewModal";
import { bridgeConfig } from "@/config/bridge.config";
import type { TokenConfig } from "@/types/bridge";
import { useAccount } from "wagmi";
import { useTokenBalance } from "@/hooks/useTokenBalance";
import { useTokenAllowance } from "@/hooks/useTokenAllowance";
import { useBridgeDeposit } from "@/hooks/useBridgeDeposit";
import { useBridgeWithdraw } from "@/hooks/useBridgeWithdraw";
import { parseUnits } from "viem";
import type { BridgeDirection } from "@/types/transaction";

export function BridgeCard() {
  const { address } = useAccount();
  const [direction, setDirection] = useState<BridgeDirection>("deposit");
  const [selectedToken, setSelectedToken] = useState<TokenConfig>(
    bridgeConfig.tokens[0]
  );
  const [amount, setAmount] = useState("");
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  const sourceChainId =
    direction === "deposit"
      ? bridgeConfig.l1.chainId
      : bridgeConfig.l2.chainId;

  const { balance, isLoading: isLoadingBalance } = useTokenBalance(
    address,
    selectedToken,
    sourceChainId
  );

  const parsedAmount =
    amount && parseFloat(amount) > 0
      ? (() => {
          try {
            return parseUnits(amount, selectedToken.decimals);
          } catch {
            return 0n;
          }
        })()
      : 0n;

  const spender =
    direction === "deposit"
      ? bridgeConfig.contracts.L1StandardBridgeProxy
      : ("0x4200000000000000000000000000000000000010" as `0x${string}`);

  const {
    needsApproval,
    approve,
    isApproving,
    approvalConfirmed,
    refetchAllowance,
  } = useTokenAllowance(address, spender, selectedToken, sourceChainId, parsedAmount);

  const {
    deposit,
    isLoading: isDepositing,
    txHash: depositTxHash,
    isSuccess: depositSuccess,
    error: depositError,
    reset: resetDeposit,
  } = useBridgeDeposit();

  const {
    withdraw,
    isLoading: isWithdrawing,
    txHash: withdrawTxHash,
    isSuccess: withdrawSuccess,
    error: withdrawError,
    reset: resetWithdraw,
  } = useBridgeWithdraw();

  // Refetch allowance after approval confirmed
  useEffect(() => {
    if (approvalConfirmed) refetchAllowance();
  }, [approvalConfirmed, refetchAllowance]);

  const isBridging = isDepositing || isWithdrawing;
  const txHash = depositTxHash || withdrawTxHash;
  const isSuccess = depositSuccess || withdrawSuccess;
  const bridgeError = depositError || withdrawError;

  const handleFlip = () => {
    setDirection((d) => (d === "deposit" ? "withdrawal" : "deposit"));
    setAmount("");
  };

  const handleOpenReview = () => {
    setIsReviewOpen(true);
  };

  const handleConfirm = () => {
    if (direction === "deposit") {
      deposit(amount, selectedToken, balance);
    } else {
      withdraw(amount, selectedToken, balance);
    }
  };

  const handleCloseReview = () => {
    setIsReviewOpen(false);
    if (isSuccess) {
      setAmount("");
    }
    resetDeposit();
    resetWithdraw();
  };

  return (
    <>
      <Card className="card-glow animate-fade-in-up w-full max-w-[460px] mx-auto border-white/[0.08] bg-card/90 backdrop-blur-2xl shadow-[0_8px_40px_-12px_rgba(0,0,0,0.5),0_0_80px_-20px_rgba(99,102,241,0.08)]">
        <CardContent className="p-5 sm:p-6 space-y-4">
          <Tabs
            value={direction}
            onValueChange={(v) => {
              setDirection(v as BridgeDirection);
              setAmount("");
            }}
          >
            <TabsList className="w-full bg-white/[0.04] border border-white/[0.06]">
              <TabsTrigger value="deposit" className="flex-1 font-medium tracking-wide text-[13px]">
                Deposit
              </TabsTrigger>
              <TabsTrigger value="withdrawal" className="flex-1 font-medium tracking-wide text-[13px]">
                Withdraw
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <ChainSelector direction={direction} onFlip={handleFlip} />

          <AmountInput
            amount={amount}
            onAmountChange={setAmount}
            selectedToken={selectedToken}
            onTokenSelect={setSelectedToken}
            balance={balance}
            isLoadingBalance={isLoadingBalance}
          />

          <BridgeButton
            direction={direction}
            amount={amount}
            selectedToken={selectedToken}
            balance={balance}
            needsApproval={needsApproval}
            isApproving={isApproving}
            isBridging={isBridging}
            onApprove={approve}
            onBridge={handleOpenReview}
          />
        </CardContent>
      </Card>

      <ReviewModal
        open={isReviewOpen}
        onClose={handleCloseReview}
        direction={direction}
        amount={amount}
        token={selectedToken}
        onConfirm={handleConfirm}
        isConfirming={isBridging}
        txHash={txHash}
        isSuccess={isSuccess}
        error={bridgeError}
      />
    </>
  );
}
