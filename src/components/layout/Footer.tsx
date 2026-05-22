import Link from "next/link";
import Image from "next/image";
import { Phone, Mail, MapPin } from "lucide-react";

const FOOTER_COLS = [
  {
    title: "Shop",
    links: [
      { label: "Shop All", href: "/" },
      { label: "New Arrivals", href: "/?cat=all" },
      { label: "Limited Drops", href: "/?cat=tees" },
      { label: "Sale", href: "/?cat=all" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "Shipping & Returns", href: "#" },
      { label: "Size Guide", href: "#" },
      { label: "Order Status", href: "#" },
      { label: "FAQ", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
  {
    title: "Pro Services",
    links: [
      { label: "Custom Screen Printing", href: "https://rolleduptees.com", external: true },
      { label: "Embroidery", href: "https://rolleduptees.com", external: true },
      { label: "Merch Stores", href: "https://rolleduptees.com", external: true },
      { label: "Bulk Orders", href: "https://rolleduptees.com", external: true },
      { label: "Get a Quote →", href: "https://rolleduptees.com", external: true },
    ],
  },
];

export default function Footer() {
  return (
    <footer style={{
      background: "var(--rut-gradient-night-header)",
      borderTop: "1px solid rgba(255,255,255,.1)",
      padding: "56px 32px 28px",
      marginTop: 80,
    }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        {/* Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 40 }}
          className="footer-grid">
          {/* Brand col */}
          <div>
            <Image src="/rut-long-logo.svg" alt="Rolled Up Tees" width={120} height={32} style={{ height: 32, width: "auto", marginBottom: 16 }} />
            <p style={{ color: "rgba(255,255,255,.55)", fontSize: 13, lineHeight: 1.65, margin: "0 0 16px", maxWidth: 320 }}>
              Custom apparel and ready-made merch from the Rolled Up Tees print shop in Nyack, NY. Everything in this store is printed by us, in-house, by hand.
            </p>
            <div style={{ color: "rgba(255,255,255,.7)", fontSize: 13, display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Phone size={14} strokeWidth={2} />
                (845) 358-2037
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Mail size={14} strokeWidth={2} />
                shop@rolleduptees.com
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <MapPin size={14} strokeWidth={2} />
                Nyack, NY · Rockland County
              </div>
            </div>
          </div>

          {/* Link cols */}
          {FOOTER_COLS.map((col) => (
            <div key={col.title}>
              <h4 style={{
                fontSize: 12, fontWeight: 700, textTransform: "uppercase",
                letterSpacing: ".12em", color: "rgba(255,255,255,.4)", margin: "0 0 16px",
              }}>{col.title}</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {col.links.map((l) => (
                  <Link
                    key={l.label}
                    href={l.href}
                    target={"external" in l && l.external ? "_blank" : undefined}
                    rel={"external" in l && l.external ? "noopener noreferrer" : undefined}
                    style={{ color: "rgba(255,255,255,.65)", fontSize: 13 }}
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div style={{
          marginTop: 40, paddingTop: 22,
          borderTop: "1px solid rgba(255,255,255,.1)",
          display: "flex", justifyContent: "space-between",
          color: "rgba(255,255,255,.4)", fontSize: 12,
          flexWrap: "wrap", gap: 12,
        }}>
          <div>© 2026 Rolled Up Tees. Printed by Rob in Nyack.</div>
          <div style={{ display: "flex", gap: 24 }}>
            <span>Privacy</span>
            <span>Terms</span>
            <span>Refund Policy</span>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .footer-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 560px) {
          .footer-grid { grid-template-columns: 1fr !important; }
          footer { padding: 40px 20px 24px !important; }
        }
      `}</style>
    </footer>
  );
}
