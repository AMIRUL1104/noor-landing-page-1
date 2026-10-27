import { PRODUCT } from "./products.js";

const TIMEOUT_MS = 5000;

function buildText(o) {
  const color = PRODUCT.colors.find((c) => c.id === o.item.colorId);
  const size = PRODUCT.sizes.find((s) => s.id === o.item.sizeId);
  return [
    `🧥 নতুন অর্ডার ${o.orderId}`,
    `রং: ${color?.bn ?? o.item.colorId} (${color?.en ?? ""})`,
    `সাইজ: ${o.item.sizeId} (${size?.num ?? ""})`,
    `পরিমাণ: ${o.item.quantity}টি`,
    `হুডি: ৳${o.pricing.subtotal}`,
    `ডেলিভারি চার্জ: ${o.pricing.shipping ? "৳" + o.pricing.shipping : "ফ্রি"}`,
    `মোট: ৳${o.pricing.total}`,
    `নাম: ${o.customer.name}`,
    `মোবাইল: ${o.customer.phone}`,
    `ঠিকানা: ${o.customer.address}`,
  ].join("\n").slice(0, 4000);
}

async function send(token, chatId, text) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    // Plain text (no parse_mode) so customer input can never be interpreted as markup.
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
      signal: ctrl.signal,
      cache: "no-store",
    });
    return { ok: res.ok, status: res.status };
  } catch {
    return { ok: false, status: 0 };
  } finally {
    clearTimeout(timer);
  }
}

/** Never throws. Returns { status: "sent" | "failed" | "skipped", attempts }. */
export async function notifyOrder(order) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return { status: "skipped", attempts: 0 };
  const text = buildText(order);
  let r = await send(token, chatId, text);
  let attempts = 1;
  if (!r.ok && (r.status === 0 || r.status === 429 || r.status >= 500)) {
    await new Promise((res) => setTimeout(res, 600));
    r = await send(token, chatId, text);
    attempts = 2;
  }
  return { status: r.ok ? "sent" : "failed", attempts };
}
