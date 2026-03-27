import { type NextRequest } from "next/server";
import { bridgeConfig } from "@/config/bridge.config";

// Allowed explorer API base URLs (prevent open proxy)
const ALLOWED_URLS = [
  bridgeConfig.l1.explorerApiUrl,
  bridgeConfig.l2.explorerApiUrl,
].filter(Boolean) as string[];

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return Response.json({ error: "Missing url parameter" }, { status: 400 });
  }

  // Validate the URL starts with one of our configured explorer APIs
  const isAllowed = ALLOWED_URLS.some((allowed) => url.startsWith(allowed));
  if (!isAllowed) {
    return Response.json({ error: "URL not allowed" }, { status: 403 });
  }

  try {
    const response = await fetch(url);
    const data = await response.json();
    return Response.json(data);
  } catch {
    return Response.json(
      { error: "Failed to fetch from explorer" },
      { status: 502 }
    );
  }
}
