"use client";

import { useBalance, useReadContract } from "wagmi";
import { ERC20ABI } from "@/lib/abis";
import type { TokenConfig } from "@/config/bridge.config";

export function useTokenBalance(
  address: `0x${string}` | undefined,
  token: TokenConfig,
  chainId: number
) {
  const isNative = token.l1Address === "native" || token.l2Address === "native";
  const tokenAddress =
    token.l1Address !== "native" ? token.l1Address : token.l2Address;

  const nativeBalance = useBalance({
    address,
    chainId,
    query: { enabled: !!address && isNative },
  });

  const erc20Balance = useReadContract({
    address:
      tokenAddress !== "native" ? (tokenAddress as `0x${string}`) : undefined,
    abi: ERC20ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId,
    query: { enabled: !!address && !isNative && tokenAddress !== "native" },
  });

  if (isNative) {
    return {
      balance: nativeBalance.data?.value,
      isLoading: nativeBalance.isLoading,
      refetch: nativeBalance.refetch,
    };
  }

  return {
    balance: erc20Balance.data as bigint | undefined,
    isLoading: erc20Balance.isLoading,
    refetch: erc20Balance.refetch,
  };
}
