"use client";

import { Button } from "@/components/ui/button";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { bridgeConfig } from "@/config/bridge.config";
import type { BridgeDirection } from "@/types/transaction";
import { Loader2 } from "lucide-react";
import { parseUnits } from "viem";
import type { TokenConfig } from "@/types/bridge";

interface BridgeButtonProps {
  direction: BridgeDirection;
  amount: string;
  selectedToken: TokenConfig;
  balance?: bigint;
  needsApproval?: boolean;
  isApproving?: boolean;
  isBridging?: boolean;
  onApprove: () => void;
  onBridge: () => void;
}

export function BridgeButton({
  direction,
  amount,
  selectedToken,
  balance,
  needsApproval,
  isApproving,
  isBridging,
  onApprove,
  onBridge,
}: BridgeButtonProps) {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const primaryGradient = `linear-gradient(135deg, ${bridgeConfig.theme.primaryColor}, #8b5cf6)`;

  if (!isConnected) {
    return (
      <ConnectButton.Custom>
        {({ openConnectModal }) => (
          <Button
            onClick={openConnectModal}
            className="btn-glow w-full h-14 text-[15px] font-semibold tracking-wide text-white border-0 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all duration-300"
            style={{ background: primaryGradient }}
          >
            Connect Wallet
          </Button>
        )}
      </ConnectButton.Custom>
    );
  }

  const requiredChainId =
    direction === "deposit" ? bridgeConfig.l1.chainId : bridgeConfig.l2.chainId;

  if (chainId !== requiredChainId) {
    const chainName =
      direction === "deposit" ? bridgeConfig.l1.name : bridgeConfig.l2.name;
    return (
      <Button
        onClick={() => switchChain({ chainId: requiredChainId })}
        className="w-full h-14 text-[15px] font-semibold tracking-wide bg-white/[0.08] border border-white/[0.1] hover:bg-white/[0.12] text-white transition-all duration-200"
      >
        Switch to {chainName}
      </Button>
    );
  }

  if (!amount || parseFloat(amount) === 0) {
    return (
      <Button disabled className="w-full h-14 text-[15px] font-semibold tracking-wide bg-white/[0.06] text-white/30 border border-white/[0.04]">
        Enter Amount
      </Button>
    );
  }

  let parsedAmount: bigint | null = null;
  try {
    parsedAmount = parseUnits(amount, selectedToken.decimals);
  } catch {
    // invalid amount string
  }

  if (parsedAmount === null) {
    return (
      <Button disabled className="w-full h-14 text-[15px] font-semibold tracking-wide bg-white/[0.06] text-white/30 border border-white/[0.04]">
        Invalid Amount
      </Button>
    );
  }

  if (balance !== undefined && parsedAmount > balance) {
    return (
      <Button disabled className="w-full h-14 text-[15px] font-semibold tracking-wide bg-red-500/10 text-red-400/70 border border-red-500/10">
        Insufficient Balance
      </Button>
    );
  }

  if (needsApproval) {
    return (
      <Button
        onClick={onApprove}
        disabled={isApproving}
        className="w-full h-14 text-[15px] font-semibold tracking-wide bg-white/[0.08] border border-white/[0.1] hover:bg-white/[0.12] text-white transition-all duration-200"
      >
        {isApproving ? (
          <>
            <Loader2 className="mr-2 h-4.5 w-4.5 animate-spin" />
            Approving...
          </>
        ) : (
          `Approve ${selectedToken.symbol}`
        )}
      </Button>
    );
  }

  return (
    <Button
      onClick={onBridge}
      disabled={isBridging}
      className="btn-glow w-full h-14 text-[15px] font-semibold tracking-wide text-white border-0 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all duration-300"
      style={{ background: primaryGradient }}
    >
      {isBridging ? (
        <>
          <Loader2 className="mr-2 h-4.5 w-4.5 animate-spin" />
          Bridging...
        </>
      ) : (
        "Review Bridge"
      )}
    </Button>
  );
}
