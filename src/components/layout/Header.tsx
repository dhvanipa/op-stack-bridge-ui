"use client";

import { bridgeConfig } from "@/config/bridge.config";
import { WalletButton } from "./WalletButton";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";

interface HeaderProps {
  onActivityToggle: () => void;
  hasActionable: boolean;
}

export function Header({ onActivityToggle, hasActionable }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-4 py-3 sm:px-6">
      <div className="flex items-center gap-2">
        {bridgeConfig.logoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={bridgeConfig.logoUrl}
            alt={bridgeConfig.appName}
            className="h-8 w-8"
          />
        )}
        <span className="text-lg font-semibold text-white">
          {bridgeConfig.appName}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onActivityToggle}
          className="relative text-white/70 hover:text-white hover:bg-white/10"
        >
          <Clock className="h-5 w-5" />
          {hasActionable && (
            <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-indigo-500 animate-pulse-subtle" />
          )}
        </Button>
        <WalletButton />
      </div>
    </header>
  );
}
