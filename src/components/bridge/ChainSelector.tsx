"use client";

import { bridgeConfig } from "@/config/bridge.config";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import type { BridgeDirection } from "@/types/transaction";

interface ChainSelectorProps {
  direction: BridgeDirection;
  onFlip: () => void;
}

function ChainRow({ label, chainName }: { label: string; chainName: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <div className="h-6 w-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">
          {chainName.charAt(0)}
        </div>
        <span className="font-medium text-white">{chainName}</span>
      </div>
    </div>
  );
}

export function ChainSelector({ direction, onFlip }: ChainSelectorProps) {
  const fromChain =
    direction === "deposit" ? bridgeConfig.l1.name : bridgeConfig.l2.name;
  const toChain =
    direction === "deposit" ? bridgeConfig.l2.name : bridgeConfig.l1.name;

  return (
    <div className="relative space-y-1">
      <ChainRow label="From" chainName={fromChain} />

      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
        <Button
          variant="outline"
          size="icon"
          onClick={onFlip}
          className="h-8 w-8 rounded-full border-white/20 bg-card hover:bg-white/10 transition-transform hover:rotate-180 duration-300"
        >
          <ArrowUpDown className="h-3.5 w-3.5" />
        </Button>
      </div>

      <ChainRow label="To" chainName={toChain} />
    </div>
  );
}
