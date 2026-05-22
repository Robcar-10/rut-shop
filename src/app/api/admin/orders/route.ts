import { NextResponse } from "next/server";
import { readJson, ORDERS_PATH } from "@/lib/blob-store";

export interface StoredOrder {
  id: string;
  stripeId: string;
  createdAt: string;
  customerName: string;
  customerEmail: string;
  address: string;
  shipMethod: string;
  items: { name: string; size: string; color: string; qty: number; price: number }[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

export async function GET() {
  const orders = await readJson<StoredOrder[]>(ORDERS_PATH);
  return NextResponse.json(orders ?? []);
}
