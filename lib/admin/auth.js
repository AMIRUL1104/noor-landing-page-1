"use server";

import { createHash, timingSafeEqual, scrypt } from "node:crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { hit, hashKey } from "../rateLimit.js";
import {
  createSession,
  validateSession,
  deleteSession,
  deleteSessionsForAdmin,
} from "./session.js";

const LOGIN_RATE_LIMIT_IP = 5; // প্রতি IP-তে ১৫ মিনিটে ৫টি চেষ্টা
const LOGIN_RATE_LIMIT_WINDOW_IP = 15 * 60;
const LOGIN_RATE_LIMIT_GLOBAL = 30; // সব IP মিলিয়ে ঘণ্টায় ৩০টি চেষ্টা
const LOGIN_RATE_LIMIT_WINDOW_GLOBAL = 60 * 60;

const loginSchema = z.strictObject({
  email: z.string().email().max(254),
  password: z.string().min(1).max(128),
});

/** কনস্ট্যান্ট-টাইম স্ট্রিং তুলনা (টাইমিং অ্যাটাক প্রতিরোধ)। */
function constantTimeEqual(a, b) {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/** অ্যাডমিন ক্রেডেনশিয়াল যাচাই (.env থেকে)। সফল হলে { ok: true } রিটার্ন করে। */
export async function verifyCredentials(email, password) {
  const expectedEmail = process.env.ADMIN_EMAIL;
  const expectedHash = process.env.ADMIN_PASSWORD_HASH;
  if (!expectedEmail || !expectedHash) {
    return { ok: false, reason: "misconfigured" };
  }

  // ইমেইল কনস্ট্যান্ট-টাইমে তুলনা
  const emailOk = constantTimeEqual(email, expectedEmail);

  // পাসওয়ার্ড: env-তে সেভ করা scrypt হ্যাশ (salt:hex:derivedHex, কোনো $ চিহ্ন নেই)
  const parts = String(expectedHash).split(":");
  if (parts.length !== 2) return { ok: false, reason: "misconfigured" };
  const [saltHex, hashHex] = parts;
  let passwordOk = false;
  try {
    const salt = Buffer.from(saltHex, "hex");
    const derived = await new Promise((resolve, reject) => {
      scrypt(password, salt, 64, (err, derivedKey) => {
        if (err) reject(err);
        else resolve(derivedKey);
      });
    });
    const expectedKey = Buffer.from(hashHex, "hex");
    passwordOk =
      derived.length === expectedKey.length && timingSafeEqual(derived, expectedKey);
  } catch {
    passwordOk = false;
  }

  if (!emailOk || !passwordOk) {
    return { ok: false, reason: "credentials" };
  }
  return { ok: true };
}

/** লগইন সার্ভার অ্যাকশন (ফর্ম ডেটা নেয়, কুকি সেট করে, রিডাইরেক্ট করে)। */
export async function login(formData) {
  if (!formData || typeof formData.get !== "function") {
    redirect("/admin/login?error=invalid_request");
  }
  const rawEmail = formData.get("email");
  const rawPassword = formData.get("password");

  const parsed = loginSchema.safeParse({
    email: typeof rawEmail === "string" ? rawEmail : "",
    password: typeof rawPassword === "string" ? rawPassword : "",
  });
  if (!parsed.success) {
    redirect("/admin/login?error=invalid_credentials");
  }
  const { email: emailValue, password: passwordValue } = parsed.data;

  // রেট লিমিট: IP-ভিত্তিক এবং গ্লোবাল
  const h = await headers();
  const xff = h.get("x-forwarded-for");
  const ip = (xff ? xff.split(",")[0] : "unknown").trim();

  const ipKey = hashKey(`login-ip:${ip}`);
  const globalKey = hashKey("login-global");
  const [byIp, byGlobal] = await Promise.all([
    hit(ipKey, LOGIN_RATE_LIMIT_IP, LOGIN_RATE_LIMIT_WINDOW_IP),
    hit(globalKey, LOGIN_RATE_LIMIT_GLOBAL, LOGIN_RATE_LIMIT_WINDOW_GLOBAL),
  ]);
  if (!byIp.ok || !byGlobal.ok) {
    redirect("/admin/login?error=rate_limited");
  }

  const result = await verifyCredentials(emailValue, passwordValue);
  if (!result.ok) {
    redirect("/admin/login?error=invalid_credentials");
  }

  // সফল → নতুন সেশন টোকেন তৈরি এবং ডাটাবেসে সংরক্ষণ
  const { token } = await createSession(emailValue);

  // কুকি সেট করা (সার্ভার থেকে)
  const cookieStore = await cookies();
  const isProduction = process.env.NODE_ENV === "production";
  const cookieName = isProduction ? "__Host-admin_session" : "admin_session";
  cookieStore.set(cookieName, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    path: "/",
    maxAge: 72 * 60 * 60, // ৭২ ঘণ্টা
  });

  redirect("/admin");
}

/** লগআউট সার্ভার অ্যাকশন (ডাটাবেস থেকে সেশন মুছে, কুকি মুছে, রিডাইরেক্ট করে)। */
export async function logout() {
  const cookieStore = await cookies();
  const token =
    cookieStore.get("admin_session")?.value ||
    cookieStore.get("__Host-admin_session")?.value;

  if (token) {
    await deleteSession(token);
  }

  cookieStore.delete("admin_session");
  cookieStore.delete("__Host-admin_session");

  redirect("/admin/login");
}

/** বর্তমান সেশন প վեր গ埃尔 (মiddleware ও ডাটা অ্যাক্সেস লেয়ারের জন্য)। সেশন নেইলে null। */
export async function getSession() {
  const cookieStore = await cookies();
  const token =
    cookieStore.get("admin_session")?.value ||
    cookieStore.get("__Host-admin_session")?.value;
  if (!token) return null;
  return validateSession(token);
}