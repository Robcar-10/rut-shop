"use client";

import { useState, use } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { ProductCard } from "@/components/store/ProductCard";
import StarRating from "@/components/store/StarRating";
import Toast from "@/components/ui/Toast";
import { PRODUCTS, findProduct } from "@/lib/products";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const product = findProduct(id);
  if (!product) notFound();

  const router = useRouter();
  const { addItem } = useCart();

  const [activeImg, setActiveImg] = useState(0);
  const [size, setSize] = useState(product.sizes[product.sizes.length > 1 ? 1 : 0]);
  const [color, setColor] = useState(product.colors[0].name);
  const [qty, setQty] = useState(1);
  const [toast, setToast] = useState<string | null>(null);
  const [expanded, setExpanded] = useState({ details: true, ship: false, returns: false });

  const price = product.salePrice ?? product.price;
  const onSale = !!product.salePrice;

  const handleAddToCart = () => {
    addItem(product.id, { size, color, qty });
    setToast(`Added ${qty} × ${product.name} (${size}) to cart`);
  };

  const handleBuyNow = () => {
    addItem(product.id, { size, color, qty });
    router.push("/checkout");
  };

  const related = PRODUCTS
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);
  if (related.length < 4) {
    const padding = PRODUCTS.filter((p) => p.id !== product.id && !related.includes(p)).slice(0, 4 - related.length);
    related.push(...padding);
  }

  return (
    <div>
      <Header />

      <main className="rut-container" style={{ padding: "40px 32px 0" }}>
        {/* Breadcrumb */}
        <nav style={{ fontSize: 13, color: "var(--rut-fg-500)", marginBottom: 24, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }} aria-label="Breadcrumb">
          <Link href="/" style={{ color: "var(--rut-fg-500)" }}>Shop</Link>
          <span>›</span>
          <Link href={`/?cat=${product.category}`} style={{ color: "var(--rut-fg-500)", textTransform: "capitalize" }}>{product.category}</Link>
          <span>›</span>
          <span style={{ color: "var(--rut-fg-900)", fontWeight: 500 }}>{product.name}</span>
        </nav>

        {/* Product layout */}
        <div className="product-page-grid">
          {/* Gallery */}
          <div className="product-gallery">
            <div className="gallery-thumbs">
              {product.images.map((src, i) => (
                <button key={i} onClick={() => setActiveImg(i)} style={{
                  width: 84, height: 100, padding: 0, borderRadius: 10, overflow: "hidden",
                  border: i === activeImg ? "2px solid var(--rut-purple)" : "1px solid var(--rut-border)",
                  cursor: "pointer", background: "var(--rut-surface-soft)", transition: "border-color .15s",
                  position: "relative",
                }} aria-label={`View image ${i + 1}`}>
                  <Image src={src} alt="" fill sizes="84px" style={{ objectFit: "cover" }} />
                </button>
              ))}
            </div>
            <div style={{ position: "relative", aspectRatio: "4/5", background: "var(--rut-surface-soft)", borderRadius: 20, overflow: "hidden", border: "1px solid var(--rut-border)", flex: 1 }}>
              {product.badge && <span className={`badge ${product.badge}`}>{product.badge === "new" ? "New" : product.badge === "sale" ? "Sale" : product.badge === "limited" ? "Limited Drop" : ""}</span>}
              <Image src={product.images[activeImg]} alt={product.name} fill sizes="(max-width: 900px) 100vw, 50vw" style={{ objectFit: "cover" }} priority />
            </div>
          </div>

          {/* Info column */}
          <div className="product-info">
            <p className="eyebrow purple">{product.categoryLabel}</p>
            <h1 className="h-display" style={{ fontSize: 44, marginTop: 12, fontWeight: 900 }}>{product.name}</h1>

            <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 14, flexWrap: "wrap" }}>
              <StarRating rating={product.rating} count={product.reviewCount} />
              <span style={{ width: 1, height: 16, background: "var(--rut-border-strong)" }} />
              <span style={{ fontSize: 13, color: "var(--rut-fg-600)" }}>Printed in Nyack, NY</span>
            </div>

            <div style={{ marginTop: 20, display: "flex", alignItems: "baseline", gap: 10 }}>
              <span style={{ fontSize: 36, fontWeight: 800, color: onSale ? "var(--rut-coral)" : "var(--rut-fg-900)" }}>${price}</span>
              {onSale && <span style={{ fontSize: 18, color: "var(--rut-fg-400)", textDecoration: "line-through" }}>${product.price}</span>}
              {onSale && <span style={{ fontSize: 12, fontWeight: 800, color: "var(--rut-coral)", letterSpacing: ".08em", textTransform: "uppercase", marginLeft: 4 }}>
                Save ${(product.price - (product.salePrice ?? 0)).toFixed(0)}
              </span>}
            </div>

            <p style={{ fontSize: 16, color: "var(--rut-fg-600)", lineHeight: 1.7, marginTop: 20 }}>{product.long}</p>

            {/* Color */}
            {product.colors.length > 1 && (
              <div style={{ marginTop: 28 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--rut-fg-700)", letterSpacing: ".06em", textTransform: "uppercase" }}>Color</span>
                  <span style={{ fontSize: 13, color: "var(--rut-fg-500)" }}>{color}</span>
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {product.colors.map((c) => (
                    <button key={c.name} onClick={() => setColor(c.name)} aria-label={c.name} style={{
                      width: 42, height: 42, borderRadius: 999, padding: 3,
                      border: color === c.name ? "2px solid var(--rut-purple)" : "1.5px solid var(--rut-border-strong)",
                      background: "transparent", cursor: "pointer",
                    }}>
                      <span style={{ display: "block", width: "100%", height: "100%", borderRadius: 999, background: c.hex, border: "1px solid rgba(0,0,0,.08)" }} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size */}
            <div style={{ marginTop: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--rut-fg-700)", letterSpacing: ".06em", textTransform: "uppercase" }}>Size</span>
                <button className="btn-link" style={{ fontSize: 13 }}>Size guide</button>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {product.sizes.map((s) => (
                  <button key={s} onClick={() => setSize(s)} style={{
                    minWidth: 60, height: 46, padding: "0 16px",
                    border: size === s ? "2px solid var(--rut-purple)" : "1.5px solid var(--rut-border-strong)",
                    borderRadius: 10,
                    background: size === s ? "rgba(178,33,246,.05)" : "#fff",
                    color: size === s ? "var(--rut-purple)" : "var(--rut-fg-900)",
                    fontWeight: 700, fontSize: 14, cursor: "pointer", transition: "all .15s",
                  }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Qty + Add to cart */}
            <div style={{ display: "flex", gap: 12, marginTop: 28, alignItems: "stretch" }}>
              <div style={{ display: "inline-flex", alignItems: "center", border: "1.5px solid var(--rut-border-strong)", borderRadius: 12, overflow: "hidden" }}>
                <button onClick={() => setQty(Math.max(1, qty - 1))} style={{ width: 50, height: 56, background: "transparent", border: 0, cursor: "pointer", color: "var(--rut-fg-700)", display: "flex", alignItems: "center", justifyContent: "center" }} aria-label="Decrease">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><line x1="5" y1="12" x2="19" y2="12" /></svg>
                </button>
                <span style={{ minWidth: 40, textAlign: "center", fontWeight: 800, fontSize: 16 }}>{qty}</span>
                <button onClick={() => setQty(qty + 1)} style={{ width: 50, height: 56, background: "transparent", border: 0, cursor: "pointer", color: "var(--rut-fg-700)", display: "flex", alignItems: "center", justifyContent: "center" }} aria-label="Increase">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                </button>
              </div>
              <button onClick={handleAddToCart} className="btn-primary lg" style={{ flex: 1 }}>
                Add to Cart · ${(price * qty).toFixed(2)}
              </button>
            </div>

            <button onClick={handleBuyNow} className="btn-ghost" style={{ width: "100%", marginTop: 10, padding: "16px 0" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
              Buy It Now
            </button>

            {/* Trust strip */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginTop: 32, padding: "20px 0", borderTop: "1px solid var(--rut-border)", borderBottom: "1px solid var(--rut-border)" }}>
              <TrustCell icon="truck" label="Ships in 3–5 days" sub="From Nyack, NY" />
              <TrustCell icon="refresh" label="30-day returns" sub="On unworn items" />
              <TrustCell icon="shield" label="Real human support" sub="Talk to Rob direct" />
            </div>

            {/* Accordions */}
            <div style={{ marginTop: 8 }}>
              <Accordion title="Product details" open={expanded.details} onToggle={() => setExpanded((e) => ({ ...e, details: !e.details }))}>
                <ul style={{ margin: 0, padding: "0 0 0 18px", color: "var(--rut-fg-600)", fontSize: 14, lineHeight: 1.8 }}>
                  {product.details.map((d) => <li key={d}>{d}</li>)}
                </ul>
              </Accordion>
              <Accordion title="Shipping & turnaround" open={expanded.ship} onToggle={() => setExpanded((e) => ({ ...e, ship: !e.ship }))}>
                <p style={{ margin: 0, color: "var(--rut-fg-600)", fontSize: 14, lineHeight: 1.7 }}>
                  Orders ship from our Nyack print shop within 3–5 business days. Free shipping on orders over $75 in the lower 48 states. Local pickup available — just leave a note at checkout.
                </p>
              </Accordion>
              <Accordion title="Returns & exchanges" open={expanded.returns} onToggle={() => setExpanded((e) => ({ ...e, returns: !e.returns }))}>
                <p style={{ margin: 0, color: "var(--rut-fg-600)", fontSize: 14, lineHeight: 1.7 }}>
                  Unworn, unwashed items can be returned within 30 days. We&apos;ll cover return shipping for size exchanges. Custom or personalized orders are final sale.
                </p>
              </Accordion>
            </div>
          </div>
        </div>

        {/* Related products */}
        <section style={{ marginTop: 96 }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 24 }}>
            <h2 className="h-display" style={{ fontSize: 32 }}>
              You Might Also <span className="gradient-text">Like</span>
            </h2>
            <Link href="/" className="btn-link">Shop all merch →</Link>
          </div>
          <div className="related-grid">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      </main>

      <Footer />
      <Toast message={toast} onDone={() => setToast(null)} />

      <style>{`
        .product-page-grid {
          display: grid;
          grid-template-columns: 1.15fr 1fr;
          gap: 56px;
          align-items: start;
        }
        .product-gallery {
          display: grid;
          grid-template-columns: 84px 1fr;
          gap: 16px;
        }
        .gallery-thumbs {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .product-info {
          position: sticky;
          top: 96px;
        }
        .related-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 80px;
        }
        @media (max-width: 1024px) {
          .product-page-grid { gap: 36px; }
          .related-grid { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 860px) {
          .product-page-grid { grid-template-columns: 1fr; }
          .product-info { position: static; }
          .related-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 600px) {
          .product-gallery { grid-template-columns: 1fr; }
          .gallery-thumbs { flex-direction: row; }
          .gallery-thumbs button { width: 64px !important; height: 80px !important; }
          .related-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
          main[style*="padding"] { padding: 24px 16px 0 !important; }
        }
      `}</style>
    </div>
  );
}

function TrustCell({ icon, label, sub }: { icon: "truck" | "refresh" | "shield"; label: string; sub: string }) {
  const icons = {
    truck: <><rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></>,
    refresh: <><polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" /></>,
    shield: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></>,
  };
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
      <span style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: "var(--rut-gradient-tint)", border: "1px solid var(--rut-lavender-border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--rut-purple)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{icons[icon]}</svg>
      </span>
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--rut-fg-900)", lineHeight: 1.3 }}>{label}</div>
        <div style={{ fontSize: 12, color: "var(--rut-fg-500)", marginTop: 2 }}>{sub}</div>
      </div>
    </div>
  );
}

function Accordion({ title, open, onToggle, children }: { title: string; open: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <div style={{ borderBottom: "1px solid var(--rut-border)" }}>
      <button onClick={onToggle} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 0", background: "transparent", border: 0, cursor: "pointer", fontFamily: "inherit" }}>
        <span style={{ fontWeight: 700, fontSize: 15, color: "var(--rut-fg-900)" }}>{title}</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--rut-fg-500)" strokeWidth="2.2" style={{ transform: open ? "rotate(180deg)" : "rotate(0)", transition: "transform .2s", flexShrink: 0 }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && <div style={{ paddingBottom: 22, paddingRight: 24 }}>{children}</div>}
    </div>
  );
}
