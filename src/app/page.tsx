import { getProducts } from "@/lib/products";
import ShopPageClient from "@/components/store/ShopPageClient";

export default async function ShopPage() {
  const products = await getProducts();
  return <ShopPageClient products={products} />;
}
