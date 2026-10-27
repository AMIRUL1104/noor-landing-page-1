import { createHash } from "node:crypto";
import { getDb } from "../db.js";

const SESSION_COLLECTION = "admin_sessions";
const SESSION_TTL_MS = 72 * 60 * 60 * 1000; // 72 ঘণ্টা

/** সেশন টোকেনের SHA-256 হ্যাশ তৈরি করে। */
export function hashToken(token) {
  return createHash("sha256").update(token).digest("hex");
}

/** নতুন সেশন তৈরি করে। শুধুমাত্র একবার দৃশ্যমান প্লেইন টোকেন রিটার্ন করে। */
export async function createSession(adminEmail) {
  const token = crypto.randomUUID().toString("hex");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  const db = await getDb();
  await db.collection(SESSION_COLLECTION).insertOne({
    tokenHash,
    adminEmail,
    expiresAt,
    createdAt: new Date(),
  });
  return { token, expiresAt };
}

/** সেশন টোকেন যাচাই করে। সফল হলে { adminEmail } রিটার্ন করে,否则 null। */
export async function validateSession(token) {
  if (!token) return null;
  const tokenHash = hashToken(token);
  const db = await getDb();
  const session = await db.collection(SESSION_COLLECTION).findOne({
    tokenHash,
    expiresAt: { $gt: new Date() },
  });
  if (!session) return null;
  return { adminEmail: session.adminEmail };
}

/** টোকেন দিয়ে সেশন মুছে ফেলা (লগআউট)। */
export async function deleteSession(token) {
  if (!token) return;
  const tokenHash = hashToken(token);
  const db = await getDb();
  await db.collection(SESSION_COLLECTION).deleteOne({ tokenHash });
}

/** একটি অ্যাডমিন ইমেইলের সব সেশন মুছে ফেলা (ক্রেডেনশিয়াল বদলে পুরোনো সেশন নিষ্ক্রিয়)। */
export async function deleteSessionsForAdmin(adminEmail) {
  const db = await getDb();
  await db.collection(SESSION_COLLECTION).deleteMany({ adminEmail });
}
