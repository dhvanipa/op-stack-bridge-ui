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
    <header className="flex items-center justify-between px-5 py-4 sm:px-8">
      <div className="flex items-center gap-2.5">
        {bridgeConfig.logoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={bridgeConfig.logoUrl}
            alt={bridgeConfig.appName}
            className="h-8 w-8 drop-shadow-[0_0_8px_rgba(99,102,241,0.3)]"
          />
        )}
        <span className="text-lg font-semibold tracking-tight text-white">
          {bridgeConfig.appName}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onActivityToggle}
          className="relative text-white/50 hover:text-white hover:bg-white/[0.06] transition-colors duration-200"
        >
          <Clock className="h-5 w-5" />
          {hasActionable && (
            <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-indigo-500" />
            </span>
          )}
        </Button>
        <WalletButton />
      </div>
    </header>
  );
}
