import { createPublicClient, http } from "viem";
import { publicActionsL1 } from "viem/op-stack";
import { publicActionsL2 } from "viem/op-stack";
import { l1Chain, l2Chain } from "@/config/chains";
import { bridgeConfig } from "@/config/bridge.config";

export const publicClientL1 = createPublicClient({
  chain: l1Chain,
  transport: http(bridgeConfig.l1.rpcUrl),
}).extend(publicActionsL1());

export const publicClientL2 = createPublicClient({
  chain: l2Chain,
  transport: http(bridgeConfig.l2.rpcUrl),
}).extend(publicActionsL2());
