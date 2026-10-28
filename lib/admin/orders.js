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

// ৬৪ জেলার তালিকা (বাংলা)
const BANGLADESH_DISTRICTS = [
  "বাগেরহাট", "বান্দরবান", "বরগুনা", "বরিশাল", "ভোলা", "বগুড়া",
  "ব্রাহ্মণবাড়িয়া", "চাঁদপুর", "চাঁপাইনবাবগঞ্জ", "চট্টগ্রাম", "চুয়াডাঙ্গা",
  "কুমিল্লা", "কক্সবাজার", "ঢাকা", "দিনাজপুর", "ফরিদপুর", "ফেনী",
  "গাইবান্ধা", "গাজীপুর", "গোপালগঞ্জ", "হবিগঞ্জ", "জামালপুর", "যশোর",
  "ঝালকাঠি", "ঝিনাইদহ", "জয়পুরহাট", "খাগড়াছড়ি", "খুলনা", "কিশোরগঞ্জ",
  "কুড়িগ্রাম", "কুষ্টিয়া", "লক্ষ্মীপুর", "লালমনিরহাট", "মাদারীপুর",
  "মাগুরা", "মানিকগঞ্জ", "মেহেরপুর", "মৌলভীবাজার", "মুন্সিগঞ্জ",
  "ময়মনসিংহ", "নওগাঁ", "নড়াইল", "নারায়ণগঞ্জ", "নরসিংদী", "নাটোর",
  "নেত্রকোণা", "নীলফামারী", "নোয়াখালী", "পাবনা", "পঞ্চগড়", "পটুয়াখালী",
  "পিরোজপুর", "রাজবাড়ী", "রাজশাহী", "রংপুর", "সাতক্ষীরা", "শরীয়তপুর",
  "শেরপুর", "সিরাজগঞ্জ", "সুনামগঞ্জ", "সিলেট", "টাঙ্গাইল", "ঠাকুরগাঁও",
];

// অ্যাড্রেস টেক্সট থেকে জেলা খুঁজে বের করা
function detectDistrict(address) {
  if (!address || typeof address !== "string") return null;
  // দীর্ঘ নাম আগে ম্যাচ করাতে সাজানো
  const sorted = [...BANGLADESH_DISTRICTS].sort((a, b) => b.length - a.length);
  for (const d of sorted) {
    if (address.includes(d)) return d;
  }
  return null;
}

/** ওভারভিউ পেজের জন্য বিস্তারিত অ্যানালিটিক্স */
export async function getOverviewAnalytics() {
  const session = await requireSession();
  if (!session) return null;

  const db = await getDb();
  const now = new Date();
  const yearStart = new Date(now.getFullYear(), 0, 1);
  const yearEnd = new Date(now.getFullYear() + 1, 0, 1);
  const twelveWeeksAgo = new Date(now.getTime() - 12 * 7 * 24 * 60 * 60 * 1000);

  // ১. ফিনান্সিয়াল সামারি
  const financialAgg = await db
    .collection(ORDERS_COLLECTION)
    .aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: {
              $cond: [
                { $eq: ["$status", "delivered"] },
                { $ifNull: ["$pricing.total", 0] },
                0,
              ],
            },
          },
          totalDeliveryCosts: { $sum: { $ifNull: ["$pricing.shipping", 0] } },
          totalOrders: { $sum: 1 },
          deliveredOrders: {
            $sum: { $cond: [{ $eq: ["$status", "delivered"] }, 1, 0] },
          },
        },
      },
    ])
    .toArray();

  const financial = financialAgg[0] || {
    totalRevenue: 0,
    totalDeliveryCosts: 0,
    totalOrders: 0,
    deliveredOrders: 0,
  };
  financial.netSales = (financial.totalRevenue || 0) - (financial.totalDeliveryCosts || 0);

  // ২. মাসিক ব্রেকডাউন (বর্তমান বছর)
  const monthlyAgg = await db
    .collection(ORDERS_COLLECTION)
    .aggregate([
      { $match: { createdAt: { $gte: yearStart, $lt: yearEnd } } },
      {
        $group: {
          _id: { $month: "$createdAt" },
          amount: { $sum: { $ifNull: ["$pricing.total", 0] } },
        },
      },
    ])
    .toArray();

  const monthNames = ["জানু", "ফেব", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগ", "সেপ", "অক্টো", "নভে", "ডিসে"];
  const monthlyMap = new Map(monthlyAgg.map((m) => [m._id, m.amount]));
  const monthly = monthNames.map((name, i) => ({
    month: name,
    amount: monthlyMap.get(i + 1) || 0,
  }));

  // ৩. সাপ্তাহিক ব্রেকডাউন (গত ১২ সপ্তাহ)
  const weeklyAgg = await db
    .collection(ORDERS_COLLECTION)
    .aggregate([
      { $match: { createdAt: { $gte: twelveWeeksAgo } } },
      {
        $group: {
          _id: { year: { $isoWeekYear: "$createdAt" }, week: { $isoWeek: "$createdAt" } },
          amount: { $sum: { $ifNull: ["$pricing.total", 0] } },
        },
      },
      { $sort: { "_id.year": 1, "_id.week": 1 } },
    ])
    .toArray();

  const weekly = weeklyAgg.map((w) => ({
    week: `W${w._id.week}`,
    amount: w.amount,
  }));

  // ৪. কালার/ফ্যাব্রিক বিক্রয়
  const colorAgg = await db
    .collection(ORDERS_COLLECTION)
    .aggregate([
      {
        $group: {
          _id: "$item.colorId",
          units: { $sum: { $ifNull: ["$item.quantity", 0] } },
        },
      },
      { $sort: { units: -1 } },
    ])
    .toArray();

  const colors = colorAgg.map((c) => ({
    color: c._id || "অজানা",
    units: c.units || 0,
  }));

  // ৫. জেলাভিত্তিক ট্রানজ্যাকশন (JS regex/parse)
  const allOrders = await db
    .collection(ORDERS_COLLECTION)
    .find({}, { projection: { "customer.address": 1, "pricing.total": 1 } })
    .toArray();

  const districtMap = new Map();
  for (const o of allOrders) {
    const district = detectDistrict(o?.customer?.address);
    if (!district) continue;
    const amount = o?.pricing?.total || 0;
    districtMap.set(district, (districtMap.get(district) || 0) + amount);
  }

  const districts = [...districtMap.entries()]
    .map(([district, amount]) => ({ district, amount }))
    .filter((d) => d.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  return {
    financial,
    monthly,
    weekly,
    colors,
    districts,
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