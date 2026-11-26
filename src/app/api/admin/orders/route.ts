import { NextResponse } from "next/server";
import Stripe from "stripe";
import { requireAdmin } from "@/lib/admin-guard";
import { blobUrl, ORDERS_PATH } from "@/lib/blob-store";
import { isShopPayment, orderFromIntent, type StoredOrder } from "@/lib/orders";

export type { StoredOrder };

export const dynamic = "force-dynamic";

/** How many recent Stripe payments to scan for shop orders. */
const SCAN_LIMIT = 500;

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-04-22.dahlia" });
}

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const orders: StoredOrder[] = [];
  try {
    let scanned = 0;
    for await (const intent of getStripe().paymentIntents.list({ limit: 100 })) {
      if (++scanned > SCAN_LIMIT) break;
      if (intent.status === "succeeded" && isShopPayment(intent)) orders.push(orderFromIntent(intent));
    }
  } catch (err) {
    console.error("[admin/orders] Stripe list failed", err);
    return NextResponse.json({ error: "Couldn't load orders from Stripe" }, { status: 502, headers: { "Cache-Control": "no-store" } });
  }

  // Oldest first, to match how the Orders tab has always received them.
  orders.sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  // The old order file lived in public storage. Tell the admin page if it is
  // still there so it can offer a backup download and removal.
  let legacyFile = false;
  try {
    legacyFile = Boolean(await blobUrl(ORDERS_PATH));
  } catch {
    legacyFile = false;
  }

  return NextResponse.json({ orders, legacyFile }, { headers: { "Cache-Control": "no-store" } });
}
