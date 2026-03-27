"use client";

import { useBalance, useReadContract } from "wagmi";
import { ERC20ABI } from "@/lib/abis";
import { bridgeConfig } from "@/config/bridge.config";
import type { TokenConfig } from "@/types/bridge";

export function useTokenBalance(
  address: `0x${string}` | undefined,
  token: TokenConfig,
  chainId: number
) {
  const tokenAddress =
    chainId === bridgeConfig.l1.chainId ? token.l1Address : token.l2Address;
  const isNative = tokenAddress === "native";
  const erc20Address = isNative ? undefined : (tokenAddress as `0x${string}`);

  const nativeBalance = useBalance({
    address,
    chainId,
    query: { enabled: !!address && isNative },
  });

  const erc20Balance = useReadContract({
    address: erc20Address,
    abi: ERC20ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId,
    query: { enabled: !!address && !isNative },
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
