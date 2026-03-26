"use client";

import { useState } from "react";
import { GradientBackground } from "@/components/shared/GradientBackground";
import { Header } from "@/components/layout/Header";
import { BridgeCard } from "@/components/bridge/BridgeCard";
import { ActivityPanel } from "@/components/activity/ActivityPanel";
import { useTransactionHistory } from "@/hooks/useTransactionHistory";
import { useAccount } from "wagmi";

export default function Home() {
  const [activityOpen, setActivityOpen] = useState(false);
  const { address } = useAccount();
  const { hasActionable } = useTransactionHistory(address);

  return (
    <>
      <GradientBackground />
      <Header
        onActivityToggle={() => setActivityOpen(true)}
        hasActionable={hasActionable}
      />
      <main className="flex-1 flex items-center justify-center px-4 pb-12">
        <BridgeCard />
      </main>
      <ActivityPanel
        open={activityOpen}
        onClose={() => setActivityOpen(false)}
      />
    </>
  );
}
