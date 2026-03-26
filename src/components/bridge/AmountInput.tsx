"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TokenSelector } from "./TokenSelector";
import { formatBalance } from "@/lib/utils";
import { formatUnits } from "viem";
import type { TokenConfig } from "@/config/bridge.config";

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
  const handleMax = () => {
    if (balance !== undefined) {
      onAmountChange(formatUnits(balance, selectedToken.decimals));
    }
  };

  return (
    <div className="rounded-xl bg-white/5 p-4 space-y-2">
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
          className="border-0 bg-transparent text-2xl font-semibold text-white placeholder:text-white/30 focus-visible:ring-0 p-0 h-auto"
        />
        <TokenSelector
          selectedToken={selectedToken}
          onSelect={onTokenSelect}
        />
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
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
            className="text-indigo-400 hover:text-indigo-300 h-auto p-0"
          >
            Max
          </Button>
        )}
      </div>
    </div>
  );
}
