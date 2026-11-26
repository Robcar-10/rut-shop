import type Stripe from "stripe";

// Orders live in Stripe: each paid PaymentIntent created by this shop is one
// order. Stripe keeps them private and never loses one when two sales land at
// once, so the shop no longer writes its own order file.

export const ORDER_SOURCE = "rut-shop";
/** Stripe allows 50 metadata keys per payment; 11 hold the order details, the rest one line each. */
export const MAX_LINES = 38;

export interface OrderLine {
  productId?: string;
  name: string;
  size: string;
  color: string;
  qty: number;
  price: number;
}

export interface StoredOrder {
  id: string;
  stripeId: string;
  createdAt: string;
  customerName: string;
  customerEmail: string;
  address: string;
  shipMethod: string;
  items: OrderLine[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

/** One metadata key per line ("item_1", "item_2", ...), each well under Stripe's 500-character limit. */
export function linesToMetadata(lines: OrderLine[]): Record<string, string> {
  const out: Record<string, string> = {};
  lines.forEach((l, i) => {
    out[`item_${i + 1}`] = JSON.stringify({
      id: l.productId ?? "",
      n: l.name.slice(0, 80),
      s: l.size.slice(0, 20),
      c: l.color.slice(0, 30),
      q: l.qty,
      p: l.price,
    });
  });
  return out;
}

export function linesFromMetadata(metadata: Stripe.Metadata | null | undefined): OrderLine[] {
  const md = metadata ?? {};
  const keys = Object.keys(md)
    .filter((k) => /^item_\d+$/.test(k))
    .sort((a, b) => Number(a.slice(5)) - Number(b.slice(5)));
  if (keys.length > 0) {
    return keys.flatMap((k) => {
      try {
        const v = JSON.parse(md[k]);
        return [{ productId: v.id, name: String(v.n ?? ""), size: String(v.s ?? ""), color: String(v.c ?? ""), qty: Number(v.q) || 0, price: Number(v.p) || 0 }];
      } catch {
        return [];
      }
    });
  }
  // Orders placed before this change packed every line into one "items" value.
  try {
    const legacy = JSON.parse(md.items ?? "[]");
    return Array.isArray(legacy) ? legacy : [];
  } catch {
    return [];
  }
}

/** True for payments this shop created (new orders carry a source tag; older ones carry "items"). */
export function isShopPayment(intent: Stripe.PaymentIntent): boolean {
  const md = intent.metadata ?? {};
  return md.source === ORDER_SOURCE || typeof md.items === "string";
}

export function orderFromIntent(intent: Stripe.PaymentIntent): StoredOrder {
  const md = intent.metadata ?? {};
  return {
    id: `RUT-${intent.created}`,
    stripeId: intent.id,
    createdAt: new Date(intent.created * 1000).toISOString(),
    customerName: `${md.firstName ?? ""} ${md.lastName ?? ""}`.trim() || "Customer",
    customerEmail: intent.receipt_email ?? md.email ?? "",
    address: md.address ?? "",
    shipMethod: md.shipMethod ?? "standard",
    items: linesFromMetadata(md),
    subtotal: parseFloat(md.subtotal ?? "0"),
    shipping: parseFloat(md.shipping ?? "0"),
    tax: parseFloat(md.tax ?? "0"),
    total: intent.amount / 100,
  };
}
