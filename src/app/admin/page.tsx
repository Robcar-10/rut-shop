"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { Product } from "@/lib/products";
import type { StoredOrder } from "@/app/api/admin/orders/route";

type Tab = "products" | "orders";

export default function AdminDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("products");
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<StoredOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    const res = await fetch("/api/admin/products");
    if (res.ok) setProducts(await res.json());
  }, []);

  const loadOrders = useCallback(async () => {
    const res = await fetch("/api/admin/orders");
    if (res.ok) setOrders(await res.json());
  }, []);

  useEffect(() => {
    Promise.all([loadProducts(), loadOrders()]).finally(() => setLoading(false));
  }, [loadProducts, loadOrders]);

  const handleSeed = async () => {
    setSeeding(true);
    await fetch("/api/admin/products", { method: "PUT" });
    await loadProducts();
    setSeeding(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(`Delete "${id}"? This cannot be undone.`)) return;
    setDeletingId(id);
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    await loadProducts();
    setDeletingId(null);
  };

  const handleLogout = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.push("/admin/login");
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--rut-surface-soft)" }}>
      {/* Top bar */}
      <div style={{ background: "#fff", borderBottom: "1px solid var(--rut-border)", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--rut-gradient-cta)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
          </div>
          <div>
            <div style={{ fontFamily: "var(--rut-font-display)", fontWeight: 900, fontSize: 16 }}>RUT Admin</div>
            <div style={{ fontSize: 11, color: "var(--rut-fg-400)", marginTop: -2 }}>shop.rolleduptees.com</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <a href="/" target="_blank" className="btn-ghost" style={{ fontSize: 13, padding: "8px 14px" }}>
            View shop ↗
          </a>
          <button onClick={handleLogout} style={{ fontSize: 13, color: "var(--rut-fg-500)", background: "none", border: "none", cursor: "pointer", padding: "8px 4px" }}>
            Sign out
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 32px 80px" }}>
        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, background: "#fff", border: "1px solid var(--rut-border)", borderRadius: 12, padding: 4, width: "fit-content", marginBottom: 32 }}>
          {(["products", "orders"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: "8px 20px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600, transition: "all .15s",
                background: tab === t ? "var(--rut-gradient-cta)" : "transparent",
                color: tab === t ? "#fff" : "var(--rut-fg-600)",
              }}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
              {t === "orders" && orders.length > 0 && (
                <span style={{ marginLeft: 8, background: "rgba(0,0,0,.15)", borderRadius: 999, padding: "1px 7px", fontSize: 11 }}>{orders.length}</span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 80, color: "var(--rut-fg-400)" }}>Loading…</div>
        ) : tab === "products" ? (
          <ProductsTab
            products={products}
            seeding={seeding}
            deletingId={deletingId}
            onSeed={handleSeed}
            onDelete={handleDelete}
            onEdit={(id) => router.push(`/admin/products/${id}`)}
            onNew={() => router.push("/admin/products/new")}
          />
        ) : (
          <OrdersTab orders={orders} />
        )}
      </div>
    </div>
  );
}

function ProductsTab({
  products, seeding, deletingId, onSeed, onDelete, onEdit, onNew,
}: {
  products: Product[];
  seeding: boolean;
  deletingId: string | null;
  onSeed: () => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onNew: () => void;
}) {
  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ fontFamily: "var(--rut-font-display)", fontSize: 24, fontWeight: 900, margin: 0 }}>Products</h2>
          <p style={{ color: "var(--rut-fg-500)", fontSize: 13, marginTop: 4 }}>{products.length} items in catalog</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {products.length === 0 && (
            <button onClick={onSeed} className="btn-ghost" disabled={seeding} style={{ fontSize: 13 }}>
              {seeding ? "Seeding…" : "Seed from defaults"}
            </button>
          )}
          <button onClick={onNew} className="btn-primary" style={{ fontSize: 14 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            Add Product
          </button>
        </div>
      </div>

      {products.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 32px", background: "#fff", borderRadius: 20, border: "1px solid var(--rut-border)" }}>
          <p style={{ color: "var(--rut-fg-400)", marginBottom: 16 }}>No products yet. Seed from defaults or add your first product.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {products.map((p) => (
            <div key={p.id} style={{ background: "#fff", borderRadius: 16, border: "1px solid var(--rut-border)", padding: "16px 20px", display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ position: "relative", width: 56, height: 56, borderRadius: 10, overflow: "hidden", background: "var(--rut-surface-soft)", flexShrink: 0 }}>
                {p.images[0] && (
                  <Image
                    src={p.images[0]}
                    alt=""
                    fill
                    sizes="56px"
                    style={{ objectFit: "cover" }}
                    unoptimized={p.images[0].startsWith("http")}
                  />
                )}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontWeight: 700, fontSize: 15 }}>{p.name}</span>
                  {p.badge && (
                    <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase", padding: "2px 8px", borderRadius: 999, background: "var(--rut-lavender-100)", color: "var(--rut-purple)" }}>{p.badge}</span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: "var(--rut-fg-400)", marginTop: 2 }}>
                  {p.categoryLabel} · {p.colors.length} color{p.colors.length !== 1 ? "s" : ""} · {p.sizes.join(", ")}
                </div>
              </div>

              <div style={{ fontFamily: "var(--rut-font-display)", fontWeight: 800, fontSize: 16, flexShrink: 0 }}>
                {p.salePrice ? (
                  <><span style={{ textDecoration: "line-through", color: "var(--rut-fg-400)", fontWeight: 500 }}>${p.price}</span> <span style={{ color: "var(--rut-coral)" }}>${p.salePrice}</span></>
                ) : (
                  `$${p.price}`
                )}
              </div>

              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                <button onClick={() => onEdit(p.id)} className="btn-ghost" style={{ fontSize: 13, padding: "7px 14px" }}>Edit</button>
                <button
                  onClick={() => onDelete(p.id)}
                  disabled={deletingId === p.id}
                  style={{ fontSize: 13, padding: "7px 14px", borderRadius: 10, border: "1px solid #FECACA", background: "#FEF2F2", color: "var(--rut-destructive)", cursor: "pointer", fontWeight: 600 }}
                >
                  {deletingId === p.id ? "…" : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function OrdersTab({ orders }: { orders: StoredOrder[] }) {
  if (orders.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "60px 32px", background: "#fff", borderRadius: 20, border: "1px solid var(--rut-border)" }}>
        <p style={{ color: "var(--rut-fg-400)" }}>No orders yet. They&apos;ll appear here after your first sale.</p>
      </div>
    );
  }

  return (
    <>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontFamily: "var(--rut-font-display)", fontSize: 24, fontWeight: 900, margin: 0 }}>Orders</h2>
        <p style={{ color: "var(--rut-fg-500)", fontSize: 13, marginTop: 4 }}>{orders.length} order{orders.length !== 1 ? "s" : ""} total</p>
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        {[...orders].reverse().map((o) => (
          <div key={o.id} style={{ background: "#fff", borderRadius: 16, border: "1px solid var(--rut-border)", padding: "18px 24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{o.customerName}</div>
                <div style={{ fontSize: 12, color: "var(--rut-fg-400)", marginTop: 2 }}>
                  {o.customerEmail} · {new Date(o.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </div>
              </div>
              <div style={{ fontFamily: "var(--rut-font-display)", fontWeight: 900, fontSize: 20 }}>
                ${o.total.toFixed(2)}
              </div>
            </div>

            <div style={{ fontSize: 13, color: "var(--rut-fg-600)", marginBottom: 8 }}>
              {o.items.map((i, idx) => (
                <span key={idx}>
                  {i.qty}× {i.name} ({i.size}/{i.color}){idx < o.items.length - 1 ? ", " : ""}
                </span>
              ))}
            </div>

            <div style={{ display: "flex", gap: 16, fontSize: 12, color: "var(--rut-fg-400)" }}>
              <span>{o.shipMethod}</span>
              <span>·</span>
              <span>{o.address}</span>
              <span>·</span>
              <a
                href={`https://dashboard.stripe.com/payments/${o.stripeId}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--rut-purple)", fontWeight: 600 }}
              >
                Stripe →
              </a>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
