"use client";

import Image from "next/image";
import { bridgeConfig } from "@/config/bridge.config";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import type { BridgeDirection } from "@/types/transaction";

interface ChainSelectorProps {
  direction: BridgeDirection;
  onFlip: () => void;
}

function ChainRow({
  label,
  chainName,
  iconUrl,
}: {
  label: string;
  chainName: string;
  iconUrl?: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-white/[0.04] border border-white/[0.06] px-4 py-3 transition-colors duration-200 hover:bg-white/[0.06]">
      <span className="text-xs font-medium uppercase tracking-widest text-white/40">
        {label}
      </span>
      <div className="flex items-center gap-2.5">
        {iconUrl ? (
          <Image
            src={iconUrl}
            alt={chainName}
            width={22}
            height={22}
            className="rounded-full ring-1 ring-white/10"
          />
        ) : (
          <div className="h-[22px] w-[22px] rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold">
            {chainName.charAt(0)}
          </div>
        )}
        <span className="font-medium text-[15px] text-white">{chainName}</span>
      </div>
    </div>
  );
}

export function ChainSelector({ direction, onFlip }: ChainSelectorProps) {
  const from =
    direction === "deposit" ? bridgeConfig.l1 : bridgeConfig.l2;
  const to =
    direction === "deposit" ? bridgeConfig.l2 : bridgeConfig.l1;

  return (
    <div className="relative space-y-1">
      <ChainRow label="From" chainName={from.name} iconUrl={from.iconUrl} />

      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
        <Button
          variant="outline"
          size="icon"
          onClick={onFlip}
          className="h-9 w-9 rounded-full border-white/[0.12] bg-card shadow-lg shadow-black/20 hover:bg-white/10 transition-all duration-300 hover:rotate-180 hover:border-indigo-500/30 hover:shadow-indigo-500/10"
        >
          <ArrowUpDown className="h-3.5 w-3.5 text-white/70" />
        </Button>
      </div>

      <ChainRow label="To" chainName={to.name} iconUrl={to.iconUrl} />
    </div>
  );
}
