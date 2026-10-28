import { z } from "zod";

/** Legible Bulgarian messages shown under the form fields. */
export const orderInputSchema = z.object({
  kind: z.enum(["order", "question"]),
  name: z
    .string()
    .trim()
    .min(2, "Моля, напишете името си.")
    .max(80, "Името е твърде дълго."),
  email: z
    .string()
    .trim()
    .max(140, "Имейлът е твърде дълъг.")
    .refine(
      (value) => /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(value),
      "Моля, напишете валиден имейл адрес.",
    ),
  phone: z
    .string()
    .trim()
    .max(40, "Телефонът е твърде дълъг.")
    .optional()
    .default(""),
  productSlug: z.string().trim().max(120).optional().default(""),
  quantity: z.number().int().min(1, "Минимум 1 брой.").max(24).default(1),
  message: z
    .string()
    .trim()
    .max(1500, "Съобщението е твърде дълго (макс. 1500 знака).")
    .optional()
    .default(""),
  /**
   * Honeypot — real people never see this field, so a value here means a bot.
   * We accept it in the schema and silently discard the submission in the route.
   */
  company: z.string().max(200).optional().default(""),
  /** Milliseconds the form was open. Bots submit instantly. */
  elapsedMs: z.number().min(0).max(1000 * 60 * 60 * 6).optional().default(0),
});

export type OrderInput = z.infer<typeof orderInputSchema>;

export type FieldErrors = Record<string, string>;

/** Turns a zod error into a plain { field: message } object. */
export function toFieldErrors(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

/** Coerces unknown JSON into the shape the validator expects. */
export function normalizeOrderPayload(raw: unknown): unknown {
  const body = (raw ?? {}) as Record<string, unknown>;
  const quantityRaw = Number(body.quantity);
  const elapsedRaw = Number(body.elapsedMs);

  return {
    kind: body.kind === "question" ? "question" : "order",
    name: typeof body.name === "string" ? body.name : "",
    email: typeof body.email === "string" ? body.email : "",
    phone: typeof body.phone === "string" ? body.phone : "",
    productSlug: typeof body.productSlug === "string" ? body.productSlug : "",
    quantity: Number.isFinite(quantityRaw) ? Math.round(quantityRaw) : 1,
    message: typeof body.message === "string" ? body.message : "",
    company: typeof body.company === "string" ? body.company.slice(0, 200) : "",
    elapsedMs: Number.isFinite(elapsedRaw) ? Math.round(elapsedRaw) : 0,
  };
}
