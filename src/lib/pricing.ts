import { brand } from "@/lib/site-content";

/** Safe to import from client components — no database code here. */
export const SHIPPING_COST = 5.9;
export const FREE_SHIPPING_FROM = brand.freeShippingFrom;

export function formatBgn(value: string | number): string {
  const num = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(num)) return "0,00 лв";
  return `${num.toFixed(2).replace(".", ",")} лв`;
}

export function quoteShipping(subtotal: number): number {
  if (subtotal <= 0) return 0;
  return subtotal >= FREE_SHIPPING_FROM ? 0 : SHIPPING_COST;
}
