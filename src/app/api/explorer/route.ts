import { type NextRequest } from "next/server";
import { bridgeConfig } from "@/config/bridge.config";

// Pre-parse allowed explorer API base URLs at module load.
// Each entry stores the origin and a pathname prefix that MUST be at least "/api"
// to prevent the proxy from forwarding requests to arbitrary paths on the origin.
const ALLOWED_BASES = [bridgeConfig.l1.explorerApiUrl, bridgeConfig.l2.explorerApiUrl]
  .filter(Boolean)
  .map((raw) => {
    const u = new URL(raw as string);
    // Ensure pathname ends with "/" for correct prefix matching
    const pathname = u.pathname.endsWith("/") ? u.pathname : u.pathname + "/";
    return { origin: u.origin, pathname };
  })
  // Reject entries where the pathname is just "/" — that would allow any path on the origin
  .filter((entry) => entry.pathname.length > 1);

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return Response.json({ error: "Missing url parameter" }, { status: 400 });
  }

  // Only allow http/https schemes — blocks file://, data://, etc.
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return Response.json({ error: "Invalid URL" }, { status: 400 });
  }

  if (parsedUrl.protocol !== "https:" && parsedUrl.protocol !== "http:") {
    return Response.json({ error: "Invalid URL scheme" }, { status: 400 });
  }

  // Strip any userinfo (user:pass@host) to prevent credential-smuggling attacks
  if (parsedUrl.username || parsedUrl.password) {
    return Response.json({ error: "URL must not contain credentials" }, { status: 400 });
  }

  const requestPath = parsedUrl.pathname + "/";
  const isAllowed = ALLOWED_BASES.some(
    (base) => parsedUrl.origin === base.origin && requestPath.startsWith(base.pathname)
  );

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
