import { put, list } from "@vercel/blob";

const PRODUCTS_PATH = "rut-shop/products.json";
const ORDERS_PATH = "rut-shop/orders.json";

async function blobUrl(pathname: string): Promise<string | null> {
  const { blobs } = await list({ prefix: pathname, limit: 10 });
  return blobs.find((b) => b.pathname === pathname)?.url ?? null;
}

async function readJson<T>(pathname: string): Promise<T | null> {
  const url = await blobUrl(pathname);
  if (!url) return null;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json() as Promise<T>;
}

async function writeJson(pathname: string, data: unknown): Promise<void> {
  await put(pathname, JSON.stringify(data, null, 2), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
  });
}

export { blobUrl, readJson, writeJson, PRODUCTS_PATH, ORDERS_PATH };
