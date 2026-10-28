import { brand } from "@/lib/site-content";
import { formatBgn } from "@/lib/pricing";

/**
 * Emails are sent with Resend (https://resend.com) — a simple HTTP API,
 * no heavy library. Everything is read from environment variables so no
 * secret ever lives in the page code:
 *
 *   RESEND_API_KEY        → your Resend API key
 *   ORDER_NOTIFY_EMAIL    → where YOU receive order notifications
 *   EMAIL_FROM            → e.g. "DecuCare <orders@yourdomain.bg>"
 */

export type OrderEmailData = {
  reference: string;
  kind: string;
  customerName: string;
  email: string;
  phone: string;
  productName: string;
  quantity: number;
  totalBgn: string;
  message: string;
  createdAt: Date;
};

const FROM = process.env.EMAIL_FROM ?? `DecuCare <onboarding@resend.dev>`;
const OWNER_EMAIL =
  process.env.ORDER_NOTIFY_EMAIL ?? process.env.OWNER_EMAIL ?? brand.email;

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("bg-BG", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Europe/Sofia",
  }).format(date);
}

function layout(title: string, intro: string, body: string): string {
  return `<!doctype html>
<html lang="bg"><head><meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${title}</title></head>
<body style="margin:0;padding:0;background:#f6efe6;font-family:Georgia,'Times New Roman',serif;color:#3a322b;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6efe6;padding:32px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fffdf9;border:1px solid #e8dacb;border-radius:18px;overflow:hidden;">
        <tr><td style="padding:28px 32px 8px 32px;">
          <div style="font-size:13px;letter-spacing:.32em;text-transform:uppercase;color:#b4634a;">DecuCare</div>
          <h1 style="margin:12px 0 0;font-size:26px;line-height:1.3;font-weight:400;color:#3a322b;">${title}</h1>
          <p style="margin:10px 0 0;font-size:15px;line-height:1.6;color:#7a6a5c;">${intro}</p>
        </td></tr>
        <tr><td style="padding:8px 32px 32px 32px;">${body}</td></tr>
        <tr><td style="padding:18px 32px;background:#f9f3ea;border-top:1px solid #e8dacb;">
          <p style="margin:0;font-size:12px;line-height:1.6;color:#9b8b7a;">
            ${brand.name} · ${brand.city} · <a href="mailto:${brand.email}" style="color:#b4634a;text-decoration:none;">${brand.email}</a><br/>
            Създадено с любов в България.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function rows(data: OrderEmailData): string {
  const row = (label: string, value: string) =>
    `<tr>
      <td style="padding:10px 0;font-size:13px;color:#9b8b7a;vertical-align:top;white-space:nowrap;padding-right:16px;">${label}</td>
      <td style="padding:10px 0;font-size:15px;color:#3a322b;">${value || "—"}</td>
    </tr>`;

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e8dacb;margin-top:14px;">
    ${row("Номер", data.reference)}
    ${row("Име", escapeHtml(data.customerName))}
    ${row("Имейл", `<a href="mailto:${data.email}" style="color:#b4634a;">${escapeHtml(data.email)}</a>`)}
    ${row("Телефон", escapeHtml(data.phone))}
    ${row("Продукт", escapeHtml(data.productName))}
    ${row("Количество", String(data.quantity))}
    ${row("Сума", formatBgn(data.totalBgn))}
    ${row("Съобщение", escapeHtml(data.message).replace(/\n/g, "<br/>"))}
    ${row("Получено", formatDate(data.createdAt))}
  </table>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function ownerHtml(data: OrderEmailData): string {
  const isOrder = data.kind === "order";
  return layout(
    isOrder ? "Нова поръчка в DecuCare" : "Нов въпрос от сайта",
    isOrder
      ? "Някой току що поръча крем. Ето детайлите:"
      : "Някой писа през формата на сайта. Ето какво пита:",
    rows(data),
  );
}

function customerHtml(data: OrderEmailData): string {
  const isOrder = data.kind === "order";
  const body = `
    <p style="margin:14px 0 0;font-size:15px;line-height:1.7;color:#3a322b;">
      Здравейте, ${escapeHtml(data.customerName)}!
    </p>
    <p style="margin:12px 0 0;font-size:15px;line-height:1.7;color:#3a322b;">
      ${
        isOrder
          ? `Получихме поръчката Ви за <strong>${escapeHtml(data.productName)}</strong>${
              data.quantity > 1 ? ` × ${data.quantity}` : ""
            } на обща стойност <strong>${formatBgn(data.totalBgn)}</strong>.`
          : "Получихме съобщението Ви и много се радвам, че ни писахте."
      }
    </p>
    <p style="margin:12px 0 0;font-size:15px;line-height:1.7;color:#7a6a5c;">
      Ще се свържем с Вас до 24 часа, за да потвърдим адреса за доставка и начина на плащане.
      Номерът на Вашето запитване е <strong>${data.reference}</strong> — запазете го за удобство.
    </p>
    ${rows(data)}
    <p style="margin:20px 0 0;font-size:14px;line-height:1.7;color:#7a6a5c;">
      Ако нещо в данните е грешно, просто отговорете на този имейл или пишете на
      <a href="mailto:${brand.email}" style="color:#b4634a;">${brand.email}</a>.
    </p>`;

  return layout(
    isOrder ? "Получихме Вашата поръчка" : "Получихме Вашето съобщение",
    "Благодарим Ви, че избрахте DecuCare.",
    body,
  );
}

async function sendViaResend(
  to: string,
  subject: string,
  html: string,
  replyTo?: string,
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY_MISSING");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM,
      to: [to],
      subject,
      html,
      ...(replyTo ? { reply_to: replyTo } : {}),
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`RESEND_${response.status}: ${text.slice(0, 200)}`);
  }
}

export type EmailOutcome = { status: "sent" | "skipped" | "failed"; detail: string };

/** Sends both emails. Never throws — failures are recorded on the order. */
export async function sendOrderEmails(data: OrderEmailData): Promise<EmailOutcome> {
  if (!process.env.RESEND_API_KEY) {
    console.warn(
      "[decucare] RESEND_API_KEY липсва — имейлите се пропускат, поръчката е записана в базата.",
    );
    return {
      status: "skipped",
      detail: "Липсва RESEND_API_KEY — имейлите не са изпратени.",
    };
  }

  const isOrder = data.kind === "order";
  const results = await Promise.allSettled([
    sendViaResend(
      OWNER_EMAIL,
      isOrder
        ? `Нова поръчка ${data.reference} · ${data.productName}`
        : `Нов въпрос ${data.reference} · ${data.customerName}`,
      ownerHtml(data),
      data.email,
    ),
    sendViaResend(
      data.email,
      isOrder
        ? `DecuCare: получихме поръчката Ви (${data.reference})`
        : `DecuCare: получихме Вашето съобщение (${data.reference})`,
      customerHtml(data),
    ),
  ]);

  const errors = results
    .map((r) => (r.status === "rejected" ? String(r.reason) : ""))
    .filter(Boolean);

  if (errors.length === 2) {
    return { status: "failed", detail: errors.join(" | ").slice(0, 500) };
  }
  if (errors.length === 1) {
    return { status: "sent", detail: `Частично: ${errors[0].slice(0, 200)}` };
  }
  return { status: "sent", detail: "Изпратени имейл до клиента и до Вас." };
}
