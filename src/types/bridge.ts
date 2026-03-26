import type { BridgeDirection } from "./transaction";
import type { TokenConfig } from "@/config/bridge.config";

export interface BridgeFormState {
  direction: BridgeDirection;
  selectedToken: TokenConfig;
  amount: string;
  isReviewOpen: boolean;
}
