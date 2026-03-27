"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TokenSelector } from "./TokenSelector";
import { formatBalance } from "@/lib/utils";
import { formatUnits } from "viem";
import { useEthPrice } from "@/hooks/useEthPrice";
import type { TokenConfig } from "@/types/bridge";

interface AmountInputProps {
  amount: string;
  onAmountChange: (amount: string) => void;
  selectedToken: TokenConfig;
  onTokenSelect: (token: TokenConfig) => void;
  balance?: bigint;
  isLoadingBalance?: boolean;
}

export function AmountInput({
  amount,
  onAmountChange,
  selectedToken,
  onTokenSelect,
  balance,
  isLoadingBalance,
}: AmountInputProps) {
  const ethPrice = useEthPrice();

  const handleMax = () => {
    if (balance !== undefined) {
      onAmountChange(formatUnits(balance, selectedToken.decimals));
    }
  };

  const isEth = selectedToken.symbol === "ETH";
  const usdValue =
    isEth && ethPrice && amount && parseFloat(amount) > 0
      ? (parseFloat(amount) * ethPrice).toLocaleString(undefined, {
          style: "currency",
          currency: "USD",
          maximumFractionDigits: 2,
        })
      : null;

  return (
    <div className="input-glow rounded-xl bg-white/[0.04] border border-white/[0.06] p-4 space-y-3 transition-all duration-200">
      <div className="flex items-center gap-2">
        <Input
          type="text"
          inputMode="decimal"
          placeholder="0.0"
          value={amount}
          onChange={(e) => {
            const val = e.target.value;
            if (/^[0-9]*\.?[0-9]*$/.test(val)) {
              onAmountChange(val);
            }
          }}
          className="border-0 bg-transparent !text-[32px] font-mono font-semibold text-white placeholder:text-white/20 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-0 p-0 !h-auto tracking-tight"
        />
        <TokenSelector
          selectedToken={selectedToken}
          onSelect={onTokenSelect}
        />
      </div>

      {usdValue && (
        <p className="text-sm font-mono text-white/40">{usdValue}</p>
      )}

      <div className="flex items-center justify-between text-sm">
        <span className="text-white/40">
          {isLoadingBalance
            ? "Loading..."
            : balance !== undefined
              ? `Balance: ${formatBalance(balance, selectedToken.decimals)} ${selectedToken.symbol}`
              : "Connect wallet to see balance"}
        </span>
        {balance !== undefined && balance > 0n && (
          <Button
            variant="link"
            size="sm"
            onClick={handleMax}
            className="text-indigo-400 hover:text-indigo-300 h-auto p-0 font-medium text-xs uppercase tracking-wider"
          >
            Max
          </Button>
        )}
      </div>
    </div>
  );
}
