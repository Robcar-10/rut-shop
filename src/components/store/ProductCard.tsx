import Link from "next/link";
import Image from "next/image";
import { Product } from "@/lib/products";

function Badge({ kind }: { kind?: string | null }) {
  if (!kind) return null;
  const labels: Record<string, string> = { new: "New", sale: "Sale", limited: "Limited Drop", featured: "Featured" };
  return <span className={`badge ${kind}`}>{labels[kind] ?? kind}</span>;
}

function PriceTag({ product }: { product: Product }) {
  if (product.salePrice) {
    return (
      <div className="product-price">
        <span className="price-sale">${product.salePrice}</span>
        <span className="price-strike">${product.price}</span>
      </div>
    );
  }
  return <div className="product-price">${product.price}</div>;
}

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/products/${product.id}`} className="product-card">
      <div className="product-image-wrap">
        <Badge kind={product.badge} />
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          style={{ objectFit: "cover" }}
        />
      </div>
      <div className="product-card-body">
        <div className="product-cat">{product.categoryLabel}</div>
        <h3 className="product-name">{product.name}</h3>
        <PriceTag product={product} />
        {product.colors.length > 1 && (
          <div className="color-dots" aria-label="Available colors">
            {product.colors.slice(0, 5).map((c) => (
              <span key={c.name} className="color-dot" style={{ background: c.hex }} title={c.name} />
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

export function ProductCardLarge({ product }: { product: Product }) {
  return (
    <Link href={`/products/${product.id}`} className="product-card" style={{ height: "100%" }}>
      <div className="product-image-wrap" style={{ aspectRatio: "1.2/1", flex: 1 }}>
        <Badge kind={product.badge} />
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, 50vw"
          style={{ objectFit: "cover" }}
        />
      </div>
      <div className="product-card-body" style={{ padding: "20px 24px 24px" }}>
        <div className="product-cat">{product.categoryLabel}</div>
        <h3 className="product-name" style={{ fontSize: 22 }}>{product.name}</h3>
        <p style={{ fontSize: 13, color: "var(--rut-fg-600)", lineHeight: 1.55, margin: "8px 0 0" }}>{product.short}</p>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14 }}>
          <PriceTag product={product} />
          {product.colors.length > 1 && (
            <div className="color-dots" style={{ marginTop: 0 }}>
              {product.colors.slice(0, 4).map((c) => (
                <span key={c.name} className="color-dot" style={{ background: c.hex }} title={c.name} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

export function ProductCardWide({ product }: { product: Product }) {
  return (
    <Link href={`/products/${product.id}`} className="product-card" style={{ flexDirection: "row" }}>
      <div className="product-image-wrap" style={{ aspectRatio: "1/1", width: 180, flexShrink: 0 }}>
        <Badge kind={product.badge} />
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          sizes="180px"
          style={{ objectFit: "cover" }}
        />
      </div>
      <div className="product-card-body" style={{ padding: "22px 26px", display: "flex", flexDirection: "column", justifyContent: "center", flex: 1 }}>
        <div className="product-cat">{product.categoryLabel}</div>
        <h3 className="product-name" style={{ fontSize: 19 }}>{product.name}</h3>
        <p style={{ fontSize: 13, color: "var(--rut-fg-600)", lineHeight: 1.5, margin: "6px 0 10px" }}>{product.short}</p>
        <PriceTag product={product} />
      </div>
    </Link>
  );
}
