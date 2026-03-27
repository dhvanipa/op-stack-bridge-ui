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
  ...(bridgeConfig.l1.iconUrl ? { iconUrl: bridgeConfig.l1.iconUrl } : {}),
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
  ...(bridgeConfig.l2.iconUrl ? { iconUrl: bridgeConfig.l2.iconUrl } : {}),
  sourceId: bridgeConfig.l1.chainId,
  contracts: {
    ...chainConfig.contracts,
    portal: {
      [bridgeConfig.l1.chainId]: {
        address: bridgeConfig.contracts.OptimismPortalProxy,
      },
    },
    l1StandardBridge: {
      [bridgeConfig.l1.chainId]: {
        address: bridgeConfig.contracts.L1StandardBridgeProxy,
      },
    },
    disputeGameFactory: {
      [bridgeConfig.l1.chainId]: {
        address: bridgeConfig.contracts.DisputeGameFactoryProxy,
      },
    },
    ...(bridgeConfig.contracts.L2OutputOracleProxy
      ? {
          l2OutputOracle: {
            [bridgeConfig.l1.chainId]: {
              address: bridgeConfig.contracts.L2OutputOracleProxy,
            },
          },
        }
      : {}),
  },
});
