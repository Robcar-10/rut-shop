"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { PRODUCTS } from "@/lib/products";
import QtyStepper from "./QtyStepper";

export default function CartDrawer() {
  const { items, isOpen, closeCart, updateItem, removeItem, subtotal } = useCart();

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  const FREE_SHIP = 75;
  const remaining = Math.max(0, FREE_SHIP - subtotal);
  const progress = Math.min(100, (subtotal / FREE_SHIP) * 100);
  const totalItems = items.reduce((s, i) => s + i.qty, 0);

  return (
    <>
      <div className="drawer-backdrop" onClick={closeCart} />
      <aside className="drawer" role="dialog" aria-label="Shopping cart" aria-modal="true">
        {/* Header */}
        <div style={{
          padding: "20px 24px", borderBottom: "1px solid var(--rut-border)",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div>
            <div style={{ fontFamily: "var(--rut-font-display)", fontSize: 22, fontWeight: 800 }}>Your Cart</div>
            <div style={{ fontSize: 13, color: "var(--rut-fg-500)", marginTop: 2 }}>
              {items.length === 0 ? "Empty" : `${totalItems} item${totalItems > 1 ? "s" : ""}`}
            </div>
          </div>
          <button onClick={closeCart} aria-label="Close cart" style={{
            background: "transparent", border: 0, width: 36, height: 36,
            borderRadius: 999, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <X size={20} strokeWidth={2.2} />
          </button>
        </div>

        {/* Free shipping bar */}
        {items.length > 0 && (
          <div style={{
            padding: "14px 24px", borderBottom: "1px solid var(--rut-border)",
            background: "var(--rut-lavender-bg)",
          }}>
            <div style={{ fontSize: 12, color: "var(--rut-fg-700)", fontWeight: 600, marginBottom: 8 }}>
              {remaining > 0
                ? <>You&apos;re <span style={{ color: "var(--rut-purple)" }}>${remaining.toFixed(2)}</span> away from free shipping</>
                : <span style={{ color: "var(--rut-purple)" }}>✓ You unlocked free shipping</span>}
            </div>
            <div style={{ height: 6, background: "#fff", borderRadius: 999, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${progress}%`, background: "var(--rut-gradient-cta)", transition: "width .3s" }} />
            </div>
          </div>
        )}

        {/* Items */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {items.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 24px" }}>
              <div style={{
                width: 64, height: 64, borderRadius: 999, background: "var(--rut-lavender-bg)",
                margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <ShoppingBag size={28} color="var(--rut-purple)" strokeWidth={2} />
              </div>
              <div style={{ fontFamily: "var(--rut-font-display)", fontSize: 20, fontWeight: 700 }}>Your cart is empty</div>
              <p style={{ color: "var(--rut-fg-500)", fontSize: 14, margin: "8px 0 22px" }}>Find something to print on yourself.</p>
              <button className="btn-primary" onClick={closeCart}>Shop All Merch</button>
            </div>
          ) : (
            items.map((item, idx) => {
              const p = PRODUCTS.find((p) => p.id === item.productId);
              if (!p) return null;
              const price = p.salePrice ?? p.price;
              return (
                <div key={idx} style={{ padding: "16px 24px", borderBottom: "1px solid var(--rut-border)", display: "flex", gap: 14 }}>
                  <Link href={`/products/${p.id}`} onClick={closeCart} style={{
                    width: 72, height: 90, borderRadius: 10, overflow: "hidden",
                    flexShrink: 0, background: "var(--rut-surface-soft)", display: "block",
                  }}>
                    <Image src={p.images[0]} alt={p.name} width={72} height={90} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </Link>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                      <Link href={`/products/${p.id}`} onClick={closeCart} style={{
                        fontFamily: "var(--rut-font-display)", fontSize: 15, fontWeight: 700,
                        color: "var(--rut-fg-900)", lineHeight: 1.25,
                      }}>{p.name}</Link>
                      <button onClick={() => removeItem(idx)} aria-label="Remove item" style={{
                        background: "transparent", border: 0, cursor: "pointer",
                        color: "var(--rut-fg-400)", padding: 0, flexShrink: 0,
                      }}>
                        <X size={16} strokeWidth={2} />
                      </button>
                    </div>
                    <div style={{ fontSize: 12, color: "var(--rut-fg-500)", marginTop: 4 }}>
                      {item.color && <span>{item.color} · </span>}
                      <span>Size {item.size}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
                      <QtyStepper value={item.qty} onChange={(v) => updateItem(idx, v)} compact />
                      <div style={{ fontWeight: 700, fontSize: 15 }}>${(price * item.qty).toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div style={{ borderTop: "1px solid var(--rut-border)", padding: "18px 24px 22px", background: "#fff" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 14, color: "var(--rut-fg-600)" }}>Subtotal</span>
              <span style={{ fontWeight: 700, fontSize: 16 }}>${subtotal.toFixed(2)}</span>
            </div>
            <div style={{ fontSize: 12, color: "var(--rut-fg-500)", marginBottom: 14 }}>
              Shipping &amp; taxes calculated at checkout.
            </div>
            <Link href="/checkout" className="btn-primary lg full" onClick={closeCart} style={{ display: "flex" }}>
              Checkout
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><polyline points="9 18 15 12 9 6" /></svg>
            </Link>
            <button onClick={closeCart} style={{
              width: "100%", marginTop: 10, padding: 11, background: "transparent",
              border: 0, color: "var(--rut-fg-500)", fontSize: 13, fontWeight: 600, cursor: "pointer",
            }}>
              Continue Shopping
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
