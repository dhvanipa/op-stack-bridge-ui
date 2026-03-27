"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, http } from "wagmi";
import { getDefaultConfig, RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { l1Chain, l2Chain } from "@/config/chains";
import { bridgeConfig } from "@/config/bridge.config";
import { useState, type ReactNode } from "react";
import "@rainbow-me/rainbowkit/styles.css";

const config = getDefaultConfig({
  appName: bridgeConfig.appName,
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
  chains: [l1Chain, l2Chain],
  transports: {
    [l1Chain.id]: http(bridgeConfig.l1.rpcUrl),
    [l2Chain.id]: http(bridgeConfig.l2.rpcUrl),
  },
  ssr: true,
});

export function Web3Provider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: bridgeConfig.theme.primaryColor,
            borderRadius: "medium",
          })}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
