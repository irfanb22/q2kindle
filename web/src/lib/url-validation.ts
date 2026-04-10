import dns from "dns/promises";

// Private and reserved IP ranges that should never be fetched
const BLOCKED_IP_RANGES = [
  // IPv4
  { prefix: "127.", description: "loopback" },
  { prefix: "10.", description: "private class A" },
  { prefix: "0.", description: "current network" },
  { prefix: "169.254.", description: "link-local" },
  { prefix: "224.", description: "multicast" },
  { prefix: "255.255.255.255", description: "broadcast" },
  // IPv6
  { prefix: "::1", description: "IPv6 loopback" },
  { prefix: "fc", description: "IPv6 unique local" },
  { prefix: "fd", description: "IPv6 unique local" },
  { prefix: "fe80:", description: "IPv6 link-local" },
];

function isPrivateIPv4(ip: string): boolean {
  // 172.16.0.0 – 172.31.255.255
  if (ip.startsWith("172.")) {
    const second = parseInt(ip.split(".")[1], 10);
    if (second >= 16 && second <= 31) return true;
  }
  // 192.168.0.0/16
  if (ip.startsWith("192.168.")) return true;

  // Check prefix-based blocked ranges
  for (const range of BLOCKED_IP_RANGES) {
    if (ip.startsWith(range.prefix)) return true;
  }

  return false;
}

/**
 * Validates a URL is safe to fetch (not pointing at internal/private resources).
 * Returns { valid: true } or { valid: false, error: "reason" }.
 */
export async function validateUrl(
  url: string
): Promise<{ valid: boolean; error?: string }> {
  // 1. Parse the URL
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { valid: false, error: "Invalid URL format" };
  }

  // 2. Only allow http and https
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return { valid: false, error: "Only http and https URLs are allowed" };
  }

  // 3. Block localhost hostnames
  const hostname = parsed.hostname.toLowerCase();
  if (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "[::1]" ||
    hostname === "::1"
  ) {
    return { valid: false, error: "URLs pointing to localhost are not allowed" };
  }

  // 4. Resolve hostname to IP and check against private ranges
  try {
    const { address } = await dns.lookup(hostname);
    if (isPrivateIPv4(address)) {
      return {
        valid: false,
        error: "URLs pointing to private or internal addresses are not allowed",
      };
    }
  } catch {
    return { valid: false, error: "Could not resolve hostname" };
  }

  return { valid: true };
}
