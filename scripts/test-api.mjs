// Runs the real route handler against an in-memory fake MongoDB and a stubbed Telegram API.
// Usage: npm test        (needs no database, no network, no real credentials)
import { register } from "node:module";
// Plain Node needs the file extension that Next's bundler adds automatically.
register("data:text/javascript," + encodeURIComponent(
  "export async function resolve(s,c,n){ return n(s==='next/server'?'next/server.js':s,c) }"));

process.env.NODE_ENV = "test";
process.env.RATE_LIMIT_SALT = "test-salt";
process.env.SITE_URL = "https://noor.example";
process.env.TELEGRAM_BOT_TOKEN = "123:TEST";
process.env.TELEGRAM_CHAT_ID = "999";

const get = (o, path) => path.split(".").reduce((a, k) => a?.[k], o);
const match = (d, f) =>
  Object.entries(f).every(([k, v]) => {
    const x = get(d, k);
    return v && typeof v === "object" && "$gt" in v ? x > v.$gt : x === v;
  });
class Col {
  constructor(name) { this.name = name; this.docs = []; }
  async findOne(f) { return this.docs.find((d) => match(d, f)) ?? null; }
  async insertOne(doc) {
    if (this.name === "orders" && this.docs.some((d) => d.idempotencyKey === doc.idempotencyKey || d.orderId === doc.orderId))
      throw Object.assign(new Error("dup"), { code: 11000 });
    this.docs.push(doc);
  }
  async updateOne(f, u) {
    const d = await this.findOne(f);
    if (d) for (const [k, v] of Object.entries(u.$set || {})) {
      const parts = k.split("."); let o = d;
      parts.slice(0, -1).forEach((p) => (o = o[p])); o[parts.at(-1)] = v;
    }
  }
  async findOneAndUpdate(f, u) {
    let d = await this.findOne(f);
    if (!d) { d = { _id: f._id, count: 0, ...(u.$setOnInsert || {}) }; this.docs.push(d); }
    d.count += u.$inc.count;
    return d;
  }
}
const store = {};
const fakeDb = { collection: (n) => (store[n] ??= new Col(n)) };
globalThis.__NOOR_TEST_DB__ = fakeDb;

let tg = { calls: 0, status: 200, throws: false };
globalThis.fetch = async (url) => {
  if (!String(url).startsWith("https://api.telegram.org/")) throw new Error("unexpected fetch");
  tg.calls++;
  if (tg.throws) throw new Error("network");
  return { ok: tg.status < 400, status: tg.status };
};

const { POST } = await import("../app/api/orders/route.js");
const orders = () => store.orders?.docs ?? [];
let n = 0, fails = 0;
const check = (name, cond, extra = "") => { n++; if (!cond) fails++; console.log(`${cond ? "PASS" : "FAIL"}  ${name}${cond ? "" : "  " + extra}`); };

let seq = 0;
const base = (o = {}) => ({
  colorId: "black", sizeId: "M", quantity: 1, name: "Rahim Uddin", phone: "01712345678",
  address: "Debiganj, Panchagarh", lang: "bn", idempotencyKey: crypto.randomUUID(), website: "", ...o,
});
const send = async (body, { ip = `10.0.0.${++seq}`, headers = {}, raw } = {}) => {
  const req = new Request("https://noor.example/api/orders", {
    method: "POST",
    headers: { "content-type": "application/json", host: "noor.example", "x-forwarded-for": ip, ...headers },
    body: raw ?? JSON.stringify(body),
  });
  const res = await POST(req);
  return { status: res.status, body: await res.json(), headers: res.headers };
};
const phone = () => "017" + String(10000000 + ++seq);

// 1. happy path + server-side pricing
let r = await send(base({ phone: phone() }));
check("valid order -> 201", r.status === 201 && r.body.ok && /^NR-[A-Z2-9]{6}$/.test(r.body.orderId));
check("1 hoodie total = 550 + 130 = 680", r.body.total === 680 && r.body.shipping === 130);
check("telegram notified once, status saved as sent", tg.calls === 1 && orders().at(-1).telegram.status === "sent");
r = await send(base({ phone: phone(), quantity: 2 }));
check("2 hoodies -> free delivery, total 1100", r.body.total === 1100 && r.body.shipping === 0);

// 2. never trusts client price fields
r = await send({ ...base({ phone: phone() }), price: 1, total: 1, shipping: 0 });
check("extra price/total/shipping fields rejected", r.status === 400 && r.body.code === "INVALID");

// 3. validation
r = await send(base({ phone: "12345" })); check("bad phone -> 400 (fields: phone)", r.status === 400 && r.body.fields.includes("phone"));
for (const q of [0, 21, 999, 1.5, "2", null]) {
  r = await send(base({ phone: phone(), quantity: q })); check(`quantity ${JSON.stringify(q)} rejected`, r.status === 400 && r.body.fields.includes("quantity"));
}
r = await send(base({ colorId: "pink" })); check("unknown color rejected", r.status === 400);
r = await send(base({ sizeId: "XXL" })); check("unknown size rejected", r.status === 400);
r = await send(base({ name: { $ne: 1 } })); check("object instead of string (NoSQL operator) rejected", r.status === 400);
r = await send(base({ idempotencyKey: "abc" })); check("bad idempotency key rejected", r.status === 400);
r = await send(null, { raw: "{not json" }); check("malformed JSON -> 400", r.status === 400);
r = await send(base(), { headers: { "content-type": "text/plain" } }); check("wrong content-type -> 415", r.status === 415);
r = await send(base({ address: "x".repeat(6000) })); check("oversized body -> 413", r.status === 413);

// 4. origin checks
r = await send(base(), { headers: { origin: "https://evil.example" } }); check("cross-origin request -> 403", r.status === 403);
r = await send(base(), { headers: { "sec-fetch-site": "cross-site" } }); check("sec-fetch-site cross-site -> 403", r.status === 403);
r = await send(base({ phone: phone() }), { headers: { origin: "https://noor.example" } }); check("same-origin request allowed", r.status === 201);

// 5. normalisation + cleaning
const p = phone();
r = await send(base({ phone: "+88" + p, name: "  Karim\u0000  \n Mia ", address: "Line1\nLine2 <b>Dhaka</b>" }));
const saved = orders().find((o) => o.orderId === r.body.orderId);
check("phone +88 prefix normalised", saved.customer.phone === p);
check("control chars / newlines collapsed in name & address", saved.customer.name === "Karim Mia" && !/[\n\u0000]/.test(saved.customer.address));
r = await send(base({ phone: "০১৭১২৩৪৫৬৭৮" })); check("Bangla-digit phone accepted & normalised", r.status === 201 && orders().at(-1).customer.phone === "01712345678");

// 6. honeypot
const before = orders().length;
r = await send(base({ phone: phone(), website: "http://spam.example" }));
check("honeypot: fake success, nothing stored", r.status === 201 && orders().length === before);

// 7. idempotency + duplicate order protection
const key = crypto.randomUUID(), ph = phone();
const a = await send(base({ phone: ph, idempotencyKey: key })), calls = tg.calls, cnt = orders().length;
const b = await send(base({ phone: ph, idempotencyKey: key }));
check("same idempotency key -> same order, no new row, no 2nd telegram", a.body.orderId === b.body.orderId && orders().length === cnt && tg.calls === calls);
const c = await send(base({ phone: ph }));
check("same phone+item within 2 min (new key) -> existing order returned", c.body.orderId === a.body.orderId && orders().length === cnt);

// 8. rate limiting
const ip = "203.0.113.9"; let last;
for (let i = 0; i < 6; i++) last = await send(base({ phone: phone() }), { ip });
check("6th order from one IP within 10 min -> 429 + Retry-After", last.status === 429 && Number(last.headers.get("retry-after")) > 0);
const ph2 = phone(); let l2;
for (let i = 0; i < 4; i++) l2 = await send(base({ phone: ph2, sizeId: ["M", "L", "XL", "M"][i], quantity: i + 1 }));
check("4th order for one phone within 1 hour -> 429", l2.status === 429);

// 9. telegram failures never lose the order
tg.status = 500;
r = await send(base({ phone: phone() }));
check("Telegram HTTP 500 -> order still saved, 201", r.status === 201 && orders().at(-1).telegram.status === "failed" && orders().at(-1).telegram.attempts === 2);
tg.status = 200; tg.throws = true;
r = await send(base({ phone: phone() }));
check("Telegram network error -> order still saved, 201", r.status === 201 && orders().at(-1).telegram.status === "failed");
tg.throws = false;
const saveTok = process.env.TELEGRAM_BOT_TOKEN; delete process.env.TELEGRAM_BOT_TOKEN;
r = await send(base({ phone: phone() }));
check("Telegram not configured -> order still saved", r.status === 201 && orders().at(-1).telegram.status === "skipped");
process.env.TELEGRAM_BOT_TOKEN = saveTok;

// 10. internal errors do not leak details
globalThis.__NOOR_TEST_DB__ = { collection() { throw new Error("mongodb+srv://user:SECRETPASS@cluster/db failed"); } };
const origErr = console.error; console.error = () => {};
r = await send(base({ phone: phone() }));
console.error = origErr;
check("DB failure -> generic 500, no secrets/stack in body", r.status === 500 && r.body.code === "SERVER_ERROR" && !JSON.stringify(r.body).includes("SECRETPASS") && Object.keys(r.body).length === 2);

console.log(`\n${n - fails}/${n} passed`);
process.exit(fails ? 1 : 0);
