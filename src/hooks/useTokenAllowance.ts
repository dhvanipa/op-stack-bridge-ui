"use client";

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { ERC20ABI } from "@/lib/abis";
import { maxUint256 } from "viem";
import type { TokenConfig } from "@/types/bridge";

export function useTokenAllowance(
  owner: `0x${string}` | undefined,
  spender: `0x${string}`,
  token: TokenConfig,
  chainId: number,
  amount: bigint
) {
  const isNative = token.l1Address === "native" && token.l2Address === "native";
  const tokenAddress = chainId === 1 ? token.l1Address : token.l2Address;

  const { data: allowance, refetch } = useReadContract({
    address:
      tokenAddress !== "native" ? (tokenAddress as `0x${string}`) : undefined,
    abi: ERC20ABI,
    functionName: "allowance",
    args: owner ? [owner, spender] : undefined,
    chainId,
    query: {
      enabled: !!owner && !isNative && tokenAddress !== "native",
    },
  });

  const { writeContract, data: approveTxHash, isPending: isApproving } = useWriteContract();

  const { isLoading: isWaitingApproval, isSuccess: approvalConfirmed } =
    useWaitForTransactionReceipt({
      hash: approveTxHash,
    });

  const needsApproval =
    !isNative &&
    tokenAddress !== "native" &&
    allowance !== undefined &&
    (allowance as bigint) < amount;

  const approve = () => {
    if (tokenAddress === "native") return;
    writeContract({
      address: tokenAddress as `0x${string}`,
      abi: ERC20ABI,
      functionName: "approve",
      args: [spender, maxUint256],
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
