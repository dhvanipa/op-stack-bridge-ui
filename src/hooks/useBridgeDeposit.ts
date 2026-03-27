"use client";

import { useState, useCallback } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { parseUnits } from "viem";
import { walletActionsL1 } from "viem/op-stack";
import { publicClientL1, publicClientL2 } from "@/lib/clients";
import { l2Chain } from "@/config/chains";
import { bridgeConfig } from "@/config/bridge.config";
import type { TokenConfig } from "@/types/bridge";
import { L1StandardBridgeABI } from "@/lib/abis";
import { useTransactionHistory } from "./useTransactionHistory";

export function useBridgeDeposit() {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { addTransaction } = useTransactionHistory(address);
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const [error, setError] = useState<string | undefined>();
  const [isSuccess, setIsSuccess] = useState(false);

  const deposit = useCallback(
    async (amount: string, token: TokenConfig) => {
      if (!walletClient || !address) return;

      setIsLoading(true);
      setError(undefined);
      setTxHash(undefined);
      setIsSuccess(false);

      try {
        const l1Wallet = walletClient.extend(walletActionsL1());
        const parsedAmount = parseUnits(amount, token.decimals);
        const isNative = token.l1Address === "native";

        let hash: `0x${string}`;

        if (isNative) {
          // ETH deposit via OptimismPortal
          const args = await publicClientL2.buildDepositTransaction({
            mint: parsedAmount,
            to: address,
          });

          // Remove portalAddress from args since we provide targetChain which has the contract
          const { portalAddress, ...depositArgs } = args;

          hash = await l1Wallet.depositTransaction({
            ...depositArgs,
            targetChain: l2Chain,
          } as Parameters<typeof l1Wallet.depositTransaction>[0]);
        } else {
          // ERC-20 deposit via L1StandardBridge
          hash = await l1Wallet.writeContract({
            address: bridgeConfig.contracts.L1StandardBridgeProxy,
            abi: L1StandardBridgeABI,
            functionName: "bridgeERC20To",
            args: [
              token.l1Address as `0x${string}`,
              token.l2Address as `0x${string}`,
              address,
              parsedAmount,
              200_000, // minGasLimit
              "0x" as `0x${string}`,
            ],
          });
        }

        setTxHash(hash);

        // Wait for L1 receipt before marking success
        await publicClientL1.waitForTransactionReceipt({ hash });

        // Save to transaction history
        addTransaction({
          id: hash,
          direction: "deposit",
          status: "completed",
          l1TxHash: hash,
          amount,
          tokenSymbol: token.symbol,
          from: address,
          to: address,
          timestamp: Date.now(),
        });

        setIsSuccess(true);
      } catch (err) {
        console.error("Deposit error:", err);
        const message =
          err instanceof Error ? err.message : "";
        if (message.includes("User rejected") || message.includes("denied")) {
          setError("Transaction rejected by user");
        } else if (message.includes("insufficient funds")) {
          setError("Insufficient funds for gas");
        } else {
          setError("Deposit failed. Please try again.");
        }
      } finally {
        setIsLoading(false);
      }
    },
    [walletClient, address, addTransaction]
  );

  const reset = useCallback(() => {
    setTxHash(undefined);
    setError(undefined);
    setIsSuccess(false);
    setIsLoading(false);
  }, []);

  return { deposit, isLoading, txHash, error, isSuccess, reset };
}
