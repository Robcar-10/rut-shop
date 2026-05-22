import { NextResponse } from "next/server";
import Stripe from "stripe";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-04-22.dahlia" });
}

export async function POST(req: Request) {
  const { amount, email, metadata = {} } = await req.json();

  if (!amount || amount < 50) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }

  try {
    const intent = await getStripe().paymentIntents.create({
      amount,
      currency: "usd",
      receipt_email: email,
      metadata,
      automatic_payment_methods: { enabled: true },
    });

    return NextResponse.json({ clientSecret: intent.client_secret });
  } catch (err) {
    console.error("[payment-intent] create failed", err);
    return NextResponse.json({ error: "Failed to create payment intent" }, { status: 500 });
  }
}
