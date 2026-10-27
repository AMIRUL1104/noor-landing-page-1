import { MongoClient } from "mongodb";

// Cache on globalThis so dev hot-reload / serverless warm starts reuse one connection.
const g = globalThis;

function getClient() {
  if (!g.__noorMongo) {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error("MONGODB_URI is not set");
    const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000, maxPoolSize: 5 });
    g.__noorMongo = client.connect().catch((e) => {
      g.__noorMongo = null; // allow a retry on the next request
      throw e;
    });
  }
  return g.__noorMongo;
}

async function ensureIndexes(db) {
  if (g.__noorIndexes) return;
  await Promise.all([
    db.collection("orders").createIndex({ idempotencyKey: 1 }, { unique: true }),
    db.collection("orders").createIndex({ orderId: 1 }, { unique: true }),
    db.collection("orders").createIndex({ "customer.phone": 1, createdAt: -1 }),
    db.collection("orders").createIndex({ createdAt: -1 }),
    db.collection("orders").createIndex({ status: 1, createdAt: -1 }),
    db.collection("rate_limits").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
    // Admin sessions: TTL ইনডেক্স, expiresAt পリオডে অটোমেটিক ডিলিট হবে
    db.collection("admin_sessions").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
  ]);
  g.__noorIndexes = true;
}

export async function getDb() {
  // Test-only hook (used by scripts/test-api.mjs). Never active in production builds.
  if (process.env.NODE_ENV === "test" && g.__NOOR_TEST_DB__) return g.__NOOR_TEST_DB__;
  const client = await getClient();
  const db = client.db(process.env.MONGODB_DB || "noor");
  await ensureIndexes(db);
  return db;
}
