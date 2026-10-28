"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { orders } from "@/db/schema";
import {
  adminPassword,
  endAdminSession,
  isAdmin,
  loginLocked,
  startAdminSession,
} from "@/lib/admin-auth";

export type LoginState = { error?: string; locked?: boolean };

export async function login(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  if (await loginLocked()) {
    return {
      error: "Твърде много опити. Изчакайте няколко минути и опитайте пак.",
      locked: true,
    };
  }

  const password = String(formData.get("password") ?? "");
  if (password !== adminPassword()) {
    return { error: "Грешна парола. Опитайте отново." };
  }

  await startAdminSession();
  redirect("/admin");
}

export async function logout(): Promise<void> {
  await endAdminSession();
  redirect("/admin");
}

export async function setOrderStatus(formData: FormData): Promise<void> {
  if (!(await isAdmin())) return;
  const id = Number(formData.get("id"));
  const status = String(formData.get("status") ?? "new");
  if (!Number.isInteger(id) || id <= 0) return;
  if (!["new", "in_progress", "done"].includes(status)) return;

  await db.update(orders).set({ status }).where(eq(orders.id, id));
  revalidatePath("/admin");
}
