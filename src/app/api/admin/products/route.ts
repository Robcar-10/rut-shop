import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getProducts, saveProducts, PRODUCTS } from "@/lib/products";
import type { Product } from "@/lib/products";

export async function GET() {
  const products = await getProducts();
  return NextResponse.json(products);
}

export async function POST(req: Request) {
  const body = await req.json() as Product;

  if (!body.id || !body.name || !body.price) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const products = await getProducts();

  if (products.find((p) => p.id === body.id)) {
    return NextResponse.json({ error: "Product ID already exists" }, { status: 409 });
  }

  const newProduct: Product = {
    ...body,
    rating: body.rating ?? 5.0,
    reviewCount: body.reviewCount ?? 0,
  };

  await saveProducts([...products, newProduct]);
  revalidateTag("products", "max");

  return NextResponse.json(newProduct, { status: 201 });
}

// Seed blob from static PRODUCTS (first-time setup)
export async function PUT() {
  await saveProducts(PRODUCTS);
  revalidateTag("products", "max");
  return NextResponse.json({ ok: true, seeded: PRODUCTS.length });
}
