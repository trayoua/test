/**
 * ─────────────────────────────────────────────────────────────
 *  DECUCARE — ДАННИ, КОИТО ИЗПОЛЗВА СЪРВЪРЪТ
 * ─────────────────────────────────────────────────────────────
 *  Текстовете и снимките на самата страница са в public/index.html.
 *  Този файл е за поръчките и имейлите:
 *   - brand: контакти, които влизат в имейлите
 *   - seedProducts: ОФИЦИАЛНИТЕ ЦЕНИ. Сървърът смята сумата оттук,
 *     така че никой не може да подмени цената от браузъра.
 *
 *  ВАЖНО: ако смениш цена тук, смени я и в public/index.html
 *  (на картата на продукта и в падащото меню на формата,
 *  атрибут data-price).
 */

export const brand = {
  name: "DECUCARE",
  email: "hello@decucare.bg",
  phone: "+359 88 000 0000",
  city: "София, България",
  freeShippingFrom: 60,
};

export type SeedProduct = {
  slug: string;
  name: string;
  size: string;
  priceBgn: string;
};

export const seedProducts: SeedProduct[] = [
  {
    slug: "regenerirasht-krem-150",
    name: "DECUCARE Регенериращ крем",
    size: "150 мл",
    priceBgn: "49.00",
  },
  {
    slug: "duo-komplekt-2x150",
    name: "DECUCARE Дуо комплект",
    size: "2 × 150 мл",
    priceBgn: "79.00",
  },
  {
    slug: "mini-krem-30",
    name: "DECUCARE Мини крем",
    size: "30 мл",
    priceBgn: "24.00",
  },
];
