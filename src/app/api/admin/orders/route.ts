import { desc } from "drizzle-orm";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { isAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

function cell(value: unknown): string {
  const text = String(value ?? "").replace(/"/g, '""');
  return `"${text}"`;
}

export async function GET() {
  if (!(await isAdmin())) {
    return new Response("Неоторизиран достъп", { status: 401 });
  }

  const rows = await db.select().from(orders).orderBy(desc(orders.id));

  const header = [
    "Номер",
    "Вид",
    "Дата",
    "Име",
    "Имейл",
    "Телефон",
    "Продукт",
    "Бройки",
    "Сума (лв)",
    "Съобщение",
    "Статус",
    "Имейли",
  ];

  const lines = [header.map(cell).join(";")];
  for (const order of rows) {
    lines.push(
      [
        order.reference || order.id,
        order.kind === "order" ? "Поръчка" : "Въпрос",
        order.createdAt.toISOString(),
        order.customerName,
        order.email,
        order.phone,
        order.productName,
        order.quantity,
        order.totalBgn,
        order.message,
        order.status,
        order.emailStatus,
      ]
        .map(cell)
        .join(";"),
    );
  }

  // BOM so Excel opens Bulgarian characters correctly
  const csv = `\uFEFF${lines.join("\r\n")}`;

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="decucare-porchki-${new Date()
        .toISOString()
        .slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
