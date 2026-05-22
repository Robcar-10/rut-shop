"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useCart } from "@/context/CartContext";
import { PRODUCTS } from "@/lib/products";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

type Step = "info" | "shipping" | "payment" | "success";

interface FormData {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  apt: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  shipMethod: "standard" | "express" | "pickup";
  newsletter: boolean;
  notes: string;
}

const INITIAL_FORM: FormData = {
  email: "", firstName: "", lastName: "", address: "", apt: "",
  city: "", state: "NY", zip: "", phone: "",
  shipMethod: "standard", newsletter: true, notes: "",
};

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const [step, setStep] = useState<Step>("info");
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [promo, setPromo] = useState("");
  const [promoApplied, setPromoApplied] = useState<{ code: string; amount: number; label: string; error?: boolean } | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderNum, setOrderNum] = useState("");

  const shipping = subtotal === 0 ? 0 : (form.shipMethod === "express" ? 14.99 : (subtotal >= 75 ? 0 : 6.99));
  const discount = promoApplied && !promoApplied.error ? promoApplied.amount : 0;
  const taxable = Math.max(0, subtotal - discount);
  const tax = parseFloat((taxable * 0.08875).toFixed(2));
  const total = parseFloat((taxable + shipping + tax).toFixed(2));

  const set = (k: keyof FormData, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const validate = (fields: (keyof FormData)[]) => {
    const e: Partial<Record<keyof FormData, string>> = {};
    if (fields.includes("email") && !/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Enter a valid email";
    if (fields.includes("firstName") && !form.firstName.trim()) e.firstName = "Required";
    if (fields.includes("lastName") && !form.lastName.trim()) e.lastName = "Required";
    if (fields.includes("address") && !form.address.trim()) e.address = "Required";
    if (fields.includes("city") && !form.city.trim()) e.city = "Required";
    if (fields.includes("zip") && !/^\d{5}$/.test(form.zip)) e.zip = "5-digit ZIP";
    setErrors(e as Partial<FormData>);
    return Object.keys(e).length === 0;
  };

  const goNext = async () => {
    if (step === "info") {
      if (!validate(["email", "firstName", "lastName", "address", "city", "zip"])) return;
      setStep("shipping");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (step === "shipping") {
      // Create payment intent before showing payment step
      try {
        const res = await fetch("/api/stripe/payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: Math.round(total * 100),
            email: form.email,
            metadata: {
              firstName: form.firstName,
              lastName: form.lastName,
              address: [form.address, form.apt, form.city, form.state, form.zip].filter(Boolean).join(", "),
              shipMethod: form.shipMethod,
              subtotal: subtotal.toFixed(2),
              shipping: shipping.toFixed(2),
              tax: tax.toFixed(2),
              items: JSON.stringify(
                items.map((item) => {
                  const p = PRODUCTS.find((p) => p.id === item.productId);
                  return {
                    name: p?.name ?? item.productId,
                    size: item.size,
                    color: item.color ?? "",
                    qty: item.qty,
                    price: p?.salePrice ?? p?.price ?? 0,
                  };
                })
              ).slice(0, 500),
            },
          }),
        });
        const data = await res.json();
        if (data.clientSecret) setClientSecret(data.clientSecret);
      } catch {
        // no Stripe key — demo mode, clientSecret stays null
      }
      setStep("payment");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const goBack = () => {
    if (step === "shipping") setStep("info");
    else if (step === "payment") setStep("shipping");
  };

  const applyPromo = () => {
    const code = promo.trim().toUpperCase();
    if (code === "NYACK10") setPromoApplied({ code, amount: subtotal * 0.1, label: "10% off (NYACK10)" });
    else if (code === "PRINT5") setPromoApplied({ code, amount: 5, label: "$5 off (PRINT5)" });
    else setPromoApplied({ code, amount: 0, label: "", error: true });
  };

  const onPaymentSuccess = () => {
    clearCart();
    setOrderNum("RUT-" + Math.floor(100000 + Math.random() * 900000));
    setStep("success");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Empty cart
  if (items.length === 0 && step !== "success") {
    return (
      <div>
        <Header activePath="checkout" />
        <main className="rut-container" style={{ padding: "80px 32px", textAlign: "center" }}>
          <div style={{ width: 72, height: 72, borderRadius: 999, background: "var(--rut-lavender-bg)", margin: "0 auto 20px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--rut-purple)" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
          </div>
          <h1 className="h-display" style={{ fontSize: 36 }}>Your cart is empty</h1>
          <p style={{ color: "var(--rut-fg-600)", fontSize: 16, marginTop: 12, marginBottom: 28 }}>
            Add a few things first — we&apos;ll print &amp; ship them straight from Nyack.
          </p>
          <Link href="/" className="btn-primary lg">Shop All Merch</Link>
        </main>
        <Footer />
      </div>
    );
  }

  // Success
  if (step === "success") {
    return (
      <div>
        <Header activePath="checkout" />
        <main className="rut-container-narrow" style={{ padding: "64px 32px" }}>
          <SuccessScreen orderNum={orderNum} email={form.email} total={total} />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Header activePath="checkout" />
      <main style={{ background: "var(--rut-surface-soft)", minHeight: "calc(100vh - 80px)" }}>
        <div className="rut-container" style={{ padding: "40px 32px 80px" }}>
          {/* Header row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 16 }}>
            <div>
              <p className="eyebrow purple" style={{ margin: 0 }}>Checkout</p>
              <h1 className="h-display" style={{ fontSize: 32, marginTop: 6 }}>Almost there.</h1>
            </div>
            <StepIndicator step={step} />
          </div>

          <div className="checkout-grid">
            {/* Left: form */}
            <div style={{ background: "#fff", borderRadius: 20, border: "1px solid var(--rut-border)", padding: 36 }}>
              {step === "info" && <InfoStep form={form} set={set} errors={errors} />}
              {step === "shipping" && <ShippingStep form={form} set={set} />}
              {step === "payment" && clientSecret ? (
                <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: "stripe", variables: { colorPrimary: "#B221F6", borderRadius: "10px" } } }}>
                  <PaymentStep onSuccess={onPaymentSuccess} total={total} />
                </Elements>
              ) : step === "payment" && (
                <DemoPaymentStep onSuccess={onPaymentSuccess} total={total} />
              )}

              {/* Nav buttons */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 36, paddingTop: 24, borderTop: "1px solid var(--rut-border)", flexWrap: "wrap", gap: 12 }}>
                {step !== "info" ? (
                  <button onClick={goBack} className="btn-link" style={{ fontSize: 14 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><polyline points="15 18 9 12 15 6" /></svg>
                    Back
                  </button>
                ) : (
                  <Link href="/" className="btn-link" style={{ fontSize: 14 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><polyline points="15 18 9 12 15 6" /></svg>
                    Continue shopping
                  </Link>
                )}
                {step !== "payment" && (
                  <button onClick={goNext} className="btn-primary lg" style={{ minWidth: 220 }}>
                    Continue to {step === "info" ? "Shipping" : "Payment"}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><polyline points="9 18 15 12 9 6" /></svg>
                  </button>
                )}
              </div>
            </div>

            {/* Right: order summary */}
            <OrderSummary
              items={items}
              subtotal={subtotal}
              shipping={shipping}
              tax={tax}
              total={total}
              discount={discount}
              promoApplied={promoApplied}
              promo={promo}
              setPromo={setPromo}
              applyPromo={applyPromo}
              shipMethod={form.shipMethod}
            />
          </div>
        </div>
      </main>
      <Footer />

      <style>{`
        .checkout-grid {
          display: grid;
          grid-template-columns: 1.4fr 1fr;
          gap: 40px;
          align-items: start;
        }
        @media (max-width: 900px) {
          .checkout-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 560px) {
          .checkout-grid > div:first-child { padding: 24px !important; }
          .rut-container { padding: 0 16px !important; }
        }
      `}</style>
    </div>
  );
}

// ─── Step indicator ───
function StepIndicator({ step }: { step: Step }) {
  const steps = [
    { id: "info", label: "Information" },
    { id: "shipping", label: "Shipping" },
    { id: "payment", label: "Payment" },
  ];
  const activeIdx = steps.findIndex((s) => s.id === step);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, flexWrap: "wrap" }}>
      {steps.map((s, i) => {
        const done = i < activeIdx;
        const active = i === activeIdx;
        return (
          <span key={s.id} style={{ display: "flex", alignItems: "center" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{
                width: 28, height: 28, borderRadius: 999,
                background: done ? "var(--rut-gradient-cta)" : "#fff",
                border: done ? "0" : active ? "2px solid var(--rut-purple)" : "1.5px solid var(--rut-border-strong)",
                color: done ? "#fff" : active ? "var(--rut-purple)" : "var(--rut-fg-400)",
                fontSize: 12, fontWeight: 800,
                display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                {done ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg> : (i + 1)}
              </span>
              <span style={{ fontSize: 13, fontWeight: active ? 700 : 500, color: active ? "var(--rut-fg-900)" : done ? "var(--rut-fg-600)" : "var(--rut-fg-400)", whiteSpace: "nowrap" }}>
                {s.label}
              </span>
            </span>
            {i < steps.length - 1 && (
              <span style={{ width: 32, height: 2, background: done ? "var(--rut-purple)" : "var(--rut-border-strong)", margin: "0 12px" }} />
            )}
          </span>
        );
      })}
    </div>
  );
}

// ─── Info step ───
function InfoStep({ form, set, errors }: { form: FormData; set: (k: keyof FormData, v: string | boolean) => void; errors: Partial<FormData> }) {
  return (
    <>
      <StepHeading num="01" title="Contact & shipping address" sub="We'll send your receipt and tracking here." />
      <div style={{ display: "grid", gap: 16, marginBottom: 24 }}>
        <Field label="Email" error={errors.email}>
          <input className={`form-input ${errors.email ? "error" : ""}`} type="email" placeholder="you@example.com" value={form.email} onChange={(e) => set("email", e.target.value)} />
        </Field>
        <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "var(--rut-fg-600)", cursor: "pointer" }}>
          <input type="checkbox" checked={form.newsletter} onChange={(e) => set("newsletter", e.target.checked)} style={{ width: 16, height: 16, accentColor: "var(--rut-purple)" }} />
          Send me drop announcements and a coupon every now and then (no spam)
        </label>
      </div>
      <div style={{ height: 1, background: "var(--rut-border)", margin: "8px 0 24px" }} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Field label="First name" error={errors.firstName}>
          <input className={`form-input ${errors.firstName ? "error" : ""}`} value={form.firstName} onChange={(e) => set("firstName", e.target.value)} />
        </Field>
        <Field label="Last name" error={errors.lastName}>
          <input className={`form-input ${errors.lastName ? "error" : ""}`} value={form.lastName} onChange={(e) => set("lastName", e.target.value)} />
        </Field>
        <div style={{ gridColumn: "span 2" }}>
          <Field label="Street address" error={errors.address}>
            <input className={`form-input ${errors.address ? "error" : ""}`} placeholder="123 Main St" value={form.address} onChange={(e) => set("address", e.target.value)} />
          </Field>
        </div>
        <div style={{ gridColumn: "span 2" }}>
          <Field label="Apt, suite, etc. (optional)">
            <input className="form-input" value={form.apt} onChange={(e) => set("apt", e.target.value)} />
          </Field>
        </div>
        <Field label="City" error={errors.city}>
          <input className={`form-input ${errors.city ? "error" : ""}`} value={form.city} onChange={(e) => set("city", e.target.value)} />
        </Field>
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 12 }}>
          <Field label="State">
            <select className="form-select" value={form.state} onChange={(e) => set("state", e.target.value)}>
              {["NY","NJ","CT","PA","MA","FL","CA","TX","IL","Other"].map((s) => <option key={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="ZIP" error={errors.zip}>
            <input className={`form-input ${errors.zip ? "error" : ""}`} maxLength={5} value={form.zip} onChange={(e) => set("zip", e.target.value.replace(/\D/g, ""))} />
          </Field>
        </div>
        <Field label="Phone (for delivery questions)">
          <input className="form-input" type="tel" placeholder="(845) 555-0123" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
        </Field>
        <Field label="Order notes (optional)">
          <input className="form-input" placeholder="Leave at front door, etc." value={form.notes} onChange={(e) => set("notes", e.target.value)} />
        </Field>
      </div>
    </>
  );
}

// ─── Shipping step ───
function ShippingStep({ form, set }: { form: FormData; set: (k: keyof FormData, v: string | boolean) => void }) {
  const opts = [
    { id: "standard", label: "Standard Shipping", sub: "5–7 business days · USPS Ground", price: "Free over $75", priceNote: "($6.99 otherwise)" },
    { id: "express", label: "Express Shipping", sub: "2–3 business days · UPS 2-Day", price: "$14.99", priceNote: "" },
    { id: "pickup", label: "Local Pickup in Nyack", sub: "Free · ready in 1–2 days at the shop", price: "Free", priceNote: "120 Main St, Nyack NY" },
  ] as const;
  return (
    <>
      <StepHeading num="02" title="How fast do you need it?" sub="Everything ships from our shop in Nyack, NY." />
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {opts.map((o) => {
          const active = form.shipMethod === o.id;
          return (
            <label key={o.id} style={{ display: "flex", alignItems: "center", gap: 16, padding: "18px 20px", border: active ? "2px solid var(--rut-purple)" : "1.5px solid var(--rut-border-strong)", background: active ? "rgba(178,33,246,.04)" : "#fff", borderRadius: 14, cursor: "pointer", transition: "all .15s" }}>
              <input type="radio" name="shipMethod" value={o.id} checked={active} onChange={() => set("shipMethod", o.id)} style={{ width: 18, height: 18, accentColor: "var(--rut-purple)" }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "var(--rut-fg-900)" }}>{o.label}</div>
                <div style={{ fontSize: 13, color: "var(--rut-fg-500)", marginTop: 2 }}>{o.sub}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 15, fontWeight: 700 }}>{o.price}</div>
                {o.priceNote && <div style={{ fontSize: 12, color: "var(--rut-fg-500)" }}>{o.priceNote}</div>}
              </div>
            </label>
          );
        })}
      </div>
      <div style={{ marginTop: 28, padding: 18, background: "var(--rut-lavender-bg)", border: "1px solid var(--rut-lavender-border)", borderRadius: 14, display: "flex", gap: 12 }}>
        <span style={{ width: 24, height: 24, borderRadius: 999, background: "var(--rut-gradient-cta)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
        </span>
        <div style={{ fontSize: 13, color: "var(--rut-fg-700)", lineHeight: 1.55 }}>
          <strong style={{ color: "var(--rut-fg-900)" }}>Heads up:</strong> Production takes 3–5 business days before your order ships. We&apos;ll email you the moment it goes out.
        </div>
      </div>
    </>
  );
}

// ─── Payment step with real Stripe Elements ───
function PaymentStep({ onSuccess, total }: { onSuccess: () => void; total: number }) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!stripe || !elements) return;
    setSubmitting(true);
    setPayError(null);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}/checkout?success=1` },
      redirect: "if_required",
    });

    if (error) {
      setPayError(error.message ?? "Payment failed. Please try again.");
      setSubmitting(false);
    } else {
      onSuccess();
    }
  };

  return (
    <>
      <StepHeading num="03" title="Pay securely" sub="All transactions encrypted via Stripe. We never see your card details." />
      <PaymentElement options={{ layout: "tabs" }} />
      {payError && <div className="form-error" style={{ marginTop: 12 }}>{payError}</div>}
      <div style={{ marginTop: 22, display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", background: "var(--rut-surface-soft)", borderRadius: 12 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--rut-success)" strokeWidth="2.2"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
        <div style={{ fontSize: 13, color: "var(--rut-fg-600)" }}>
          Your payment is encrypted &amp; processed by <strong style={{ color: "var(--rut-fg-900)" }}>Stripe</strong>. We don&apos;t store your card.
        </div>
      </div>
      <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end" }}>
        <button onClick={handleSubmit} className="btn-primary lg" disabled={submitting || !stripe} style={{ minWidth: 220 }}>
          {submitting ? (
            <><span className="spinner" /> Processing...</>
          ) : (
            <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg> Pay ${total.toFixed(2)}</>
          )}
        </button>
      </div>
    </>
  );
}

// ─── Demo payment (no Stripe key configured) ───
function DemoPaymentStep({ onSuccess, total }: { onSuccess: () => void; total: number }) {
  const [submitting, setSubmitting] = useState(false);
  const handleSubmit = () => {
    setSubmitting(true);
    setTimeout(() => { setSubmitting(false); onSuccess(); }, 1400);
  };
  return (
    <>
      <StepHeading num="03" title="Pay securely" sub="Demo mode — no real payment will be charged." />
      <div style={{ padding: 20, background: "var(--rut-lavender-bg)", borderRadius: 12, border: "1px solid var(--rut-lavender-border)", fontSize: 14, color: "var(--rut-fg-700)", marginBottom: 16 }}>
        Add <code style={{ background: "#fff", padding: "2px 6px", borderRadius: 4 }}>NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code> to your <code style={{ background: "#fff", padding: "2px 6px", borderRadius: 4 }}>.env.local</code> to enable real Stripe payments.
      </div>
      <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end" }}>
        <button onClick={handleSubmit} className="btn-primary lg" disabled={submitting} style={{ minWidth: 220 }}>
          {submitting ? <><span className="spinner" /> Processing...</> : <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg> Pay ${total.toFixed(2)}</>}
        </button>
      </div>
    </>
  );
}

// ─── Order summary sidebar ───
function OrderSummary({ items, subtotal, shipping, tax, total, discount, promoApplied, promo, setPromo, applyPromo, shipMethod }: {
  items: ReturnType<typeof useCart>["items"];
  subtotal: number; shipping: number; tax: number; total: number; discount: number;
  promoApplied: { code: string; amount: number; label: string; error?: boolean } | null;
  promo: string; setPromo: (v: string) => void; applyPromo: () => void;
  shipMethod: string;
}) {
  return (
    <aside style={{ background: "#fff", borderRadius: 20, border: "1px solid var(--rut-border)", padding: 28, position: "sticky", top: 96 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <h3 style={{ fontFamily: "var(--rut-font-display)", fontSize: 18, fontWeight: 800, margin: 0 }}>Order Summary</h3>
        <span style={{ fontSize: 12, color: "var(--rut-fg-500)" }}>{items.reduce((s, i) => s + i.qty, 0)} item{items.reduce((s, i) => s + i.qty, 0) === 1 ? "" : "s"}</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14, paddingBottom: 18, borderBottom: "1px solid var(--rut-border)" }}>
        {items.map((item, idx) => {
          const p = PRODUCTS.find((p) => p.id === item.productId);
          if (!p) return null;
          const price = p.salePrice ?? p.price;
          return (
            <div key={idx} style={{ display: "flex", gap: 12 }}>
              <div style={{ position: "relative", width: 60, height: 75, borderRadius: 10, overflow: "hidden", background: "var(--rut-surface-soft)", flexShrink: 0 }}>
                <Image src={p.images[0]} alt="" fill sizes="60px" style={{ objectFit: "cover" }} />
                <span style={{ position: "absolute", top: -6, right: -6, background: "var(--rut-fg-900)", color: "#fff", width: 22, height: 22, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800 }}>{item.qty}</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.3 }}>{p.name}</div>
                <div style={{ fontSize: 11, color: "var(--rut-fg-500)", marginTop: 3 }}>
                  {item.color && <>{item.color} · </>}Size {item.size}
                </div>
              </div>
              <div style={{ fontSize: 13, fontWeight: 700 }}>${(price * item.qty).toFixed(2)}</div>
            </div>
          );
        })}
      </div>

      {/* Promo */}
      <div style={{ padding: "18px 0", borderBottom: "1px solid var(--rut-border)" }}>
        <div style={{ display: "flex", gap: 8 }}>
          <input className="form-input" placeholder="Promo code" value={promo} onChange={(e) => setPromo(e.target.value)} style={{ padding: "10px 12px", fontSize: 13 }} onKeyDown={(e) => e.key === "Enter" && applyPromo()} />
          <button onClick={applyPromo} className="btn-ghost" style={{ padding: "10px 18px", fontSize: 13, flexShrink: 0 }}>Apply</button>
        </div>
        {promoApplied && !promoApplied.error && (
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, padding: "8px 12px", background: "var(--rut-success-bg)", borderRadius: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--rut-success)" }}>✓ {promoApplied.label}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--rut-success)" }}>−${promoApplied.amount.toFixed(2)}</span>
          </div>
        )}
        {promoApplied?.error && <div style={{ fontSize: 12, color: "var(--rut-destructive)", marginTop: 8 }}>Code &ldquo;{promoApplied.code}&rdquo; isn&apos;t valid.</div>}
        {!promoApplied && <div style={{ fontSize: 11, color: "var(--rut-fg-400)", marginTop: 8 }}>Try <code style={{ background: "var(--rut-surface-soft)", padding: "1px 5px", borderRadius: 4 }}>NYACK10</code> or <code style={{ background: "var(--rut-surface-soft)", padding: "1px 5px", borderRadius: 4 }}>PRINT5</code></div>}
      </div>

      {/* Totals */}
      <div style={{ padding: "18px 0", display: "flex", flexDirection: "column", gap: 8 }}>
        <SummaryLine label="Subtotal" value={`$${subtotal.toFixed(2)}`} />
        {discount > 0 && <SummaryLine label="Discount" value={`−$${discount.toFixed(2)}`} accent />}
        <SummaryLine label={`Shipping (${shipMethod === "pickup" ? "pickup" : shipMethod})`} value={shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`} />
        <SummaryLine label="Tax (est.)" value={`$${tax.toFixed(2)}`} />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "18px 0 0", borderTop: "2px solid var(--rut-fg-900)" }}>
        <span style={{ fontFamily: "var(--rut-font-display)", fontSize: 18, fontWeight: 800 }}>Total</span>
        <span style={{ fontFamily: "var(--rut-font-display)", fontSize: 28, fontWeight: 900 }}>${total.toFixed(2)}</span>
      </div>
      <div style={{ fontSize: 11, color: "var(--rut-fg-400)", marginTop: 6, textAlign: "right" }}>USD · Including all taxes</div>

      <div style={{ marginTop: 22, padding: "12px 14px", background: "var(--rut-lavender-bg)", borderRadius: 10, display: "flex", alignItems: "center", gap: 10 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--rut-purple)" strokeWidth="2.2"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
        <div style={{ fontSize: 11, color: "var(--rut-fg-600)", lineHeight: 1.4 }}>
          <strong style={{ color: "var(--rut-fg-900)" }}>Secured by Stripe.</strong> 256-bit SSL. Card data never stored on our servers.
        </div>
      </div>
    </aside>
  );
}

function SummaryLine({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <span style={{ fontSize: 14, color: "var(--rut-fg-600)" }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 600, color: accent ? "var(--rut-success)" : "var(--rut-fg-900)" }}>{value}</span>
    </div>
  );
}

function StepHeading({ num, title, sub }: { num: string; title: string; sub?: string }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <span style={{ fontSize: 11, fontWeight: 900, color: "var(--rut-purple)", letterSpacing: ".15em", whiteSpace: "nowrap" }}>STEP {num}</span>
      </div>
      <h2 className="h-display" style={{ fontSize: 24 }}>{title}</h2>
      {sub && <p style={{ color: "var(--rut-fg-500)", fontSize: 14, marginTop: 6 }}>{sub}</p>}
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="form-label">{label}</label>
      {children}
      {error && <div className="form-error">{error}</div>}
    </div>
  );
}

function SuccessScreen({ orderNum, email, total }: { orderNum: string; email: string; total: number }) {
  return (
    <div style={{ textAlign: "center", padding: "40px 0 0" }}>
      <div style={{ width: 80, height: 80, borderRadius: 999, background: "var(--rut-gradient-cta)", margin: "0 auto 24px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "var(--rut-shadow-glow)" }}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <p className="eyebrow purple">Order Confirmed</p>
      <h1 className="h-display" style={{ fontSize: 48, marginTop: 14 }}>
        Thanks — <span className="gradient-text">we got it.</span>
      </h1>
      <p style={{ color: "var(--rut-fg-600)", fontSize: 16, marginTop: 16, maxWidth: 480, margin: "16px auto 0" }}>
        Your order is in the queue. We&apos;ll send a confirmation to <strong style={{ color: "var(--rut-fg-900)" }}>{email || "your email"}</strong> and let you know the moment it ships from our Nyack shop.
      </p>
      <div style={{ marginTop: 36, padding: 24, background: "#fff", border: "1px solid var(--rut-border)", borderRadius: 16, display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24, textAlign: "left" }} className="success-grid">
        <div>
          <div className="eyebrow muted">Order Number</div>
          <div style={{ fontFamily: "var(--rut-font-display)", fontSize: 18, fontWeight: 800, marginTop: 4 }}>{orderNum}</div>
        </div>
        <div>
          <div className="eyebrow muted">Total Charged</div>
          <div style={{ fontFamily: "var(--rut-font-display)", fontSize: 18, fontWeight: 800, marginTop: 4 }}>${total.toFixed(2)}</div>
        </div>
        <div>
          <div className="eyebrow muted">Est. Ship Date</div>
          <div style={{ fontFamily: "var(--rut-font-display)", fontSize: 18, fontWeight: 800, marginTop: 4 }}>3–5 business days</div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 36, flexWrap: "wrap" }}>
        <Link href="/" className="btn-primary lg">Keep Shopping</Link>
        <a href="https://rolleduptees.com" className="btn-ghost">Visit Main Site →</a>
      </div>
      <p style={{ color: "var(--rut-fg-500)", fontSize: 13, marginTop: 36 }}>
        Questions? Email <a href="mailto:shop@rolleduptees.com" style={{ color: "var(--rut-purple)", fontWeight: 600 }}>shop@rolleduptees.com</a> or call (845) 358-2037 — Rob picks up.
      </p>
      <style>{`
        @media (max-width: 560px) {
          .success-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
