// Block explorer API types and fetch utility
// Works with Etherscan and Blockscout-compatible APIs

export interface BlockExplorerTransaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  input: string; // calldata hex
  timeStamp: string;
  isError: string;
  blockNumber: string;
  gasUsed: string;
  functionName: string;
}

interface BlockExplorerApiResponse {
  status: string;
  message: string;
  result: BlockExplorerTransaction[] | string;
}

export async function fetchExplorerTxList(
  explorerApiUrl: string,
  address: string,
  extraParams?: Record<string, string>
): Promise<BlockExplorerTransaction[]> {
  const params = new URLSearchParams({
    module: "account",
    action: "txlist",
    address,
    sort: "desc",
    page: "1",
    offset: "100",
    ...extraParams,
  });

  // Build the target explorer URL, then proxy through our API route to avoid CORS
  const targetUrl = `${explorerApiUrl}?${params.toString()}`;
  const proxyUrl = `/api/explorer?url=${encodeURIComponent(targetUrl)}`;

  let response: Response;
  try {
    response = await fetch(proxyUrl);
  } catch {
    return [];
  }

  // Retry once on rate limit
  if (response.status === 429) {
    await new Promise((r) => setTimeout(r, 2000));
    try {
      response = await fetch(proxyUrl);
    } catch {
      return [];
    }
    if (!response.ok) return [];
  }

  if (!response.ok) return [];

  const data: BlockExplorerApiResponse = await response.json();

  // Some explorers return a string like "No transactions found" instead of an array
  if (!Array.isArray(data.result)) return [];

  // Filter out failed transactions
  return data.result.filter((tx) => tx.isError !== "1");
}
