// Reconstruct a serialized transaction receipt from the L2 RPC.
// This allows prove/finalize to work even when localStorage was cleared.

import { publicClientL2 } from "@/lib/clients";
import { serializeBigInt } from "@/lib/utils";

export async function reconstructReceiptData(
  l2TxHash: `0x${string}`
): Promise<string> {
  const receipt = await publicClientL2.getTransactionReceipt({
    hash: l2TxHash,
  });
  return serializeBigInt(receipt);
}
