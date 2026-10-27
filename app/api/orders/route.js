import { NextResponse } from "next/server";
import { randomInt } from "node:crypto";
import { getDb } from "../../../lib/db.js";
import { orderSchema } from "../../../lib/validation.js";
import { calcTotals } from "../../../lib/products.js";
import { hit, hashKey } from "../../../lib/rateLimit.js";
import { notifyOrder } from "../../../lib/telegram.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 4096;
const DUPLICATE_WINDOW_MS = 2 * 60 * 1000;
const ID_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

const json = (body, status = 200, headers = {}) =>
  NextResponse.json(body, { status, headers: { "Cache-Control": "no-store", ...headers } });

const newOrderId = () =>
  "NR-" + Array.from({ length: 6 }, () => ID_CHARS[randomInt(ID_CHARS.length)]).join("");

/** Extra layer only (not a replacement for validation / rate limiting). */
function isSameOrigin(req) {
  const site = req.headers.get("sec-fetch-site");
  if (site && site !== "same-origin" && site !== "none") return false;
  const origin = req.headers.get("origin");
  if (!origin) return true; // browsers always send Origin on cross-site POST
  try {
    const o = new URL(origin);
    const allowed = new Set([req.headers.get("host")]);
    if (process.env.SITE_URL) allowed.add(new URL(process.env.SITE_URL).host);
    return allowed.has(o.host);
  } catch {
    return false;
  }
}

function clientIp(req) {
  const xff = req.headers.get("x-forwarded-for");
  return (xff ? xff.split(",")[0] : req.headers.get("x-real-ip") || "unknown").trim();
}

const ok = (o, status = 200) =>
  json({ ok: true, orderId: o.orderId, total: o.pricing.total, shipping: o.pricing.shipping }, status);

export async function POST(req) {
  try {
    if (!isSameOrigin(req)) return json({ ok: false, code: "FORBIDDEN" }, 403);
    if (!(req.headers.get("content-type") || "").toLowerCase().startsWith("application/json"))
      return json({ ok: false, code: "UNSUPPORTED" }, 415);
    if (Number(req.headers.get("content-length") || 0) > MAX_BODY_BYTES)
      return json({ ok: false, code: "TOO_LARGE" }, 413);

    const raw = await req.text();
    if (Buffer.byteLength(raw) > MAX_BODY_BYTES) return json({ ok: false, code: "TOO_LARGE" }, 413);

    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      return json({ ok: false, code: "INVALID", fields: [] }, 400);
    }

    const parsed = orderSchema.safeParse(data);
    if (!parsed.success) {
      const fields = [...new Set(parsed.error.issues.map((i) => String(i.path[0] ?? "")).filter(Boolean))];
      return json({ ok: false, code: "INVALID", fields }, 400);
    }
    const input = parsed.data;

    // Honeypot: bots fill hidden fields. Pretend success, store nothing.
    if (input.website) {
      return json({ ok: true, orderId: newOrderId(), total: calcTotals(input.quantity).total, shipping: 0 }, 201);
    }

    const db = await getDb();
    const orders = db.collection("orders");

    // Same idempotency key (double click / retry) -> return the original order.
    const same = await orders.findOne({ idempotencyKey: input.idempotencyKey });
    if (same) return ok(same);

    // Rate limits: per IP and per phone number.
    const ipKey = hashKey("ip:" + clientIp(req));
    const phoneKey = hashKey("ph:" + input.phone);
    const [byIp, byPhone] = [await hit(ipKey, 5, 600), await hit(phoneKey, 3, 3600)];
    if (!byIp.ok || !byPhone.ok) {
      const retryAfter = Math.max(byIp.ok ? 0 : byIp.retryAfter, byPhone.ok ? 0 : byPhone.retryAfter);
      return json({ ok: false, code: "RATE_LIMITED" }, 429, { "Retry-After": String(retryAfter) });
    }

    // Same phone + same item within 2 minutes -> treat as duplicate of the earlier order.
    const dup = await orders.findOne({
      "customer.phone": input.phone,
      "item.colorId": input.colorId,
      "item.sizeId": input.sizeId,
      "item.quantity": input.quantity,
      createdAt: { $gt: new Date(Date.now() - DUPLICATE_WINDOW_MS) },
    });
    if (dup) return ok(dup);

    // Price, delivery and total are ALWAYS computed here, never taken from the browser.
    const pricing = { ...calcTotals(input.quantity), currency: "BDT" };

    let order;
    for (let attempt = 0; attempt < 4 && !order; attempt++) {
      const doc = {
        orderId: newOrderId(),
        status: "new",
        item: { colorId: input.colorId, sizeId: input.sizeId, quantity: input.quantity },
        pricing,
        customer: { name: input.name, phone: input.phone, address: input.address },
        lang: input.lang,
        idempotencyKey: input.idempotencyKey,
        ipHash: ipKey,
        telegram: { status: "pending", attempts: 0 },
        createdAt: new Date(),
      };
      try {
        await orders.insertOne(doc);
        order = doc;
      } catch (e) {
        if (e?.code !== 11000) throw e;
        const existing = await orders.findOne({ idempotencyKey: input.idempotencyKey });
        if (existing) return ok(existing); // lost a race with an identical request
        // otherwise an orderId collision: loop and generate a new id
      }
    }
    if (!order) return json({ ok: false, code: "SERVER_ERROR" }, 500);

    // The order is already saved. A Telegram failure must never lose it or fail the request.
    try {
      const t = await notifyOrder(order);
      await orders.updateOne(
        { orderId: order.orderId },
        { $set: { "telegram.status": t.status, "telegram.attempts": t.attempts, "telegram.updatedAt": new Date() } },
      );
    } catch {
      /* ignore: order stays saved with telegram.status = "pending" */
    }

    return ok(order, 201);
  } catch (e) {
    // Log only the error type — never request data, secrets, or stack traces — and return a generic message.
    console.error("[orders] unexpected error:", e?.name || "Error");
    return json({ ok: false, code: "SERVER_ERROR" }, 500);
  }
}

// No GET/OPTIONS handlers: other methods get 405 automatically; no CORS headers are ever sent.
