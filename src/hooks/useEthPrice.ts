"use client";

import { useEffect, useState } from "react";

const PRICE_APIS = [
  {
    url: "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd",
    extract: (data: Record<string, unknown>) =>
      (data as { ethereum?: { usd?: number } }).ethereum?.usd,
  },
  {
    url: "https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD",
    extract: (data: Record<string, unknown>) =>
      (data as { USD?: number }).USD,
  },
];

export function useEthPrice() {
  const [price, setPrice] = useState<number | undefined>();

  useEffect(() => {
    let stale = false;

    async function fetchPrice() {
      for (const api of PRICE_APIS) {
        try {
          const res = await fetch(api.url);
          if (!res.ok) continue;
          const data = await res.json();
          const value = api.extract(data);
          if (!stale && value && value > 0) {
            setPrice(value);
            return;
          }
        } catch {
          continue;
        }
      }
    }

    fetchPrice();
    const interval = setInterval(fetchPrice, 60_000);

    return () => {
      stale = true;
      clearInterval(interval);
    };
  }, []);

  return price;
}
