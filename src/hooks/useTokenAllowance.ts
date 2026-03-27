"use client";

import { useEffect } from "react";
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { ERC20ABI } from "@/lib/abis";
import { bridgeConfig } from "@/config/bridge.config";
import type { TokenConfig } from "@/types/bridge";

export function useTokenAllowance(
  owner: `0x${string}` | undefined,
  spender: `0x${string}`,
  token: TokenConfig,
  chainId: number,
  amount: bigint
) {
  const tokenAddress =
    chainId === bridgeConfig.l1.chainId ? token.l1Address : token.l2Address;
  const isNative = tokenAddress === "native";
  const erc20Address = isNative ? undefined : (tokenAddress as `0x${string}`);

  const { data: allowance, refetch } = useReadContract({
    address: erc20Address,
    abi: ERC20ABI,
    functionName: "allowance",
    args: owner ? [owner, spender] : undefined,
    chainId,
    query: {
      enabled: !!owner && !isNative,
    },
  });

  const { writeContract, data: approveTxHash, isPending: isApproving } = useWriteContract();

  const { isLoading: isWaitingApproval, isSuccess: approvalConfirmed } =
    useWaitForTransactionReceipt({
      hash: approveTxHash,
    });

  useEffect(() => {
    if (approvalConfirmed) refetch();
  }, [approvalConfirmed, refetch]);

  const needsApproval =
    !isNative &&
    allowance !== undefined &&
    (allowance as bigint) < amount;

  const approve = () => {
    if (!erc20Address) return;
    writeContract({
      address: erc20Address,
      abi: ERC20ABI,
      functionName: "approve",
      args: [spender, amount],
      chainId,
    });
  };

  return {
    needsApproval,
    approve,
    isApproving: isApproving || isWaitingApproval,
    approvalConfirmed,
    refetchAllowance: refetch,
  };
}
