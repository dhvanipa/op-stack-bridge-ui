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

  // Validate the URL origin matches one of our configured explorer APIs
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return Response.json({ error: "Invalid URL" }, { status: 400 });
  }

  const isAllowed = ALLOWED_URLS.some((allowed) => {
    const allowedUrl = new URL(allowed);
    return parsedUrl.origin === allowedUrl.origin && parsedUrl.pathname.startsWith(allowedUrl.pathname);
  });
  if (!isAllowed) {
    return Response.json({ error: "URL not allowed" }, { status: 403 });
  }

  try {
    const response = await fetch(parsedUrl.toString());
    if (!response.ok) {
      return Response.json({ error: `Explorer returned ${response.status}` }, { status: response.status });
    }
    const data = await response.json();
    return Response.json(data);
  } catch {
    return Response.json(
      { error: "Failed to fetch from explorer" },
      { status: 502 }
    );
  }
}
