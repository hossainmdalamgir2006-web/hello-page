// IP validation + CIDR matching utility (IPv4 only)

export function isValidIPv4(ip: string): boolean {
  const parts = ip.split(".");
  if (parts.length !== 4) return false;
  return parts.every((p) => {
    if (!/^\d+$/.test(p)) return false;
    const n = Number(p);
    return n >= 0 && n <= 255 && String(n) === p;
  });
}

export function isValidCIDR(entry: string): boolean {
  const [ip, prefix] = entry.split("/");
  if (!ip || !prefix) return false;
  if (!isValidIPv4(ip)) return false;
  if (!/^\d+$/.test(prefix)) return false;
  const p = Number(prefix);
  return p >= 0 && p <= 32;
}

/** Validate a single whitelist entry (plain IPv4 or IPv4 CIDR). */
export function isValidIPEntry(entry: string): boolean {
  if (!entry) return false;
  return entry.includes("/") ? isValidCIDR(entry) : isValidIPv4(entry);
}

function ipv4ToInt(ip: string): number {
  return ip
    .split(".")
    .reduce((acc, oct) => (acc << 8) + Number(oct), 0) >>> 0;
}

/** True if `ip` falls within the CIDR range `cidr` (e.g., "203.0.113.0/24"). */
export function ipInCIDR(ip: string, cidr: string): boolean {
  if (!isValidIPv4(ip) || !isValidCIDR(cidr)) return false;
  const [range, prefixStr] = cidr.split("/");
  const prefix = Number(prefixStr);
  if (prefix === 0) return true;
  const mask = prefix === 32 ? 0xffffffff : (~0 << (32 - prefix)) >>> 0;
  return (ipv4ToInt(ip) & mask) === (ipv4ToInt(range) & mask);
}

/** True if `ip` matches any whitelist entry (exact IPv4 or CIDR). */
export function ipMatchesWhitelist(ip: string, entries: string[]): boolean {
  if (!ip || !entries?.length) return false;
  for (const raw of entries) {
    const entry = raw.trim();
    if (!entry) continue;
    if (entry.includes("/")) {
      if (ipInCIDR(ip, entry)) return true;
    } else if (entry === ip) {
      return true;
    }
  }
  return false;
}

/** Parse comma/newline-separated list and return { valid, invalid } entries. */
export function parseIPList(input: string): { valid: string[]; invalid: string[] } {
  const items = input
    .split(/[,\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
  const valid: string[] = [];
  const invalid: string[] = [];
  for (const item of items) {
    (isValidIPEntry(item) ? valid : invalid).push(item);
  }
  return { valid, invalid };
}
