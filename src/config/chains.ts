import { defineChain } from "viem";
import { chainConfig } from "viem/op-stack";
import { bridgeConfig } from "./bridge.config";

export const l1Chain = defineChain({
  id: bridgeConfig.l1.chainId,
  name: bridgeConfig.l1.name,
  nativeCurrency: bridgeConfig.l1.nativeCurrency,
  rpcUrls: {
    default: { http: [bridgeConfig.l1.rpcUrl] },
  },
  blockExplorers: {
    default: { name: "Explorer", url: bridgeConfig.l1.blockExplorer },
  },
});

export const l2Chain = defineChain({
  ...chainConfig,
  id: bridgeConfig.l2.chainId,
  name: bridgeConfig.l2.name,
  nativeCurrency: bridgeConfig.l2.nativeCurrency,
  rpcUrls: {
    default: { http: [bridgeConfig.l2.rpcUrl] },
  },
  blockExplorers: {
    default: { name: "Explorer", url: bridgeConfig.l2.blockExplorer },
  },
  sourceId: bridgeConfig.l1.chainId,
  contracts: {
    ...chainConfig.contracts,
    portal: [
      {
        address: bridgeConfig.contracts.OptimismPortalProxy,
      },
    ],
    l1StandardBridge: [
      {
        address: bridgeConfig.contracts.L1StandardBridgeProxy,
      },
    ],
    disputeGameFactory: [
      {
        address: bridgeConfig.contracts.DisputeGameFactoryProxy,
      },
    ],
    ...(bridgeConfig.contracts.L2OutputOracleProxy
      ? {
          l2OutputOracle: [
            {
              address: bridgeConfig.contracts.L2OutputOracleProxy,
            },
          ],
        }
      : {}),
  },
});
