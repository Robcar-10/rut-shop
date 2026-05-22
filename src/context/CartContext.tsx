"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { PRODUCTS } from "@/lib/products";

export interface CartItem {
  productId: string;
  size: string;
  color: string | null;
  qty: number;
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotal: number;
  addItem: (productId: string, opts?: { size?: string; color?: string | null; qty?: number }) => void;
  updateItem: (idx: number, qty: number) => void;
  removeItem: (idx: number) => void;
  clearCart: () => void;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

const CART_KEY = "rut_cart_v1";

function readCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
  } catch {
    return [];
  }
}

function writeCart(items: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent("rut-cart-change", { detail: items }));
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setItems(readCart());
    const onStorage = () => setItems(readCart());
    window.addEventListener("storage", onStorage);
    window.addEventListener("rut-cart-change", onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("rut-cart-change", onStorage);
    };
  }, []);

  const addItem = useCallback((productId: string, opts?: { size?: string; color?: string | null; qty?: number }) => {
    const { size = "One Size", color = null, qty = 1 } = opts ?? {};
    const current = readCart();
    const existing = current.find(
      (i) => i.productId === productId && i.size === size && (i.color || null) === (color || null)
    );
    if (existing) existing.qty += qty;
    else current.push({ productId, size, color: color ?? null, qty });
    writeCart(current);
    setItems([...current]);
  }, []);

  const updateItem = useCallback((idx: number, qty: number) => {
    const current = readCart();
    if (!current[idx]) return;
    if (qty <= 0) current.splice(idx, 1);
    else current[idx].qty = qty;
    writeCart(current);
    setItems([...current]);
  }, []);

  const removeItem = useCallback((idx: number) => {
    const current = readCart();
    current.splice(idx, 1);
    writeCart(current);
    setItems([...current]);
  }, []);

  const clearCart = useCallback(() => {
    writeCart([]);
    setItems([]);
  }, []);

  const count = items.reduce((sum, i) => sum + i.qty, 0);

  const subtotal = items.reduce((sum, i) => {
    const p = PRODUCTS.find((p) => p.id === i.productId);
    if (!p) return sum;
    return sum + (p.salePrice ?? p.price) * i.qty;
  }, 0);

  return (
    <CartContext.Provider value={{
      items, count, subtotal,
      addItem, updateItem, removeItem, clearCart,
      isOpen, openCart: () => setIsOpen(true), closeCart: () => setIsOpen(false),
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
