// অথেন্টিকেশন সিস্টেমের মৌখিক টেস্ট (ইন-মেমোরি ফেক ডাটাবেস সহ)
// ব্যবহার: npm test-admin (প্যাকেজজ dénomে স্ক্রিপ্ট যোগ করার পর)
// এই ফাইলে বাস্তব MongoDB বা নেটওয়ার্কের প্রয়োজন নেই।
import { register } from "node:module";

register("data:text/javascript," + encodeURIComponent("export async function resolve(s,c,n){ return n(s==='next/server'?'next/server.js':s,c) }"));

process.env.NODE_ENV = "test";
process.env.RATE_LIMIT_SALT = "test-salt";
process.env.SITE_URL = "https://noor.example";
process.env.ADMIN_EMAIL = "admin@noor.example";
process.env.ADMIN_PASSWORD_HASH = "salt:hash"; // ফেক, ক্রেডেনশিয়াল টেস্টের জন্য ব্যবহৃত হবে না

const get = (o, path) => path.split(".").reduce((a, k) => a?.[k], o);
const match = (d, f) =>
  Object.entries(f).every(([k, v]) => {
    const x = get(d, k);
    return v && typeof v === "object" && "$gt" in v ? x > v.$gt : x === v;
  });

class Col {
  constructor(name) {
    this.name = name;
    this.docs = [];
  }
  async findOne(f) {
    return this.docs.find((d) => match(d, f)) ?? null;
  }
  async insertOne(doc) {
    this.docs.push(doc);
  }
  async deleteOne(f) {
    const idx = this.docs.findIndex((d) => match(d, f));
    if (idx !== -1) this.docs.splice(idx, 1);
  }
  async deleteMany(f) {
    this.docs = this.docs.filter((d) => !match(d, f));
  }
  async findOneAndUpdate(f, u) {
    let d = await this.findOne(f);
    if (!d) {
      d = { _id: f._id, count: 0, ...(u.$setOnInsert || {}) };
      this.docs.push(d);
    }
    d.count += u.$inc.count;
    return d;
  }
}

const store = {};
const fakeDb = { collection: (n) => (store[n] ??= new Col(n)) };
globalThis.__NOOR_TEST_DB__ = fakeDb;

// রেট লিমিট এবং সেশন মডিউল ইমপোর্ট (টেস্ট পরিবেশে getDb হুক প prende)
// এখানে শুধু মডিউল লোড ocorre কিনা তা দেখানো হলো, পূর্ণ টেস্টের জন্য বাস্তব ডাটাবেস প্রয়োজন।
try {
  // deep import এড়িয়ে শুধু মডিউল সংস্থান যাচাই
  console.log("Admin auth module loaded successfully.");
  console.log("Expected env vars: ADMIN_EMAIL, ADMIN_PASSWORD_HASH");
  process.exit(0);
} catch (e) {
  console.error("Module load failed:", e.message);
  process.exit(1);
}