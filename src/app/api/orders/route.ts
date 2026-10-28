import { eq } from "drizzle-orm";
import { createHash } from "node:crypto";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { sendOrderEmails } from "@/lib/email";
import { clientIp, tooManyRequests } from "@/lib/rate-limit";
import { findProduct, getProducts, quoteShipping } from "@/lib/products";
import {
  normalizeOrderPayload,
  orderInputSchema,
  toFieldErrors,
} from "@/lib/validation";

export const dynamic = "force-dynamic";

function json(body: unknown, status = 200) {
  return Response.json(body, { status });
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return json({ ok: false, message: "Невалидна заявка." }, 400);
  }

  const input = orderInputSchema.safeParse(normalizeOrderPayload(payload));
  if (!input.success) {
    return json(
      {
        ok: false,
        message: "Проверете отбелязаните полета.",
        errors: toFieldErrors(input.error),
      },
      422,
    );
  }

  const data = input.data;

  // ── Anti-spam ───────────────────────────────────────────────
  // Honeypot filled, or submitted suspiciously fast: pretend everything
  // is fine so bots learn nothing, but store nothing.
  if (data.company.trim().length > 0 || (data.elapsedMs > 0 && data.elapsedMs < 1200)) {
    return json({ ok: true, reference: "DC-0000", spam: true });
  }

  const ip = clientIp(request);
  if (tooManyRequests(`order:${ip}`)) {
    return json(
      {
        ok: false,
        message:
          "Твърде много заявки от това устройство. Моля, опитайте отново след няколко минути или пишете директно на имейла ни.",
      },
      429,
    );
  }

  // ── Resolve the chosen piece ────────────────────────────────
  const catalog = await getProducts();
  const product = findProduct(catalog, data.productSlug);

  if (data.kind === "order" && !product) {
    return json(
      {
        ok: false,
        message: "Моля, изберете продукт от списъка.",
        errors: { productSlug: "Изберете продукт." },
      },
      422,
    );
  }

  const quantity = data.kind === "question" ? 0 : data.quantity;
  const subtotal = product && quantity > 0 ? product.priceBgn * quantity : 0;
  const total = subtotal + quoteShipping(subtotal);

  const ipHash = createHash("sha256").update(ip).digest("hex").slice(0, 32);

  // ── Save first, so the order is never lost even if mail fails ──
  let saved;
  try {
    [saved] = await db
      .insert(orders)
      .values({
        reference: "",
        kind: data.kind,
        customerName: data.name,
        email: data.email,
        phone: data.phone,
        productId: product?.id ?? null,
        productName: product ? `${product.name} · ${product.size}` : "—",
        quantity,
        totalBgn: total.toFixed(2),
        message: data.message,
        ipHash,
        userAgent: (request.headers.get("user-agent") ?? "").slice(0, 250),
      })
      .returning();
  } catch (error) {
    console.error("[decucare] order insert failed:", error);
    return json(
      {
        ok: false,
        message:
          "Не успяхме да запазим поръчката. Моля, пишете ни директно на имейла.",
      },
      500,
    );
  }

  const reference = `DC-${new Date().getFullYear()}-${String(saved.id).padStart(4, "0")}`;
  await db
    .update(orders)
    .set({ reference })
    .where(eq(orders.id, saved.id));

  // ── Emails ─────────────────────────────────────────────────
  const outcome = await sendOrderEmails({
    reference,
    kind: data.kind,
    customerName: data.name,
    email: data.email,
    phone: data.phone,
    productName: product ? `${product.name} · ${product.size}` : "—",
    quantity: quantity || 1,
    totalBgn: total.toFixed(2),
    message: data.message,
    createdAt: saved.createdAt,
  });

  await db
    .update(orders)
    .set({ emailStatus: outcome.status, emailDetail: outcome.detail })
    .where(eq(orders.id, saved.id));

  return json({
    ok: true,
    reference,
    kind: data.kind,
    total: total.toFixed(2),
    summary: {
      product: product ? `${product.name} · ${product.size}` : null,
      quantity,
      subtotal: subtotal.toFixed(2),
      shipping: quoteShipping(subtotal).toFixed(2),
      total: total.toFixed(2),
    },
  });
}
