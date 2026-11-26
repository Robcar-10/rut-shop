import { NextResponse } from "next/server";
import Stripe from "stripe";
import { sendOwnerOrderEmail } from "@/lib/email";
import { isShopPayment, orderFromIntent } from "@/lib/orders";

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

    // The Stripe account may also take other payments (for example Studio
    // subscriptions); only this shop's orders get an order email.
    if (!isShopPayment(intent)) return NextResponse.json({ received: true });

    // The order itself is the paid PaymentIntent in Stripe; the admin Orders
    // tab reads it from there. Nothing is written to public storage.
    const order = orderFromIntent(intent);

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
