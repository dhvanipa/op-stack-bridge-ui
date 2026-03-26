"use client";

import { bridgeConfig } from "@/config/bridge.config";

export function GradientBackground() {
  return (
    <div
      className="gradient-bg fixed inset-0 -z-10"
      style={
        {
          "--gradient-from": bridgeConfig.theme.gradientFrom,
          "--gradient-to": bridgeConfig.theme.gradientTo,
        } as React.CSSProperties
      }
    />
  );
}
