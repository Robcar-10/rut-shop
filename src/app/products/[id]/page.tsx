import { notFound } from "next/navigation";
import { getProducts } from "@/lib/products";
import ProductPageClient from "@/components/store/ProductPageClient";

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const allProducts = await getProducts();
  const product = allProducts.find((p) => p.id === id);

  if (!product) notFound();

  return <ProductPageClient product={product} allProducts={allProducts} />;
}

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ id: p.id }));
}
