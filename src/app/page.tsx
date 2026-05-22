"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { ProductCard, ProductCardLarge, ProductCardWide } from "@/components/store/ProductCard";
import Toast from "@/components/ui/Toast";
import { PRODUCTS, CATEGORIES, type Product } from "@/lib/products";

type SortKey = "featured" | "price-asc" | "price-desc" | "name";

export default function ShopPage() {
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState<SortKey>("featured");
  const [toast, setToast] = useState<string | null>(null);

  const featured = PRODUCTS.find((p) => p.featured);

  const allFiltered = PRODUCTS.filter((p) => {
    if (p.featured) return false;
    if (category === "all") return true;
    return p.category === category;
  });

  const sorted = [...allFiltered].sort((a, b) => {
    if (sortBy === "price-asc") return (a.salePrice ?? a.price) - (b.salePrice ?? b.price);
    if (sortBy === "price-desc") return (b.salePrice ?? b.price) - (a.salePrice ?? a.price);
    if (sortBy === "name") return a.name.localeCompare(b.name);
    return 0;
  });

  const counts = PRODUCTS.reduce<Record<string, number>>((acc, p) => {
    acc.all = (acc.all || 0) + 1;
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {});

  const heroes = sorted.slice(0, 3);
  const rest = sorted.slice(3);

  return (
    <div>
      <Header activePath="shop" />
      <ShopHero />

      {/* Sticky filter bar */}
      <div style={{ position: "sticky", top: 70, zIndex: 30, background: "#fff", borderBottom: "1px solid var(--rut-border)" }}>
        <div className="rut-container" style={{ padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div className="filter-pills">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                onClick={() => setCategory(c.id)}
                className={`filter-pill ${category === c.id ? "active" : ""}`}
              >
                {c.label}<span className="count">({counts[c.id] || 0})</span>
              </button>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            <span style={{ fontSize: 13, color: "var(--rut-fg-500)", fontWeight: 500 }}>Sort</span>
            <select
              className="form-select"
              style={{ width: "auto", padding: "8px 30px 8px 12px", fontSize: 13, borderColor: "var(--rut-border-strong)" }}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortKey)}
            >
              <option value="featured">Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name">Name (A–Z)</option>
            </select>
          </div>
        </div>
      </div>

      <main className="rut-container" style={{ padding: "40px 32px 0" }}>
        {/* Featured full-width spotlight */}
        {category === "all" && featured && (
          <FeaturedHero product={featured} />
        )}

        {/* Grid heading */}
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 20 }}>
          <h2 className="h-display" style={{ fontSize: 28 }}>
            {category === "all" ? "Shop All Merch" : CATEGORIES.find((c) => c.id === category)?.label}
            <span style={{ color: "var(--rut-fg-400)", fontWeight: 500, fontSize: 18, marginLeft: 10 }}>
              {sorted.length} item{sorted.length === 1 ? "" : "s"}
            </span>
          </h2>
        </div>

        {/* Asymmetric grid: first row 1 large + 2 wide stacked, rest 3-up */}
        {sorted.length > 0 ? (
          <>
            <div className="product-grid-hero">
              {heroes[0] && (
                <div className="animate-fade-up" style={{ animationDelay: "0ms" }}>
                  <ProductCardLarge product={heroes[0]} />
                </div>
              )}
              <div style={{ display: "grid", gap: 20 }}>
                {heroes.slice(1, 3).map((p, i) => (
                  <div key={p.id} className="animate-fade-up" style={{ animationDelay: `${(i + 1) * 60}ms` }}>
                    <ProductCardWide product={p} />
                  </div>
                ))}
              </div>
            </div>
            <div className="product-grid-rest">
              {rest.map((p, i) => (
                <div key={p.id} className="animate-fade-up" style={{ animationDelay: `${(i + 3) * 50}ms` }}>
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "60px 0", color: "var(--rut-fg-500)" }}>
            No items in this category.
          </div>
        )}

        <ProcessStrip />
      </main>

      <Footer />
      <Toast message={toast} onDone={() => setToast(null)} />

      <style>{`
        .product-grid-hero {
          display: grid;
          grid-template-columns: 1.4fr 1fr;
          gap: 20px;
          margin-bottom: 24px;
        }
        .product-grid-rest {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-bottom: 80px;
        }
        @media (max-width: 900px) {
          .product-grid-hero { grid-template-columns: 1fr 1fr; }
          .product-grid-rest { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 600px) {
          .product-grid-hero { grid-template-columns: 1fr; }
          .product-grid-rest { grid-template-columns: repeat(2, 1fr); gap: 12px; }
          .filter-pills { gap: 6px; }
          .filter-pill { padding: 7px 12px; font-size: 12px; }
        }
        @media (max-width: 400px) {
          .product-grid-rest { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}

function ShopHero() {
  return (
    <section style={{ position: "relative", overflow: "hidden", background: "var(--rut-gradient-night-hero)" }}>
      {/* Glows */}
      <div style={{ pointerEvents: "none", position: "absolute", top: -120, right: -100, height: 460, width: 460, borderRadius: 999, background: "radial-gradient(circle, rgba(178,33,246,.35) 0%, transparent 70%)" }} />
      <div style={{ pointerEvents: "none", position: "absolute", bottom: -80, left: "18%", height: 320, width: 320, borderRadius: 999, background: "radial-gradient(circle, rgba(255,100,82,.22) 0%, transparent 70%)" }} />

      <div className="rut-container shop-hero-inner">
        <div className="shop-hero-text">
          <p className="eyebrow" style={{ color: "#FF6452", margin: 0 }}>The RUT Shop · Drop 03</p>
          <h1 className="h-display shop-hero-h1" style={{ color: "#fff", fontWeight: 900, marginTop: 18, lineHeight: .98 }}>
            We Print It.<br />
            <span style={{ backgroundImage: "linear-gradient(90deg,#d88eff,#ff9a8e)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
              You Wear It.
            </span>
          </h1>
          <p style={{ color: "rgba(255,255,255,.7)", fontSize: 18, lineHeight: 1.6, marginTop: 22, maxWidth: 520 }}>
            Ready-made merch from our Nyack print shop. Every item is printed by us, in-house, by hand — same shop, same Rob, same equipment as our custom orders.{" "}
            <span style={{ color: "#fff", fontWeight: 700 }}>Ships in 3–5 days. Free over $75.</span>
          </p>
          <div style={{ display: "flex", gap: 24, marginTop: 28, color: "rgba(255,255,255,.55)", fontSize: 13, fontWeight: 500, flexWrap: "wrap" }}>
            <ShopStat label="Printed in" value="Nyack, NY" />
            <ShopStat label="Ships in" value="3–5 days" />
            <ShopStat label="Free shipping" value="Over $75" />
          </div>
        </div>

        {/* Drop card */}
        <div className="shop-hero-card" style={{ background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.12)", borderRadius: 20, padding: 26, backdropFilter: "blur(4px)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
            <span style={{ display: "inline-flex", width: 8, height: 8, borderRadius: 999, background: "#22C55E", boxShadow: "0 0 0 4px rgba(34,197,94,.2)" }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: "#fff", letterSpacing: "1px", textTransform: "uppercase" }}>Drop 03 — Live Now</span>
          </div>
          <div style={{ fontFamily: "var(--rut-font-display)", color: "#fff", fontSize: 24, fontWeight: 800, lineHeight: 1.2 }}>
            Holiday merch, the<br />Nyack hoodie, &amp;<br />a new trucker.
          </div>
          <hr style={{ border: 0, borderTop: "1px solid rgba(255,255,255,.12)", margin: "20px 0" }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <DropBullet label="12 items" sub="6 new this drop" />
            <DropBullet label="3 limited runs" sub="Numbered, never reprinted" />
            <DropBullet label="Made by hand" sub="By Rob at the Nyack shop" />
          </div>
        </div>
      </div>

      <style>{`
        .shop-hero-inner {
          position: relative;
          padding: 64px 32px 72px;
          display: grid;
          grid-template-columns: 1.4fr .9fr;
          gap: 56px;
          align-items: center;
        }
        .shop-hero-h1 { font-size: 80px; }
        @media (max-width: 900px) {
          .shop-hero-inner { grid-template-columns: 1fr; gap: 32px; padding: 48px 20px 56px; }
          .shop-hero-h1 { font-size: 56px; }
          .shop-hero-card { display: none; }
        }
        @media (max-width: 480px) {
          .shop-hero-inner { padding: 36px 16px 44px; }
          .shop-hero-h1 { font-size: 42px; }
          .shop-hero-text p { font-size: 15px !important; }
        }
      `}</style>
    </section>
  );
}

function ShopStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ color: "rgba(255,255,255,.4)", fontSize: 11, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase" }}>{label}</div>
      <div style={{ color: "#fff", fontSize: 15, fontWeight: 700, marginTop: 2 }}>{value}</div>
    </div>
  );
}

function DropBullet({ label, sub }: { label: string; sub: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <span style={{
        width: 28, height: 28, borderRadius: 8,
        background: "linear-gradient(135deg, rgba(178,33,246,.4), rgba(255,100,82,.4))",
        border: "1px solid rgba(255,255,255,.15)",
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </span>
      <div>
        <div style={{ color: "#fff", fontSize: 14, fontWeight: 700, lineHeight: 1.2 }}>{label}</div>
        <div style={{ color: "rgba(255,255,255,.55)", fontSize: 12 }}>{sub}</div>
      </div>
    </div>
  );
}

function FeaturedHero({ product }: { product: Product }) {
  return (
    <Link href={`/products/${product.id}`} className="featured-hero-card" style={{
      display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 0,
      background: "#fff", border: "1px solid var(--rut-border)", borderRadius: 24,
      overflow: "hidden", marginBottom: 56, textDecoration: "none",
    }}>
      <div style={{ position: "relative", background: "var(--rut-surface-soft)", aspectRatio: "4/3" }}>
        <span className="badge featured">Featured</span>
        <Image src={product.images[0]} alt={product.name} fill style={{ objectFit: "cover" }} sizes="(max-width: 900px) 100vw, 55vw" />
      </div>
      <div style={{ padding: "48px 48px 44px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <p className="eyebrow purple" style={{ margin: 0 }}>Featured · The Original</p>
        <h2 className="h-display" style={{ fontSize: 48, marginTop: 14, fontWeight: 900 }}>{product.name}</h2>
        <p style={{ fontSize: 16, lineHeight: 1.65, color: "var(--rut-fg-600)", margin: "16px 0 24px", maxWidth: 480 }}>{product.long}</p>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span className="btn-primary">
            Shop the Tee
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><polyline points="9 18 15 12 9 6" /></svg>
          </span>
          <span style={{ fontSize: 22, fontWeight: 800, color: "var(--rut-fg-900)" }}>${product.price}</span>
        </div>
      </div>
      <style>{`
        .featured-hero-card:hover { transform: translateY(-3px); box-shadow: var(--rut-shadow-xl); }
        .featured-hero-card { transition: transform .25s, box-shadow .25s; }
        @media (max-width: 800px) {
          .featured-hero-card { grid-template-columns: 1fr !important; }
          .featured-hero-card > div:last-child { padding: 28px 28px 32px !important; }
          .featured-hero-card > div:last-child h2 { font-size: 32px !important; }
        }
        @media (max-width: 480px) {
          .featured-hero-card > div:last-child { padding: 20px 20px 24px !important; }
        }
      `}</style>
    </Link>
  );
}

function ProcessStrip() {
  const steps = [
    { num: "01", title: "Designed in Nyack", desc: "Every graphic is drawn at our shop on Main Street. No clipart, no AI slop." },
    { num: "02", title: "Printed by Hand", desc: "Real screen printing presses, real squeegees, real Rob. Watch us work through the front window." },
    { num: "03", title: "Shipped from Rockland", desc: "Orders go out in 3–5 days. Free shipping on orders over $75 in the lower 48." },
  ];
  return (
    <section style={{ background: "var(--rut-lavender-bg)", borderRadius: 32, padding: "56px 48px", margin: "20px 0 0", border: "1px solid var(--rut-lavender-border)" }}>
      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <p className="eyebrow purple">How This Works</p>
        <h2 className="h-display" style={{ fontSize: 40, marginTop: 10 }}>
          Every Item Printed <span className="gradient-text">By Us</span>
        </h2>
      </div>
      <div className="process-grid">
        {steps.map((s) => (
          <div key={s.num} style={{ background: "#fff", border: "1px solid var(--rut-lavender-border)", borderRadius: 16, padding: "26px 24px", boxShadow: "var(--rut-shadow-sm)" }}>
            <div style={{ fontSize: 11, fontWeight: 900, color: "var(--rut-purple)", letterSpacing: ".15em", marginBottom: 8 }}>STEP {s.num}</div>
            <div style={{ fontFamily: "var(--rut-font-display)", fontSize: 20, fontWeight: 800, color: "var(--rut-fg-900)", marginBottom: 8 }}>{s.title}</div>
            <p style={{ fontSize: 14, color: "var(--rut-fg-600)", lineHeight: 1.6, margin: 0 }}>{s.desc}</p>
          </div>
        ))}
      </div>
      <style>{`
        .process-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        @media (max-width: 760px) { .process-grid { grid-template-columns: 1fr; } }
        @media (max-width: 560px) { section[style*="border-radius: 32px"] { padding: 36px 24px !important; border-radius: 20px !important; } }
      `}</style>
    </section>
  );
}
