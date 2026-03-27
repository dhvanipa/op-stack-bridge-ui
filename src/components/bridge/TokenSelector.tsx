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
      <SelectTrigger className="w-[130px] bg-white/[0.06] border-white/[0.08] text-white hover:bg-white/[0.1] transition-colors duration-200">
        <SelectValue>
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded-full bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center text-[10px] font-bold ring-1 ring-white/10">
              {selectedToken.symbol.charAt(0)}
            </div>
            <span className="font-medium">{selectedToken.symbol}</span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="bg-card border-white/[0.08] backdrop-blur-xl">
        {bridgeConfig.tokens.map((token) => (
          <SelectItem key={token.symbol} value={token.symbol}>
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 rounded-full bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center text-[10px] font-bold ring-1 ring-white/10">
                {token.symbol.charAt(0)}
              </div>
              <span className="font-medium">{token.symbol}</span>
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
