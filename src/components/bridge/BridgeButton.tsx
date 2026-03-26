"use client";

import { Button } from "@/components/ui/button";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { bridgeConfig } from "@/config/bridge.config";
import type { BridgeDirection } from "@/types/transaction";
import { Loader2 } from "lucide-react";
import { parseUnits } from "viem";
import type { TokenConfig } from "@/config/bridge.config";

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

  if (!isConnected) {
    return (
      <ConnectButton.Custom>
        {({ openConnectModal }) => (
          <Button
            onClick={openConnectModal}
            className="w-full h-14 text-lg font-semibold"
            style={{ backgroundColor: bridgeConfig.theme.primaryColor }}
          >
            Connect Wallet
          </Button>
        )}
      </ConnectButton.Custom>
    );
  }

  const requiredChainId =
    direction === "deposit"
      ? bridgeConfig.l1.chainId
      : bridgeConfig.l2.chainId;

  if (chainId !== requiredChainId) {
    const chainName =
      direction === "deposit" ? bridgeConfig.l1.name : bridgeConfig.l2.name;
    return (
      <Button
        onClick={() => switchChain({ chainId: requiredChainId })}
        className="w-full h-14 text-lg font-semibold"
        variant="secondary"
      >
        Switch to {chainName}
      </Button>
    );
  }

  if (!amount || parseFloat(amount) === 0) {
    return (
      <Button disabled className="w-full h-14 text-lg font-semibold">
        Enter Amount
      </Button>
    );
  }

  try {
    const parsedAmount = parseUnits(amount, selectedToken.decimals);
    if (balance !== undefined && parsedAmount > balance) {
      return (
        <Button disabled className="w-full h-14 text-lg font-semibold">
          Insufficient Balance
        </Button>
      );
    }
  } catch {
    return (
      <Button disabled className="w-full h-14 text-lg font-semibold">
        Invalid Amount
      </Button>
    );
  }

  if (needsApproval) {
    return (
      <Button
        onClick={onApprove}
        disabled={isApproving}
        className="w-full h-14 text-lg font-semibold"
        variant="secondary"
      >
        {isApproving ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
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
      className="w-full h-14 text-lg font-semibold"
      style={{ backgroundColor: bridgeConfig.theme.primaryColor }}
    >
      {isBridging ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Bridging...
        </>
      ) : (
        "Review Bridge"
      )}
    </Button>
  );
}
