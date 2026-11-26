import { NextResponse } from "next/server";
import { del } from "@vercel/blob";
import { requireAdmin } from "@/lib/admin-guard";
import { blobUrl, ORDERS_PATH } from "@/lib/blob-store";

export const dynamic = "force-dynamic";

// The old orders.json sat in the public Blob store, readable by anyone who
// guessed its address. Every order in it is also a payment in Stripe. These
// routes let the admin download a backup copy, then delete the public file.

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const url = await blobUrl(ORDERS_PATH);
  if (!url) return NextResponse.json({ error: "Already removed" }, { status: 404 });

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return NextResponse.json({ error: "Couldn't read the old file" }, { status: 502 });

  return new NextResponse(await res.text(), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": 'attachment; filename="rut-shop-orders-backup.json"',
      "Cache-Control": "no-store",
    },
  });
}

export async function DELETE() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const url = await blobUrl(ORDERS_PATH);
  if (url) await del(url);
  return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
