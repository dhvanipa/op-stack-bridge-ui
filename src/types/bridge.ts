import type { BridgeDirection } from "./transaction";

export interface TokenConfig {
  symbol: string;
  name: string;
  decimals: number;
  l1Address: `0x${string}` | "native"; // 'native' for ETH
  l2Address: `0x${string}` | "native";
  logoUrl?: string;
}

export interface BridgeConfig {
  appName: string;
  logoUrl: string;
  theme: {
    primaryColor: string;
    gradientFrom: string;
    gradientTo: string;
  };
  l1: {
    chainId: number;
    name: string;
    rpcUrl: string;
    blockExplorer: string;
    explorerApiUrl?: string;
    nativeCurrency: { name: string; symbol: string; decimals: number };
    iconUrl?: string;
  };
  l2: {
    chainId: number;
    name: string;
    rpcUrl: string;
    blockExplorer: string;
    explorerApiUrl?: string;
    nativeCurrency: { name: string; symbol: string; decimals: number };
    iconUrl?: string;
  };
  contracts: {
    OptimismPortalProxy: `0x${string}`;
    L1StandardBridgeProxy: `0x${string}`;
    L1CrossDomainMessengerProxy: `0x${string}`;
    DisputeGameFactoryProxy: `0x${string}`;
    L2OutputOracleProxy?: `0x${string}`;
  };
  tokens: TokenConfig[];
}

export interface BridgeFormState {
  direction: BridgeDirection;
  selectedToken: TokenConfig;
  amount: string;
  isReviewOpen: boolean;
}
