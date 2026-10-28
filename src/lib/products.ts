import { seedProducts } from "@/lib/site-content";
import {
  FREE_SHIPPING_FROM,
  SHIPPING_COST,
  formatBgn,
  quoteShipping,
} from "@/lib/pricing";

export { FREE_SHIPPING_FROM, SHIPPING_COST, formatBgn, quoteShipping };

export type PublicProduct = {
  id: number;
  slug: string;
  name: string;
  size: string;
  priceBgn: number;
};

/** Каталогът с официалните цени (от src/lib/site-content.ts). */
export async function getProducts(): Promise<PublicProduct[]> {
  return seedProducts.map((p, index) => ({
    id: index + 1,
    slug: p.slug,
    name: p.name,
    size: p.size,
    priceBgn: Number(p.priceBgn),
  }));
}

export function findProduct(
  list: PublicProduct[],
  slug: string | null | undefined,
): PublicProduct | null {
  if (!slug) return null;
  return list.find((p) => p.slug === slug) ?? null;
}
