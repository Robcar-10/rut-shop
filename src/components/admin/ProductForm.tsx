"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import type { Product, ProductColor } from "@/lib/products";

const ALL_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "One Size", "3in", "1.25in"];
const CATEGORIES = [
  { id: "tees", label: "Tees" },
  { id: "hoodies", label: "Hoodies" },
  { id: "headwear", label: "Headwear" },
  { id: "stickers", label: "Stickers & Pins" },
  { id: "accessories", label: "Accessories" },
];
const BADGE_OPTS = [
  { value: "", label: "None" },
  { value: "new", label: "New" },
  { value: "sale", label: "Sale" },
  { value: "limited", label: "Limited" },
  { value: "featured", label: "Featured" },
];

interface Props {
  initial?: Product;
  mode: "new" | "edit";
}

type FormState = Omit<Product, "id" | "rating" | "reviewCount"> & { id: string };

function blank(): FormState {
  return {
    id: "",
    name: "",
    category: "tees",
    categoryLabel: "Tee",
    price: 0,
    salePrice: undefined,
    badge: null,
    featured: false,
    colors: [{ name: "Black", hex: "#0B1220" }],
    images: [""],
    sizes: ["M", "L", "XL"],
    short: "",
    long: "",
    details: [""],
  };
}

export default function ProductForm({ initial, mode }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initial ? { ...initial } : blank());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);
  const fileRefs = useRef<(HTMLInputElement | null)[]>([]);

  const set = <K extends keyof FormState>(key: K, val: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: val }));

  // ── Images ──────────────────────────────────────────────────────────────
  const setImage = (idx: number, val: string) => {
    const next = [...form.images];
    next[idx] = val;
    set("images", next);
  };
  const addImage = () => set("images", [...form.images, ""]);
  const removeImage = (idx: number) => set("images", form.images.filter((_, i) => i !== idx));

  const uploadImage = async (idx: number, file: File) => {
    setUploadingIdx(idx);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    if (res.ok) {
      const { url } = await res.json();
      setImage(idx, url);
    } else {
      setError("Image upload failed. Max 5 MB.");
    }
    setUploadingIdx(null);
  };

  // ── Colors ──────────────────────────────────────────────────────────────
  const setColor = (idx: number, patch: Partial<ProductColor>) => {
    const next = form.colors.map((c, i) => (i === idx ? { ...c, ...patch } : c));
    set("colors", next);
  };
  const addColor = () => set("colors", [...form.colors, { name: "", hex: "#888888" }]);
  const removeColor = (idx: number) => set("colors", form.colors.filter((_, i) => i !== idx));

  // ── Details ─────────────────────────────────────────────────────────────
  const setDetail = (idx: number, val: string) => {
    const next = [...form.details];
    next[idx] = val;
    set("details", next);
  };
  const addDetail = () => set("details", [...form.details, ""]);
  const removeDetail = (idx: number) => set("details", form.details.filter((_, i) => i !== idx));

  // ── Sizes ────────────────────────────────────────────────────────────────
  const toggleSize = (s: string) => {
    const next = form.sizes.includes(s)
      ? form.sizes.filter((x) => x !== s)
      : [...form.sizes, s];
    set("sizes", next);
  };

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.name.trim()) return setError("Name is required.");
    if (!form.id.trim()) return setError("Product ID is required.");
    if (form.price <= 0) return setError("Price must be greater than 0.");
    if (form.sizes.length === 0) return setError("Select at least one size.");
    if (form.colors.length === 0) return setError("Add at least one color.");

    const payload: Omit<Product, "rating" | "reviewCount"> = {
      ...form,
      id: form.id.trim().toLowerCase().replace(/\s+/g, "-"),
      images: form.images.filter(Boolean),
      details: form.details.filter(Boolean),
      salePrice: form.salePrice || undefined,
      badge: (form.badge as Product["badge"]) || null,
    };

    setSaving(true);
    const url = mode === "new" ? "/api/admin/products" : `/api/admin/products/${initial!.id}`;
    const method = mode === "new" ? "POST" : "PUT";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Save failed. Try again.");
      setSaving(false);
    }
  };

  const inputStyle = { width: "100%", padding: "10px 14px", border: "1.5px solid var(--rut-border-strong)", borderRadius: 10, fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box" as const, background: "#fff" };
  const labelStyle = { fontSize: 12, fontWeight: 700, color: "var(--rut-fg-600)", letterSpacing: ".06em", textTransform: "uppercase" as const, display: "block", marginBottom: 6 };
  const sectionStyle = { background: "#fff", borderRadius: 16, border: "1px solid var(--rut-border)", padding: 24, display: "flex", flexDirection: "column" as const, gap: 16 };

  return (
    <div style={{ minHeight: "100vh", background: "var(--rut-surface-soft)" }}>
      {/* Top bar */}
      <div style={{ background: "#fff", borderBottom: "1px solid var(--rut-border)", padding: "0 32px", display: "flex", alignItems: "center", gap: 16, height: 64 }}>
        <button onClick={() => router.push("/admin")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--rut-fg-500)", display: "flex", alignItems: "center", gap: 6, fontSize: 14 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><polyline points="15 18 9 12 15 6" /></svg>
          Back
        </button>
        <span style={{ color: "var(--rut-border-strong)" }}>|</span>
        <h1 style={{ fontFamily: "var(--rut-font-display)", fontSize: 20, fontWeight: 900, margin: 0 }}>
          {mode === "new" ? "Add Product" : "Edit Product"}
        </h1>
      </div>

      <form onSubmit={handleSubmit} style={{ maxWidth: 800, margin: "0 auto", padding: "32px 32px 80px", display: "flex", flexDirection: "column", gap: 20 }}>
        {error && (
          <div style={{ padding: "12px 16px", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 12, color: "var(--rut-destructive)", fontSize: 14, fontWeight: 600 }}>
            {error}
          </div>
        )}

        {/* ── Identity ── */}
        <div style={sectionStyle}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800 }}>Identity</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label style={labelStyle}>Product Name *</label>
              <input style={inputStyle} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="RUT Classic Logo Tee" required />
            </div>
            <div>
              <label style={labelStyle}>Product ID *</label>
              <input
                style={inputStyle}
                value={form.id}
                onChange={(e) => set("id", e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                placeholder="rut-classic-tee"
                disabled={mode === "edit"}
                required
              />
              {mode === "edit" && <div style={{ fontSize: 11, color: "var(--rut-fg-400)", marginTop: 4 }}>ID cannot be changed after creation.</div>}
            </div>
            <div>
              <label style={labelStyle}>Category *</label>
              <select
                style={{ ...inputStyle, cursor: "pointer" }}
                value={form.category}
                onChange={(e) => {
                  const cat = CATEGORIES.find((c) => c.id === e.target.value);
                  set("category", e.target.value);
                  if (cat) set("categoryLabel", cat.label.replace(/s$/, ""));
                }}
              >
                {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Category Label</label>
              <input style={inputStyle} value={form.categoryLabel} onChange={(e) => set("categoryLabel", e.target.value)} placeholder="Tee" />
            </div>
          </div>
        </div>

        {/* ── Pricing ── */}
        <div style={sectionStyle}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800 }}>Pricing</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
            <div>
              <label style={labelStyle}>Price ($) *</label>
              <input style={inputStyle} type="number" min={0} step={0.01} value={form.price || ""} onChange={(e) => set("price", parseFloat(e.target.value) || 0)} required />
            </div>
            <div>
              <label style={labelStyle}>Sale Price ($)</label>
              <input style={inputStyle} type="number" min={0} step={0.01} value={form.salePrice || ""} onChange={(e) => set("salePrice", parseFloat(e.target.value) || undefined)} placeholder="Leave blank for none" />
            </div>
            <div>
              <label style={labelStyle}>Badge</label>
              <select style={{ ...inputStyle, cursor: "pointer" }} value={form.badge ?? ""} onChange={(e) => set("badge", (e.target.value as Product["badge"]) || null)}>
                {BADGE_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, cursor: "pointer" }}>
            <input type="checkbox" checked={!!form.featured} onChange={(e) => set("featured", e.target.checked)} style={{ width: 16, height: 16, accentColor: "var(--rut-purple)" }} />
            <span style={{ fontWeight: 600 }}>Featured product</span>
            <span style={{ color: "var(--rut-fg-400)", fontSize: 12 }}>(shown as hero on homepage)</span>
          </label>
        </div>

        {/* ── Images ── */}
        <div style={sectionStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800 }}>Images</h3>
            <button type="button" onClick={addImage} className="btn-ghost" style={{ fontSize: 12, padding: "6px 12px" }}>+ Add image</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {form.images.map((img, idx) => (
              <div key={idx} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <div style={{ position: "relative", width: 48, height: 48, borderRadius: 8, overflow: "hidden", background: "var(--rut-surface-soft)", flexShrink: 0, border: "1px solid var(--rut-border)" }}>
                  {img && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  )}
                </div>
                <input
                  style={{ ...inputStyle, flex: 1 }}
                  value={img}
                  onChange={(e) => setImage(idx, e.target.value)}
                  placeholder="https://... or /images/photo.png"
                />
                <input
                  ref={(el) => { fileRefs.current[idx] = el; }}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadImage(idx, file);
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileRefs.current[idx]?.click()}
                  disabled={uploadingIdx === idx}
                  className="btn-ghost"
                  style={{ fontSize: 12, padding: "8px 12px", flexShrink: 0 }}
                >
                  {uploadingIdx === idx ? "Uploading…" : "Upload"}
                </button>
                {form.images.length > 1 && (
                  <button type="button" onClick={() => removeImage(idx)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--rut-fg-400)", padding: 4, flexShrink: 0 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                  </button>
                )}
              </div>
            ))}
          </div>
          <div style={{ fontSize: 12, color: "var(--rut-fg-400)" }}>First image is the primary. Max 5 MB per upload.</div>
        </div>

        {/* ── Sizes ── */}
        <div style={sectionStyle}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800 }}>Sizes *</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {ALL_SIZES.map((s) => {
              const active = form.sizes.includes(s);
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSize(s)}
                  style={{
                    padding: "7px 14px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all .12s",
                    border: active ? "2px solid var(--rut-purple)" : "1.5px solid var(--rut-border-strong)",
                    background: active ? "rgba(178,33,246,.08)" : "#fff",
                    color: active ? "var(--rut-purple)" : "var(--rut-fg-700)",
                  }}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Colors ── */}
        <div style={sectionStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800 }}>Colors *</h3>
            <button type="button" onClick={addColor} className="btn-ghost" style={{ fontSize: 12, padding: "6px 12px" }}>+ Add color</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {form.colors.map((c, idx) => (
              <div key={idx} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <input
                  type="color"
                  value={c.hex}
                  onChange={(e) => setColor(idx, { hex: e.target.value })}
                  style={{ width: 40, height: 36, borderRadius: 8, border: "1.5px solid var(--rut-border-strong)", cursor: "pointer", padding: 2 }}
                />
                <input
                  style={{ ...inputStyle, flex: 1 }}
                  value={c.name}
                  onChange={(e) => setColor(idx, { name: e.target.value })}
                  placeholder="Color name (e.g. Black)"
                />
                <input
                  style={{ ...inputStyle, width: 100, fontFamily: "monospace" }}
                  value={c.hex}
                  onChange={(e) => setColor(idx, { hex: e.target.value })}
                  placeholder="#000000"
                />
                {form.colors.length > 1 && (
                  <button type="button" onClick={() => removeColor(idx)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--rut-fg-400)", padding: 4 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Descriptions ── */}
        <div style={sectionStyle}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800 }}>Descriptions</h3>
          <div>
            <label style={labelStyle}>Short description</label>
            <input style={inputStyle} value={form.short} onChange={(e) => set("short", e.target.value)} placeholder="One-line summary shown on product card" />
          </div>
          <div>
            <label style={labelStyle}>Full description</label>
            <textarea
              style={{ ...inputStyle, minHeight: 100, resize: "vertical" }}
              value={form.long}
              onChange={(e) => set("long", e.target.value)}
              placeholder="Full product story shown on product page"
            />
          </div>
        </div>

        {/* ── Details ── */}
        <div style={sectionStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800 }}>Details / Specs</h3>
            <button type="button" onClick={addDetail} className="btn-ghost" style={{ fontSize: 12, padding: "6px 12px" }}>+ Add line</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {form.details.map((d, idx) => (
              <div key={idx} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  style={{ ...inputStyle, flex: 1 }}
                  value={d}
                  onChange={(e) => setDetail(idx, e.target.value)}
                  placeholder="e.g. 6.0oz / 100% ringspun cotton"
                />
                {form.details.length > 1 && (
                  <button type="button" onClick={() => removeDetail(idx)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--rut-fg-400)", padding: 4 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Actions ── */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
          <button type="button" onClick={() => router.push("/admin")} className="btn-ghost">Cancel</button>
          <button type="submit" className="btn-primary lg" disabled={saving} style={{ minWidth: 160 }}>
            {saving ? "Saving…" : mode === "new" ? "Create Product" : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
