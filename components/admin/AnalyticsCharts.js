"use client";

import { getOrderSummary } from "@/lib/admin/orders";
import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const COLORS = {
  pending: "#ca8a04",
  confirmed: "#2563eb",
  delivered: "#16a34a",
  cancelled: "#dc2626",
  total: "#B89A5A",
};

const STATUS_LABELS = {
  pending: "পেন্ডিং",
  confirmed: "কনফার্মড",
  delivered: "ডেলিভারড",
  cancelled: "ক্যানসেলড",
};

export default function AnalyticsCharts() {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    getOrderSummary().then(setSummary);
  }, []);

  if (!summary) {
    return <div className="bg-paper rounded-sm border border-line p-6"><p className="text-mute">লোড হচ্ছে...</p></div>;
  }

  const pieData = [
    { name: STATUS_LABELS.pending, value: summary.pending || 0, key: "pending" },
    { name: STATUS_LABELS.confirmed, value: summary.confirmed || 0, key: "confirmed" },
    { name: STATUS_LABELS.delivered, value: summary.delivered || 0, key: "delivered" },
    { name: STATUS_LABELS.cancelled, value: summary.cancelled || 0, key: "cancelled" },
  ].filter((d) => d.value > 0);

  const barData = [
    { name: "মোট", value: summary.total || 0 },
    { name: "পেন্ডিং", value: summary.pending || 0 },
    { name: "কনফার্মড", value: summary.confirmed || 0 },
    { name: "ডেলিভারড", value: summary.delivered || 0 },
    { name: "ক্যানসেলড", value: summary.cancelled || 0 },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="bg-paper rounded-sm border border-line p-4">
        <h3 className="mb-3 text-[16px] font-serif font-bold">স্ট্যাটাস বিভাজন</h3>
        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {pieData.map((d) => (
                  <Cell key={d.key} fill={COLORS[d.key]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-paper rounded-sm border border-line p-4">
        <h3 className="mb-3 text-[16px] font-serif font-bold">অর্ডার সারাংশ</h3>
        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill={COLORS.total} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
