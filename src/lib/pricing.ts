// Order math shared by the checkout page (to show totals) and the payment
// API (to charge them). The server always recomputes from product data, so
// what the browser shows can never change what a buyer is charged.

export type ShipMethod = "standard" | "express" | "pickup";

/** Sales tax rate applied at checkout. Confirm the right rule with the accountant. */
export const TAX_RATE = 0.08875;
export const FREE_SHIPPING_MIN = 75;
export const STANDARD_SHIPPING = 6.99;
export const EXPRESS_SHIPPING = 14.99;

const PROMOS: Record<string, { label: string; percent?: number; fixed?: number }> = {
  NYACK10: { label: "10% off (NYACK10)", percent: 10 },
  PRINT5: { label: "$5 off (PRINT5)", fixed: 5 },
};

export const round2 = (n: number) => Math.round(n * 100) / 100;

export function unitPrice(p: { price: number; salePrice?: number }): number {
  return p.salePrice ?? p.price;
}

/** The discount a code gives on this subtotal, or null when the code isn't valid. */
export function promoDiscount(code: string | null | undefined, subtotal: number): { code: string; amount: number; label: string } | null {
  if (!code) return null;
  const key = code.trim().toUpperCase();
  const promo = PROMOS[key];
  if (!promo) return null;
  const raw = promo.percent ? subtotal * (promo.percent / 100) : promo.fixed ?? 0;
  return { code: key, amount: round2(Math.min(raw, subtotal)), label: promo.label };
}

export function shippingFor(method: ShipMethod, subtotal: number): number {
  if (subtotal <= 0 || method === "pickup") return 0;
  if (method === "express") return EXPRESS_SHIPPING;
  return subtotal >= FREE_SHIPPING_MIN ? 0 : STANDARD_SHIPPING;
}

export interface Totals {
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  promoCode: string | null;
}

export function computeTotals(input: { subtotal: number; shipMethod: ShipMethod; promoCode?: string | null }): Totals {
  const subtotal = round2(input.subtotal);
  const promo = promoDiscount(input.promoCode, subtotal);
  const discount = promo?.amount ?? 0;
  const shipping = shippingFor(input.shipMethod, subtotal);
  const taxable = Math.max(0, subtotal - discount);
  const tax = round2(taxable * TAX_RATE);
  const total = round2(taxable + shipping + tax);
  return { subtotal, discount, shipping, tax, total, promoCode: promo?.code ?? null };
}
