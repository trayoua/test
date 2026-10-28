import { createHash, timingSafeEqual } from "node:crypto";
import { cookies, headers } from "next/headers";
import { tooManyRequests } from "@/lib/rate-limit";

const COOKIE_NAME = "dc_admin";
const MAX_AGE_SECONDS = 60 * 60 * 12; // 12 hours

/**
 * The admin password comes from an environment variable so it is never
 * written in the code. Set ADMIN_PASSWORD in .env (or in your hosting
 * panel). The fallback below is only for the first local look-around.
 */
export function adminPassword(): string {
  return process.env.ADMIN_PASSWORD ?? "decucare-admin";
}

export function usingDefaultPassword(): boolean {
  return !process.env.ADMIN_PASSWORD;
}

function sessionToken(): string {
  return createHash("sha256")
    .update(`decucare::${adminPassword()}`)
    .digest("hex");
}

function sameToken(value: string): boolean {
  const expected = Buffer.from(sessionToken());
  const given = Buffer.from(value);
  if (expected.length !== given.length) return false;
  return timingSafeEqual(expected, given);
}

export async function isAdmin(): Promise<boolean> {
  const store = await cookies();
  const value = store.get(COOKIE_NAME)?.value;
  return Boolean(value && sameToken(value));
}

export async function startAdminSession(): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAME, sessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function endAdminSession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function requestKey(prefix: string): Promise<string> {
  const store = await headers();
  const ip =
    store.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    store.get("x-real-ip") ??
    "local";
  return `${prefix}:${ip}`;
}

/** True when this browser has typed too many wrong passwords. */
export async function loginLocked(): Promise<boolean> {
  return tooManyRequests(await requestKey("dc-login"));
}
