import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import CartDrawer from "@/components/cart/CartDrawer";

export const metadata: Metadata = {
  title: "RUT Shop — Custom Merch from Nyack, NY",
  description: "Ready-made merch from the Rolled Up Tees print shop. Screen printed in-house in Nyack, NY. Ships in 3–5 days.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://shop.rolleduptees.com"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          {children}
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
