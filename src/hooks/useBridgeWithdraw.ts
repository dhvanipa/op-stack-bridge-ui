"use client";

import { useState, useCallback } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { parseUnits } from "viem";
import { walletActionsL2 } from "viem/op-stack";
import { bridgeConfig } from "@/config/bridge.config";
import type { TokenConfig } from "@/types/bridge";
import { L2StandardBridgeABI } from "@/lib/abis";
import { L2_STANDARD_BRIDGE } from "@/lib/constants";
import { useTransactionHistory } from "./useTransactionHistory";
import { publicClientL2 } from "@/lib/clients";
import { serializeBigInt } from "@/lib/utils";

export function useBridgeWithdraw() {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { addTransaction } = useTransactionHistory(address);
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const [error, setError] = useState<string | undefined>();
  const [isSuccess, setIsSuccess] = useState(false);

  const withdraw = useCallback(
    async (amount: string, token: TokenConfig) => {
      if (!walletClient || !address) return;

      setIsLoading(true);
      setError(undefined);
      setTxHash(undefined);
      setIsSuccess(false);

      try {
        const l2Wallet = walletClient.extend(walletActionsL2());
        const parsedAmount = parseUnits(amount, token.decimals);
        const isNative = token.l2Address === "native";

        let hash: `0x${string}`;

        if (isNative) {
          // ETH withdrawal via L2ToL1MessagePasser
          hash = await l2Wallet.initiateWithdrawal({
            request: {
              to: address,
              value: parsedAmount,
              gas: 21_000n,
            },
          });
        } else {
          // ERC-20 withdrawal via L2StandardBridge
          hash = await l2Wallet.writeContract({
            address: L2_STANDARD_BRIDGE,
            abi: L2StandardBridgeABI,
            functionName: "bridgeERC20To",
            args: [
              token.l2Address as `0x${string}`,
              token.l1Address as `0x${string}`,
              address,
              parsedAmount,
              200_000,
              "0x" as `0x${string}`,
            ],
          });
        }

        setTxHash(hash);

        // Get receipt for later proving
        const receipt = await publicClientL2.waitForTransactionReceipt({
          hash,
        });

        addTransaction({
          id: hash,
          direction: "withdrawal",
          status: "waiting-to-prove",
          l2TxHash: hash,
          amount,
          tokenSymbol: token.symbol,
          from: address,
          to: address,
          timestamp: Date.now(),
          receiptData: serializeBigInt(receipt),
        });

        setIsSuccess(true);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Withdrawal failed";
        if (message.includes("User rejected") || message.includes("denied")) {
          setError("Transaction rejected");
        } else {
          setError(message);
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

  return { withdraw, isLoading, txHash, error, isSuccess, reset };
}
