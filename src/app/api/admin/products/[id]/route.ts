import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getProducts, saveProducts } from "@/lib/products";
import type { Product } from "@/lib/products";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json() as Partial<Product>;

  const products = await getProducts();
  const idx = products.findIndex((p) => p.id === id);

  if (idx === -1) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const updated = { ...products[idx], ...body, id };
  const next = [...products];
  next[idx] = updated;

  await saveProducts(next);
  revalidateTag("products", "max");

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const products = await getProducts();
  const next = products.filter((p) => p.id !== id);

  if (next.length === products.length) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  await saveProducts(next);
  revalidateTag("products", "max");

  return NextResponse.json({ ok: true });
}
