import { notFound } from "next/navigation";
import { getProducts } from "@/lib/products";
import ProductForm from "@/components/admin/ProductForm";

export const metadata = { title: "Edit Product — Admin" };

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const products = await getProducts();
  const product = products.find((p) => p.id === id);

  if (!product) notFound();

  return <ProductForm mode="edit" initial={product} />;
}
