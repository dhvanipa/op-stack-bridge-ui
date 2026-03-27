"use client";

import { bridgeConfig } from "@/config/bridge.config";
import type { TokenConfig } from "@/types/bridge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TokenSelectorProps {
  selectedToken: TokenConfig;
  onSelect: (token: TokenConfig) => void;
}

export function TokenSelector({ selectedToken, onSelect }: TokenSelectorProps) {
  return (
    <Select
      value={selectedToken.symbol}
      onValueChange={(symbol) => {
        const token = bridgeConfig.tokens.find((t) => t.symbol === symbol);
        if (token) onSelect(token);
      }}
    >
      <SelectTrigger className="w-[130px] bg-white/5 border-white/10 text-white">
        <SelectValue>
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold">
              {selectedToken.symbol.charAt(0)}
            </div>
            {selectedToken.symbol}
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="bg-card border-white/10">
        {bridgeConfig.tokens.map((token) => (
          <SelectItem key={token.symbol} value={token.symbol}>
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold">
                {token.symbol.charAt(0)}
              </div>
              {token.symbol}
              <span className="text-muted-foreground text-xs">
                {token.name}
              </span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
