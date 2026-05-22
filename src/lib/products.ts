import { readJson, writeJson, PRODUCTS_PATH } from "./blob-store";

export interface ProductColor {
  name: string;
  hex: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  categoryLabel: string;
  price: number;
  salePrice?: number;
  badge?: "new" | "sale" | "limited" | "featured" | null;
  featured?: boolean;
  colors: ProductColor[];
  images: string[];
  sizes: string[];
  short: string;
  long: string;
  details: string[];
  rating: number;
  reviewCount: number;
}

export interface Category {
  id: string;
  label: string;
}

export const PRODUCTS: Product[] = [
  {
    id: "rut-classic-tee",
    name: "RUT Classic Logo Tee",
    category: "tees",
    categoryLabel: "Tee",
    price: 28,
    badge: null,
    featured: true,
    colors: [
      { name: "White", hex: "#FFFFFF" },
      { name: "Black", hex: "#0B1220" },
      { name: "Purple", hex: "#B221F6" },
    ],
    images: [
      "/images/custom-tshirt.png",
      "/images/custom-shirts.png",
      "/images/screenprinting.png",
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    short: "The original. 6.0oz heavyweight cotton tee with the RUT mascot front and center.",
    long: "Our flagship shirt — soft, heavyweight ringspun cotton with a screen-printed RUT cartoon squeegee mascot. Printed in-house in Nyack on Bella+Canvas blanks. Pre-shrunk. Sized true. The shirt we wear every day at the shop.",
    details: [
      "6.0oz / 100% ringspun cotton",
      "Bella+Canvas 3001 blank",
      "Plastisol ink screen print",
      "Pre-shrunk, tagless",
    ],
    rating: 5.0,
    reviewCount: 42,
  },
  {
    id: "nyack-heavy-hoodie",
    name: "Nyack Local Heavy Hoodie",
    category: "hoodies",
    categoryLabel: "Hoodie",
    price: 58,
    badge: "new",
    colors: [
      { name: "Ink", hex: "#160028" },
      { name: "Heather Grey", hex: "#A8A29E" },
    ],
    images: [
      "/images/nyack-shirt.png",
      "/images/custom-embroidery.png",
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    short: "Heavyweight fleece hoodie with embroidered \"NYACK\" chest hit.",
    long: "Built for Hudson Valley fall. 12oz brushed fleece, double-lined hood, kangaroo pocket, and a 3D puff-embroidered NYACK chest mark. Locally printed and stitched at our Nyack shop.",
    details: [
      "12oz / 80/20 cotton-poly fleece",
      "Independent Trading Co. SS4500 blank",
      "Puff embroidery, chest hit",
      "Ribbed cuffs and waistband",
    ],
    rating: 4.9,
    reviewCount: 18,
  },
  {
    id: "print-shop-dad-hat",
    name: "Print Shop Embroidered Dad Hat",
    category: "headwear",
    categoryLabel: "Hat",
    price: 32,
    badge: null,
    colors: [
      { name: "Black", hex: "#0B1220" },
      { name: "Stone", hex: "#D6CFC4" },
      { name: "Coral", hex: "#FF6452" },
    ],
    images: [
      "/images/custom-hats.png",
      "/images/custom-embroidery.png",
    ],
    sizes: ["One Size"],
    short: "Unstructured 6-panel with the RUT script embroidered on the front.",
    long: "Soft, washed cotton twill in an unstructured 6-panel shape. Low profile, adjustable brass buckle, and a clean stitched RUT script on the front panel.",
    details: [
      "100% washed cotton twill",
      "Unstructured, low-profile crown",
      "Brass slide buckle adjuster",
      "Pre-curved visor",
    ],
    rating: 5.0,
    reviewCount: 27,
  },
  {
    id: "rockland-crewneck",
    name: "Rockland County Crewneck",
    category: "hoodies",
    categoryLabel: "Crewneck",
    price: 52,
    badge: null,
    colors: [
      { name: "Cream", hex: "#F5F1E8" },
      { name: "Forest", hex: "#1F4D3B" },
    ],
    images: [
      "/images/sportwear.png",
      "/images/custom-shirts.png",
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    short: "Collegiate-style felt-applique \"ROCKLAND\" arch across the chest.",
    long: "A throwback crewneck cut from heavyweight 80/20 fleece, with a chenille felt-applique \"ROCKLAND COUNTY\" arch — the same technique you'd find on a varsity letterman jacket. Built to last, broken in fast.",
    details: [
      "9.5oz / 80/20 cotton-poly fleece",
      "Chenille felt applique",
      "Set-in sleeves, ribbed trim",
      "Side seam construction",
    ],
    rating: 4.8,
    reviewCount: 11,
  },
  {
    id: "squeegee-long-sleeve",
    name: "Squeegee Squad Long Sleeve",
    category: "tees",
    categoryLabel: "Long Sleeve",
    price: 34,
    salePrice: 26,
    badge: "sale",
    colors: [
      { name: "Black", hex: "#0B1220" },
      { name: "Purple", hex: "#B221F6" },
    ],
    images: [
      "/images/screenprinting.png",
      "/images/custom-inks.png",
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    short: "Sleeve-print long sleeve with squeegee illustrations down each arm.",
    long: "A staff shirt that became a customer favorite. Heavyweight long sleeve with screen-printed squeegee illustrations running down both arms and a small \"Squeegee Squad\" mark over the heart.",
    details: [
      "6.5oz / 100% ringspun cotton",
      "Discharge ink (soft hand)",
      "Both-sleeve print",
      "Ribbed cuffs",
    ],
    rating: 5.0,
    reviewCount: 33,
  },
  {
    id: "rut-icon-beanie",
    name: "RUT Icon Beanie",
    category: "headwear",
    categoryLabel: "Beanie",
    price: 26,
    badge: null,
    colors: [
      { name: "Black", hex: "#0B1220" },
      { name: "Plum", hex: "#3D1B5F" },
      { name: "Coral", hex: "#FF6452" },
    ],
    images: [
      "/images/custom-hats.png",
      "/images/custom-embroidery.png",
    ],
    sizes: ["One Size"],
    short: "Knit beanie with woven RUT shirt-icon patch on the cuff.",
    long: "Classic ribbed knit beanie. Single-fold cuff with our shirt-icon woven patch sewn on. Warm, simple, looks good with everything.",
    details: [
      "100% acrylic knit",
      "Woven label patch",
      "Single-fold cuff",
      "One size fits most",
    ],
    rating: 4.9,
    reviewCount: 22,
  },
  {
    id: "hudson-trucker",
    name: "Hudson Valley Trucker",
    category: "headwear",
    categoryLabel: "Trucker",
    price: 30,
    badge: "new",
    colors: [
      { name: "Black/White", hex: "#0B1220" },
      { name: "Navy/White", hex: "#1B2541" },
    ],
    images: [
      "/images/custom-hats.png",
      "/images/sportwear.png",
    ],
    sizes: ["One Size"],
    short: "5-panel mesh-back trucker with a chain-stitched mountain wordmark.",
    long: "Mid-profile 5-panel trucker with a structured front and breathable mesh back. Chain-stitched \"HUDSON VALLEY\" wordmark over a tiny mountain silhouette. Made for summer.",
    details: [
      "Cotton-twill front, poly-mesh back",
      "Chain-stitched embroidery",
      "Snapback closure",
      "Mid-profile, 5-panel",
    ],
    rating: 5.0,
    reviewCount: 9,
  },
  {
    id: "sticker-pack",
    name: "Vinyl Sticker Pack (5)",
    category: "stickers",
    categoryLabel: "Stickers",
    price: 12,
    badge: null,
    colors: [{ name: "Multi", hex: "#B221F6" }],
    images: [
      "/images/custom-inks.png",
      "/images/largeformat.png",
    ],
    sizes: ["3in"],
    short: "Five die-cut vinyl stickers. Weather-resistant, dishwasher-safe.",
    long: "A pack of five glossy vinyl die-cuts: the RUT mascot, the squeegee mark, the Nyack arch, a Hudson Valley peak, and a small \"Made in Nyack\" tag. UV laminated for outdoor durability.",
    details: [
      "Premium glossy vinyl + UV laminate",
      "3-year outdoor rating",
      "Die-cut, 3in average",
      "Dishwasher safe",
    ],
    rating: 5.0,
    reviewCount: 64,
  },
  {
    id: "enamel-pin",
    name: "RUT Mascot Enamel Pin",
    category: "stickers",
    categoryLabel: "Pin",
    price: 10,
    badge: null,
    colors: [{ name: "Multi", hex: "#FF6452" }],
    images: [
      "/images/custom-inks.png",
      "/images/custom-tshirt.png",
    ],
    sizes: ["1.25in"],
    short: "Hard enamel pin of the smiling squeegee mascot.",
    long: "A hard enamel pin of the RUT squeegee mascot in his sunglasses. Black nickel plating, double rubber clutch backing so it stays put.",
    details: [
      "Hard enamel, black nickel plate",
      "Double rubber clutch backing",
      "1.25in tall",
      "Comes on a printed backer card",
    ],
    rating: 5.0,
    reviewCount: 38,
  },
  {
    id: "printers-tote",
    name: "Printers Union Canvas Tote",
    category: "accessories",
    categoryLabel: "Tote",
    price: 24,
    badge: null,
    colors: [
      { name: "Natural", hex: "#E8DFCB" },
      { name: "Black", hex: "#0B1220" },
    ],
    images: [
      "/images/custom-shirts.png",
      "/images/largeformat.png",
    ],
    sizes: ["One Size"],
    short: "Heavy 10oz canvas tote with a faded screen-print \"Printers Union\" mark.",
    long: "A heavyweight canvas tote with reinforced web handles. Vintage-feel screen print on both sides — \"Printers Union Local 845\" — printed with a soft, distressed waterbase ink.",
    details: [
      "10oz natural canvas",
      "Reinforced cotton-web handles",
      "Waterbase distressed print",
      "15in × 16in × 4in gusset",
    ],
    rating: 4.9,
    reviewCount: 14,
  },
  {
    id: "press-pocket-tee",
    name: "Press, Don't Stress Pocket Tee",
    category: "tees",
    categoryLabel: "Pocket Tee",
    price: 28,
    badge: null,
    colors: [
      { name: "Sand", hex: "#E0D2BC" },
      { name: "Sage", hex: "#A9B8A0" },
    ],
    images: [
      "/images/custom-tshirt.png",
      "/images/custom-shirts.png",
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    short: "Garment-dyed pocket tee with a tiny chest-pocket slogan print.",
    long: "Pigment-dyed for a lived-in look out of the box. Small chest pocket with our \"Press, Don't Stress\" slogan printed in a contrast color above it.",
    details: [
      "6.5oz / 100% pigment-dyed cotton",
      "Comfort Colors 6030 blank",
      "Chest pocket with slogan print",
      "Garment dyed — slight variation by lot",
    ],
    rating: 4.8,
    reviewCount: 19,
  },
  {
    id: "holiday-drop-tee",
    name: "Holiday Drop — Tinsel & Toner Tee",
    category: "tees",
    categoryLabel: "Limited Tee",
    price: 32,
    badge: "limited",
    colors: [
      { name: "Forest", hex: "#1F4D3B" },
      { name: "Ink", hex: "#160028" },
    ],
    images: [
      "/images/custom-shirts.png",
      "/images/screenprinting.png",
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    short: "The 2026 winter drop. A 4-color holiday print on a heavyweight tee. Limited run.",
    long: "Our annual holiday drop. Hand-drawn \"Tinsel & Toner\" graphic — four screens, metallic gold ink on the centerpiece — printed on a heavy ringspun tee. We print these once a year and we never reprint last year's. Get yours before they're gone.",
    details: [
      "6.0oz / 100% ringspun cotton",
      "4-color screen print, gold metallic accent",
      "Numbered run — 240 pieces total",
      "Ships within 5 days",
    ],
    rating: 5.0,
    reviewCount: 7,
  },
];

export const CATEGORIES: Category[] = [
  { id: "all", label: "All" },
  { id: "tees", label: "Tees" },
  { id: "hoodies", label: "Hoodies" },
  { id: "headwear", label: "Headwear" },
  { id: "stickers", label: "Stickers & Pins" },
  { id: "accessories", label: "Accessories" },
];

export function findProduct(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

export function formatPrice(amount: number): string {
  return "$" + amount.toFixed(2);
}

// Server-only: reads live products from Vercel Blob, falls back to static PRODUCTS
export async function getProducts(): Promise<Product[]> {
  try {
    const fromBlob = await readJson<Product[]>(PRODUCTS_PATH);
    if (fromBlob && fromBlob.length > 0) return fromBlob;
  } catch {
    // Blob not configured — fall through to static
  }
  return PRODUCTS;
}

// Server-only: persist product list to Blob
export async function saveProducts(products: Product[]): Promise<void> {
  await writeJson(PRODUCTS_PATH, products);
}
