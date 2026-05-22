import { NextResponse } from "next/server";
import Stripe from "stripe";
import { readJson, writeJson, ORDERS_PATH } from "@/lib/blob-store";
import { sendOwnerOrderEmail } from "@/lib/email";
import type { StoredOrder } from "@/app/api/admin/orders/route";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-04-22.dahlia" });
}

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "payment_intent.succeeded") {
    const intent = event.data.object as Stripe.PaymentIntent;

    // Parse order metadata packed by checkout
    let items: StoredOrder["items"] = [];
    try {
      items = JSON.parse(intent.metadata?.items ?? "[]");
    } catch {
      items = [];
    }

    const order: StoredOrder = {
      id: `RUT-${Date.now()}`,
      stripeId: intent.id,
      createdAt: new Date().toISOString(),
      customerName: `${intent.metadata?.firstName ?? ""} ${intent.metadata?.lastName ?? ""}`.trim() || "Customer",
      customerEmail: intent.receipt_email ?? "",
      address: intent.metadata?.address ?? "",
      shipMethod: intent.metadata?.shipMethod ?? "standard",
      items,
      subtotal: parseFloat(intent.metadata?.subtotal ?? "0"),
      shipping: parseFloat(intent.metadata?.shipping ?? "0"),
      tax: parseFloat(intent.metadata?.tax ?? "0"),
      total: intent.amount / 100,
    };

    // Append to orders blob
    try {
      const existing = await readJson<StoredOrder[]>(ORDERS_PATH) ?? [];
      await writeJson(ORDERS_PATH, [...existing, order]);
    } catch (err) {
      console.error("[webhook] Failed to store order:", err);
    }

    // Send owner notification email
    try {
      await sendOwnerOrderEmail({
        stripeId: intent.id,
        customerEmail: order.customerEmail,
        customerName: order.customerName,
        address: order.address,
        items: order.items,
        subtotal: order.subtotal,
        shipping: order.shipping,
        tax: order.tax,
        total: order.total,
        shipMethod: order.shipMethod,
      });
    } catch (err) {
      console.error("[webhook] Failed to send order email:", err);
    }
  }

  return NextResponse.json({ received: true });
}
