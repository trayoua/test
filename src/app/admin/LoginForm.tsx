"use client";

import { useActionState } from "react";
import { login, type LoginState } from "@/app/admin/actions";

const initialState: LoginState = {};

export default function LoginForm({ hint }: { hint: boolean }) {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <div className="mx-auto w-full max-w-md rounded-[2rem] border border-beige/80 bg-cream p-8 shadow-[0_40px_80px_-60px_rgba(53,48,42,0.7)]">
      <p className="eyebrow">Защитена зона</p>
      <h1 className="mt-4 font-display text-3xl text-ink">Поръчки</h1>
      <p className="mt-3 text-[0.94rem] leading-relaxed text-muted">
        Въведете паролата, за да видите поръчките и въпросите от сайта.
      </p>

      <form action={formAction} className="mt-7">
        <label
          className="mb-2 block text-[0.7rem] tracking-[0.2em] text-muted uppercase"
          htmlFor="password"
        >
          Парола
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="w-full rounded-2xl border border-beige bg-shell/50 px-4 py-3.5 text-ink focus:border-terracotta focus:bg-cream focus:outline-none"
          placeholder="••••••••"
        />
        {state.error ? (
          <p className="mt-3 text-[0.85rem] text-terracotta">{state.error}</p>
        ) : null}
        <button
          type="submit"
          disabled={pending}
          className="mt-6 w-full rounded-full bg-ink px-6 py-3.5 text-[0.78rem] tracking-[0.2em] text-cream uppercase transition-colors hover:bg-terracotta disabled:opacity-60"
        >
          {pending ? "Проверяваме…" : "Влез"}
        </button>
      </form>

      {hint ? (
        <p className="mt-6 rounded-2xl bg-sand/60 px-4 py-3 text-[0.8rem] leading-relaxed text-muted">
          Засега се използва служебната парола{" "}
          <code className="text-terracotta">decucare-admin</code>. Сменете я,
          като добавите <code>ADMIN_PASSWORD=...</code> във файла{" "}
          <code>.env</code>.
        </p>
      ) : null}
    </div>
  );
}
