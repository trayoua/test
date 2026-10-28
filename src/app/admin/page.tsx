import { desc } from "drizzle-orm";
import type { Metadata } from "next";
import { logout, setOrderStatus } from "@/app/admin/actions";
import LoginForm from "@/app/admin/LoginForm";
import { Icon, Logo } from "@/components/Icons";
import { db } from "@/db";
import { orders, type Order } from "@/db/schema";
import { isAdmin, usingDefaultPassword } from "@/lib/admin-auth";
import { formatBgn } from "@/lib/pricing";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Поръчки",
  robots: { index: false, follow: false },
};

const statusLabels: Record<string, string> = {
  new: "Нова",
  in_progress: "В процес",
  done: "Завършена",
};

const emailLabels: Record<string, string> = {
  pending: "имейлите чакат",
  sent: "имейлите са изпратени",
  skipped: "без имейли (липсва ключ)",
  failed: "имейлът не е минал",
};

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("bg-BG", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Europe/Sofia",
  }).format(date);
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-beige/70 bg-cream/70 px-5 py-4">
      <p className="text-[0.66rem] tracking-[0.2em] text-muted uppercase">
        {label}
      </p>
      <p className="mt-2 font-display text-2xl text-ink">{value}</p>
    </div>
  );
}

function OrderRow({ order }: { order: Order }) {
  const isQuestion = order.kind === "question";
  return (
    <article className="rounded-[1.5rem] border border-beige/70 bg-cream/60 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="font-display text-xl text-ink">
              {order.reference || `#${order.id}`}
            </h3>
            <span
              className={`rounded-full px-3 py-1 text-[0.62rem] tracking-[0.16em] uppercase ${
                isQuestion
                  ? "bg-gold/15 text-gold"
                  : "bg-terracotta/12 text-terracotta"
              }`}
            >
              {isQuestion ? "въпрос" : "поръчка"}
            </span>
            <span className="rounded-full bg-shell px-3 py-1 text-[0.62rem] tracking-[0.16em] text-muted uppercase">
              {statusLabels[order.status] ?? order.status}
            </span>
          </div>
          <p className="mt-2 text-[0.85rem] text-muted">{formatDate(order.createdAt)}</p>
        </div>
        <div className="text-right">
          <p className="font-display text-xl text-ink">
            {order.kind === "order" ? formatBgn(order.totalBgn) : "—"}
          </p>
          <p className="text-[0.72rem] text-muted">
            {order.quantity > 0 ? `${order.quantity} бр. · ` : ""}
            {emailLabels[order.emailStatus] ?? order.emailStatus}
          </p>
        </div>
      </div>

      <dl className="mt-5 grid gap-x-8 gap-y-2 border-t border-beige/70 pt-4 text-[0.9rem] sm:grid-cols-2">
        <div className="flex justify-between gap-4 sm:justify-start">
          <dt className="w-24 shrink-0 text-muted">Име</dt>
          <dd className="text-ink">{order.customerName}</dd>
        </div>
        <div className="flex justify-between gap-4 sm:justify-start">
          <dt className="w-24 shrink-0 text-muted">Имейл</dt>
          <dd>
            <a href={`mailto:${order.email}`} className="text-terracotta">
              {order.email}
            </a>
          </dd>
        </div>
        <div className="flex justify-between gap-4 sm:justify-start">
          <dt className="w-24 shrink-0 text-muted">Телефон</dt>
          <dd className="text-ink">
            {order.phone ? (
              <a
                href={`tel:${order.phone.replace(/\s/g, "")}`}
                className="hover:text-terracotta"
              >
                {order.phone}
              </a>
            ) : (
              "—"
            )}
          </dd>
        </div>
        <div className="flex justify-between gap-4 sm:justify-start">
          <dt className="w-24 shrink-0 text-muted">Продукт</dt>
          <dd className="text-ink">{order.productName || "—"}</dd>
        </div>
      </dl>

      {order.message ? (
        <p className="mt-4 rounded-2xl bg-shell/70 px-4 py-3 text-[0.9rem] leading-relaxed whitespace-pre-line text-muted">
          {order.message}
        </p>
      ) : null}

      {order.emailDetail ? (
        <p className="mt-3 text-[0.72rem] text-muted/70">{order.emailDetail}</p>
      ) : null}

      <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-beige/70 pt-4">
        {(["new", "in_progress", "done"] as const).map((status) => (
          <form key={status} action={setOrderStatus}>
            <input type="hidden" name="id" value={order.id} />
            <input type="hidden" name="status" value={status} />
            <button
              type="submit"
              disabled={order.status === status}
              className={`rounded-full px-4 py-2 text-[0.68rem] tracking-[0.14em] uppercase transition-colors ${
                order.status === status
                  ? "cursor-default bg-ink text-cream"
                  : "border border-beige text-muted hover:border-terracotta hover:text-terracotta"
              }`}
            >
              {statusLabels[status]}
            </button>
          </form>
        ))}
      </div>
    </article>
  );
}

export default async function AdminPage() {
  if (!(await isAdmin())) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-shell/50 px-5 py-20">
        <LoginForm hint={usingDefaultPassword()} />
      </main>
    );
  }

  const rows = await db.select().from(orders).orderBy(desc(orders.id)).limit(300);
  const realOrders = rows.filter((r) => r.kind === "order");
  const questions = rows.filter((r) => r.kind === "question");
  const revenue = realOrders.reduce((sum, r) => sum + Number(r.totalBgn), 0);
  const fresh = rows.filter((r) => r.status === "new").length;

  return (
    <main className="min-h-screen bg-shell/50 pb-20">
      <header className="border-b border-beige/70 bg-cream">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-5 py-5 sm:px-8">
          <Logo />
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="rounded-full border border-beige px-4 py-2 text-[0.7rem] tracking-[0.16em] text-muted uppercase transition-colors hover:text-terracotta"
            >
              Към сайта
            </a>
            <form action={logout}>
              <button
                type="submit"
                className="rounded-full bg-ink px-4 py-2 text-[0.7rem] tracking-[0.16em] text-cream uppercase transition-colors hover:bg-terracotta"
              >
                Изход
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-5 pt-10 sm:px-8">
        <div className="grid gap-3 sm:grid-cols-4">
          <Stat label="Всички записи" value={String(rows.length)} />
          <Stat label="Нови" value={String(fresh)} />
          <Stat label="Въпроси" value={String(questions.length)} />
          <Stat label="Стойност" value={formatBgn(revenue)} />
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <h1 className="font-display text-3xl text-ink">
            Записи от формата
          </h1>
          <a
            href="/api/admin/orders"
            className="inline-flex items-center gap-2 rounded-full border border-beige px-5 py-2.5 text-[0.72rem] tracking-[0.16em] text-ink uppercase transition-colors hover:border-terracotta hover:text-terracotta"
          >
            <Icon name="mail" className="h-4 w-4" />
            Изтегли CSV
          </a>
        </div>

        {rows.length === 0 ? (
          <p className="mt-10 rounded-[1.5rem] border border-dashed border-beige bg-cream/60 px-6 py-14 text-center text-muted">
            Още няма поръчки. Ще се появят тук веднага, щом някой попълни формата.
          </p>
        ) : (
          <div className="mt-7 space-y-4">
            {rows.map((order) => (
              <OrderRow key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
