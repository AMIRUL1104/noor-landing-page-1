"use server";

import { getDb } from "../db.js";
import { getSession } from "./auth.js";
import { z } from "zod";

const ORDERS_COLLECTION = "orders";
const PAGE_SIZE = 20;

/** ড্যাশবোর্ডে যাওয়ার আগে সেশন যাচাই। সেশন নেইলে null রিটার্ন করে। */
async function requireSession() {
  const session = await getSession();
  if (!session) return null;
  return session;
}

/** অর্ডার সামরি (অ্যাগ্রিগেশন কুয়েরি) */
export async function getOrderSummary() {
  const session = await requireSession();
  if (!session) return null;

  const db = await getDb();
  const pipeline = [
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
        confirmed: { $sum: { $cond: [{ $eq: ["$status", "confirmed"] }, 1, 0] } },
        delivered: { $sum: { $cond: [{ $eq: ["$status", "delivered"] }, 1, 0] } },
        cancelled: { $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] } },
      },
    },
  ];

  const result = await db.collection(ORDERS_COLLECTION).aggregate(pipeline).toArray();
  if (result.length === 0) {
    return { total: 0, pending: 0, confirmed: 0, delivered: 0, cancelled: 0 };
  }
  return result[0];
}

/** অর্ডার তালিকা (পেজিনেশন, সার্চ, ফিল্টারসহ) */
export async function getOrders({ page = 1, search, status }) {
  const session = await requireSession();
  if (!session) return null;

  const db = await getDb();
  const match = {};

  // স্ট্যাটাস ফিল্টার
  if (status && ["pending", "confirmed", "delivered", "cancelled"].includes(status)) {
    match.status = status;
  }

  // সার্চ: অর্ডার আইডি, ফোন বা نام (ইনপুট এসকেপ করে রেজেক্সে ব্যবহার)
  if (search) {
    const escaped = String(search).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escaped, "i");
    match.$or = [
      { orderId: regex },
      { "customer.phone": regex },
      { "customer.name": regex },
    ];
  }

  const skip = (page - 1) * PAGE_SIZE;

  const [orders, totalCount] = await Promise.all([
    db
      .collection(ORDERS_COLLECTION)
      .find(match)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(PAGE_SIZE)
      .toArray(),
    db.collection(ORDERS_COLLECTION).countDocuments(match),
  ]);

  // Convert MongoDB documents to plain objects for Client Components
  const plainOrders = orders.map((doc) => ({
    ...doc,
    _id: doc._id?.toString?.() || doc._id,
    createdAt: doc.createdAt?.toISOString?.() || doc.createdAt,
    updatedAt: doc.updatedAt?.toISOString?.() || doc.updatedAt,
  }));

  return {
    orders: plainOrders,
    totalCount,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.ceil(totalCount / PAGE_SIZE),
  };
}

/** একটি অর্ডারের পূর্ণ বিবরণ */
export async function getOrderById(orderId) {
  const session = await requireSession();
  if (!session) return null;

  const db = await getDb();
  const doc = await db.collection(ORDERS_COLLECTION).findOne({ orderId });
  if (!doc) return null;
  return {
    ...doc,
    _id: doc._id?.toString?.() || doc._id,
    createdAt: doc.createdAt?.toISOString?.() || doc.createdAt,
    updatedAt: doc.updatedAt?.toISOString?.() || doc.updatedAt,
  };
}

/** অর্ডার স্ট্যাটাস আপডেটের ভ্যালিডেশন স্কিমা */
const statusUpdateSchema = z.strictObject({
  orderId: z.string().min(1),
  status: z.enum(["pending", "confirmed", "delivered", "cancelled"]),
});

/** অর্ডার স্ট্যাটাস আপডেট (সার্ভার অ্যাকশন থেকে কল করা হবে) */
export async function updateOrderStatus(orderId, status) {
  const session = await requireSession();
  if (!session) return { error: "unauthorized" };

  const parsed = statusUpdateSchema.safeParse({ orderId, status });
  if (!parsed.success) {
    return { error: "invalid_input" };
  }

  const db = await getDb();
  const result = await db.collection(ORDERS_COLLECTION).updateOne(
    { orderId },
    {
      $set: { status, updatedAt: new Date() },
      $push: {
        statusHistory: {
          status,
          changedAt: new Date(),
          changedBy: session.adminEmail,
        },
      },
    }
  );

  if (result.matchedCount === 0) {
    return { error: "not_found" };
  }

  return { ok: true };
}