"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { ShoppingBag } from "lucide-react";

interface HeaderProps {
  activePath?: "shop" | "checkout";
}

const NAV_LINKS = [
  { label: "Shop All", href: "/" },
  { label: "Tees", href: "/?cat=tees" },
  { label: "Headwear", href: "/?cat=headwear" },
  { label: "Hoodies", href: "/?cat=hoodies" },
  { label: "Stickers", href: "/?cat=stickers" },
  { label: "Main Site ↗", href: "https://rolleduptees.com", external: true },
];

export default function Header({ activePath = "shop" }: HeaderProps) {
  const { count, openCart } = useCart();

  return (
    <header className="shop-header">
      <div className="shop-header-inner">
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Image src="/rut-long-logo.svg" alt="Rolled Up Tees" width={120} height={32} style={{ height: 32, width: "auto" }} />
          <span className="shop-badge" style={{
            fontSize: 11, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase",
            color: "rgba(255,255,255,.55)", borderLeft: "1px solid rgba(255,255,255,.2)",
            paddingLeft: 10, marginLeft: 2,
          }}>Shop</span>
        </Link>

        <nav className="shop-nav" aria-label="Main navigation">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              target={l.external ? "_blank" : undefined}
              rel={l.external ? "noopener noreferrer" : undefined}
              className={activePath === "shop" && l.href === "/" ? "active" : ""}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <button className="cart-button" onClick={openCart} aria-label="Open cart">
          <ShoppingBag size={18} strokeWidth={2.2} />
          Cart
          <span className="cart-count">{count}</span>
        </button>
      </div>
    </header>
  );
}
