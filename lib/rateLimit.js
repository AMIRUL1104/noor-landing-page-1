import { createHash } from "node:crypto";
import { getDb } from "./db.js";

/** Salted hash so raw IPs / phone numbers are not stored in the rate-limit collection. */
export function hashKey(value) {
  return createHash("sha256")
    .update(`${process.env.RATE_LIMIT_SALT || "dev-salt"}:${value}`)
    .digest("hex")
    .slice(0, 32);
}

/**
 * Fixed-window counter stored in MongoDB (works across serverless instances).
 * Returns { ok, retryAfter } — ok is false once `limit` is exceeded within the window.
 */
export async function hit(key, limit, windowSec) {
  const db = await getDb();
  const now = Date.now();
  const bucket = Math.floor(now / (windowSec * 1000));
  const resetAt = (bucket + 1) * windowSec * 1000;
  const doc = await db.collection("rate_limits").findOneAndUpdate(
    { _id: `${key}:${bucket}` },
    { $inc: { count: 1 }, $setOnInsert: { expiresAt: new Date(resetAt + 60_000) } },
    { upsert: true, returnDocument: "after" },
  );
  const count = doc?.count ?? doc?.value?.count ?? 1;
  return { ok: count <= limit, retryAfter: Math.max(1, Math.ceil((resetAt - now) / 1000)) };
}
