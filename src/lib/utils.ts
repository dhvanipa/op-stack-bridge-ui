import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatUnits, isHex } from "viem";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatBalance(value: bigint, decimals: number): string {
  const formatted = formatUnits(value, decimals);
  const num = parseFloat(formatted);
  if (num === 0) return "0";
  if (num < 0.0001) return "<0.0001";
  return num.toLocaleString(undefined, { maximumFractionDigits: 4 });
}

export function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function serializeBigInt(obj: unknown): string {
  return JSON.stringify(obj, (_, value) =>
    typeof value === "bigint" ? `__bigint__${value.toString()}` : value
  );
}

export function deserializeBigInt(str: string): unknown {
  return JSON.parse(str, (_, value) => {
    if (typeof value === "string" && value.startsWith("__bigint__")) {
      const raw = value.slice(10);
      // Only allow numeric strings (with optional leading minus)
      if (!/^-?\d+$/.test(raw)) return value;
      const n = BigInt(raw);
      // Reject values outside uint256 range
      if (n < 0n || n >= 1n << 256n) return value;
      return n;
    }
    return value;
  });
}

/**
 * Validates that a deserialized receipt has the minimum shape required
 * by viem's OP Stack withdrawal actions. Returns the receipt if valid,
 * null otherwise. This prevents tampered localStorage data from reaching
 * on-chain prove/finalize calls.
 */
export function validateReceiptShape(data: unknown): data is Record<string, unknown> {
  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    return false;
  }

  const receipt = data as Record<string, unknown>;

  // Required top-level fields for a viem TransactionReceipt used in OP Stack actions
  if (typeof receipt.blockNumber !== "bigint") return false;
  if (!isHex(receipt.transactionHash)) return false;
  if (!isHex(receipt.from)) return false;
  if (!isHex(receipt.to) && receipt.to !== null) return false;
  if (typeof receipt.status !== "string") return false;
  if (!Array.isArray(receipt.logs)) return false;

  // Validate each log has minimum required fields
  for (const log of receipt.logs) {
    if (typeof log !== "object" || log === null) return false;
    if (!isHex(log.address)) return false;
    if (!Array.isArray(log.topics)) return false;
  }

  return true;
}

const USER_REJECTED_PATTERNS = [
  "user rejected",
  "user denied",
  "rejected the request",
  "denied transaction",
  "user cancelled",
  "user canceled",
  "action_rejected",
];

const INSUFFICIENT_FUNDS_PATTERNS = [
  "insufficient funds",
  "exceeds balance",
  "not enough balance",
  "insufficient balance",
];

export function classifyTransactionError(
  err: unknown,
  fallbackMessage: string
): string {
  const message =
    err instanceof Error ? err.message.toLowerCase() : String(err).toLowerCase();

  if (USER_REJECTED_PATTERNS.some((p) => message.includes(p))) {
    return "Transaction rejected by user";
  }

  if (INSUFFICIENT_FUNDS_PATTERNS.some((p) => message.includes(p))) {
    return "Insufficient funds for gas";
  }

  return fallbackMessage;
}
