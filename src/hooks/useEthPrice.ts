"use client";

import { useEffect, useState } from "react";

export function useEthPrice() {
  const [price, setPrice] = useState<number | undefined>();

  useEffect(() => {
    let stale = false;

    async function fetchPrice() {
      try {
        const res = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
        );
        const data = await res.json();
        if (!stale && data.ethereum?.usd) {
          setPrice(data.ethereum.usd);
        }
      } catch {
        // silently fail — USD display is non-critical
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
