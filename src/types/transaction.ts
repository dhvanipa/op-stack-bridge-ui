export type BridgeDirection = "deposit" | "withdrawal";

export type WithdrawalStatus =
  | "waiting-to-prove"
  | "ready-to-prove"
  | "waiting-to-finalize"
  | "ready-to-finalize"
  | "finalized";

export type DepositStatus = "pending" | "confirmed";

export type TransactionStatus = DepositStatus | WithdrawalStatus;

export interface TransactionRecord {
  id: string;
  direction: BridgeDirection;
  status: TransactionStatus;
  l1TxHash?: `0x${string}`;
  l2TxHash?: `0x${string}`;
  proveTxHash?: `0x${string}`;
  finalizeTxHash?: `0x${string}`;
  amount: string;
  tokenSymbol: string;
  from: `0x${string}`;
  to: `0x${string}`;
  timestamp: number;
  // Serialized receipt/withdrawal data needed for prove/finalize
  withdrawalData?: string;
  receiptData?: string;
}
