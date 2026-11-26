import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getProducts } from "@/lib/products";
import { computeTotals, round2, unitPrice, type ShipMethod } from "@/lib/pricing";
import { linesToMetadata, MAX_LINES, ORDER_SOURCE, type OrderLine } from "@/lib/orders";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-04-22.dahlia" });
}

const SHIP_METHODS: ShipMethod[] = ["standard", "express", "pickup"];
const noStore = { "Cache-Control": "no-store" };
const text = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

interface CartLine {
  productId: string;
  size: string;
  color: string | null;
  qty: number;
}

/**
 * Creates the Stripe payment for a checkout. The browser sends only what is in
 * the cart; every price, the promo discount, shipping and tax are worked out
 * here from the product data, so the amount charged can't be changed from the
 * browser.
 */
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400, headers: noStore });
  }

  const email = text(body.email, 200);
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ error: "Enter a valid email" }, { status: 400, headers: noStore });
  }

  const shipMethod = (SHIP_METHODS as string[]).includes(String(body.shipMethod)) ? (body.shipMethod as ShipMethod) : "standard";
  const rawItems = Array.isArray(body.items) ? (body.items as CartLine[]) : [];
  if (rawItems.length === 0) {
    return NextResponse.json({ error: "Your cart is empty" }, { status: 400, headers: noStore });
  }
  if (rawItems.length > MAX_LINES) {
    return NextResponse.json({ error: `Please keep it to ${MAX_LINES} different items per order` }, { status: 400, headers: noStore });
  }

  const products = await getProducts();
  const lines: OrderLine[] = [];
  for (const item of rawItems) {
    const product = products.find((p) => p.id === item?.productId);
    const qty = Number(item?.qty);
    const size = typeof item?.size === "string" ? item.size : "";
    const color = typeof item?.color === "string" ? item.color : "";
    const sizeOk = product ? product.sizes.length === 0 || product.sizes.includes(size) : false;
    const colorOk = product ? color === "" || product.colors.some((c) => c.name === color) : false;
    if (!product || !Number.isInteger(qty) || qty < 1 || qty > 99 || !sizeOk || !colorOk) {
      return NextResponse.json(
        { error: "An item in your cart has changed. Please review your cart and try again." },
        { status: 409, headers: noStore },
      );
    }
    lines.push({ productId: product.id, name: product.name, size, color, qty, price: unitPrice(product) });
  }

  const subtotal = round2(lines.reduce((sum, l) => sum + l.price * l.qty, 0));
  const totals = computeTotals({ subtotal, shipMethod, promoCode: text(body.promoCode, 40) || null });
  const amount = Math.round(totals.total * 100);
  if (amount < 50) {
    return NextResponse.json({ error: "Order total is too small to charge" }, { status: 400, headers: noStore });
  }

  const customer = (body.customer ?? {}) as Record<string, unknown>;

  try {
    const intent = await getStripe().paymentIntents.create({
      amount,
      currency: "usd",
      receipt_email: email,
      automatic_payment_methods: { enabled: true },
      metadata: {
        source: ORDER_SOURCE,
        firstName: text(customer.firstName, 80),
        lastName: text(customer.lastName, 80),
        address: text(customer.address, 400),
        phone: text(customer.phone, 40),
        shipMethod,
        subtotal: totals.subtotal.toFixed(2),
        discount: totals.discount.toFixed(2),
        promo: totals.promoCode ?? "",
        shipping: totals.shipping.toFixed(2),
        tax: totals.tax.toFixed(2),
        ...linesToMetadata(lines),
      },
    });

    return NextResponse.json({ clientSecret: intent.client_secret, totals }, { headers: noStore });
  } catch (err) {
    console.error("[payment-intent] create failed", err);
    return NextResponse.json({ error: "Failed to create payment" }, { status: 500, headers: noStore });
  }
}
