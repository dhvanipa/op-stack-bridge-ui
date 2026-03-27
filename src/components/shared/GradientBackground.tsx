"use client";

import { bridgeConfig } from "@/config/bridge.config";

export function GradientBackground() {
  return (
    <>
      <div
        className="gradient-bg fixed inset-0 -z-10"
        style={
          {
            "--gradient-from": bridgeConfig.theme.gradientFrom,
            "--gradient-to": bridgeConfig.theme.gradientTo,
          } as React.CSSProperties
        }
      />
      <div className="noise-overlay -z-[5]" />
      {/* Ambient glow orbs */}
      <div
        className="orb animate-glow-pulse -z-[8]"
        style={{
          width: "500px",
          height: "500px",
          top: "10%",
          left: "-10%",
          background: `radial-gradient(circle, ${bridgeConfig.theme.primaryColor}18 0%, transparent 70%)`,
        }}
      />
      <div
        className="orb animate-glow-pulse -z-[8]"
        style={{
          width: "400px",
          height: "400px",
          bottom: "5%",
          right: "-5%",
          background: "radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, transparent 70%)",
          animationDelay: "1.5s",
        }}
      />
    </>
  );
}
