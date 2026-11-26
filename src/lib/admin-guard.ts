import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE, isValidAdminToken } from "@/lib/admin-auth";

/**
 * Route-level admin check for /api/admin/*. The proxy already blocks these
 * paths without a valid admin cookie; this second check keeps each route safe
 * even if the proxy matcher is ever changed.
 *
 * Returns a 401 response to send back, or null when the caller is the admin.
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (token && (await isValidAdminToken(token))) return null;
  return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: { "Cache-Control": "no-store" } });
}
