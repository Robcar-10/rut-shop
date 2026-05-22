export const ADMIN_COOKIE = "rut_admin";
export const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export async function computeToken(secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode("rut-admin-v1"));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function isValidAdminToken(token: string): Promise<boolean> {
  const secret = process.env.ADMIN_SECRET ?? "";
  if (!secret) return false;
  const expected = await computeToken(secret);
  return token === expected;
}
