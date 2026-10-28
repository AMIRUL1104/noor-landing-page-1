"use client";

import { getOrderSummary, getOverviewAnalytics } from "@/lib/admin/orders";
import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";

const COLOR_FILL = {
  Black: "#111111",
  White: "#e5e5e5",
  Navy: "#1e3a8a",
  Maroon: "#7f1d1d",
  Brown: "#78350f",
  "Forest Green": "#14532d",
};

const STATUS_COLORS = {
  pending: "#ca8a04",
  confirmed: "#2563eb",
  delivered: "#16a34a",
  cancelled: "#dc2626",
};

function money(n) {
  return `৳${Number(n || 0).toLocaleString("en-US")}`;
}

export default function AnalyticsCharts() {
  const [summary, setSummary] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    getOrderSummary().then(setSummary);
    getOverviewAnalytics().then(setAnalytics);
  }, []);

  if (!summary || !analytics) {
    return (
      <div className="bg-paper rounded-sm border border-line p-6">
        <p className="text-mute">লোড হচ্ছে...</p>
      </div>
    );
  }

  const { financial, monthly, weekly, colors, districts } = analytics;

  const colorPieData = colors.map((c) => ({
    name: c.color,
    value: c.units,
  }));

  const statusPieData = [
    { name: "পেন্ডিং", value: summary.pending || 0, key: "pending" },
    { name: "কনফার্মড", value: summary.confirmed || 0, key: "confirmed" },
    { name: "ডেলিভারড", value: summary.delivered || 0, key: "delivered" },
    { name: "ক্যানসেলড", value: summary.cancelled || 0, key: "cancelled" },
  ].filter((d) => d.value > 0);

  const summaryBarData = [
    { name: "মোট", value: summary.total || 0 },
    { name: "পেন্ডিং", value: summary.pending || 0 },
    { name: "কনফার্মড", value: summary.confirmed || 0 },
    { name: "ডেলিভারড", value: summary.delivered || 0 },
    { name: "ক্যানসেলড", value: summary.cancelled || 0 },
  ];

  return (
    <div className="space-y-6">
      {/* পূর্ববর্তী অ্যানালিটিক্স */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="bg-paper rounded-sm border border-line p-4">
          <h3 className="mb-3 text-[16px] font-serif font-bold">স্ট্যাটাস বিভাজন</h3>
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusPieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {statusPieData.map((d) => (
                    <Cell key={d.key} fill={STATUS_COLORS[d.key]} />
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
              <BarChart data={summaryBarData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#B89A5A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ফিনান্সিয়াল স্ট্যাটস */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        <div className="bg-paper rounded-sm border border-line p-3 md:p-4">
          <p className="text-[12px] text-mute font-semibold mb-1">মোট রেভিনিউ (ডেলিভার্ড)</p>
          <p className="text-[18px] md:text-[22px] font-serif font-bold text-green-700">{money(financial.totalRevenue)}</p>
        </div>
        <div className="bg-paper rounded-sm border border-line p-3 md:p-4">
          <p className="text-[12px] text-mute font-semibold mb-1">মোট ডেলিভারি খরচ</p>
          <p className="text-[18px] md:text-[22px] font-serif font-bold text-blue-700">{money(financial.totalDeliveryCosts)}</p>
        </div>
        <div className="bg-paper rounded-sm border border-line p-3 md:p-4">
          <p className="text-[12px] text-mute font-semibold mb-1">নেট সেলস</p>
          <p className="text-[18px] md:text-[22px] font-serif font-bold text-ink">{money(financial.netSales)}</p>
        </div>
        <div className="bg-paper rounded-sm border border-line p-3 md:p-4">
          <p className="text-[12px] text-mute font-semibold mb-1">মোট অর্ডার</p>
          <p className="text-[18px] md:text-[22px] font-serif font-bold text-ink">{financial.totalOrders}</p>
        </div>
        <div className="bg-paper rounded-sm border border-line p-3 md:p-4">
          <p className="text-[12px] text-mute font-semibold mb-1">ডেলিভার্ড অর্ডার</p>
          <p className="text-[18px] md:text-[22px] font-serif font-bold text-green-700">{financial.deliveredOrders}</p>
        </div>
      </div>

      {/* মাসিক চার্ট */}
      <div className="bg-paper rounded-sm border border-line p-4">
        <h3 className="mb-3 text-[16px] font-serif font-bold">মাসিক ট্রানজ্যাকশন (বর্তমান বছর)</h3>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="amount" fill="#B89A5A" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* সাপ্তাহিক চার্ট */}
      <div className="bg-paper rounded-sm border border-line p-4">
        <h3 className="mb-3 text-[16px] font-serif font-bold">সাপ্তাহিক ট্রানজ্যাকশন (গত ১২ সপ্তাহ)</h3>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weekly}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="amount" stroke="#B89A5A" strokeWidth={2} dot />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* কালার/ফ্যাব্রিক বিক্রয় + জেলা */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="bg-paper rounded-sm border border-line p-4">
          <h3 className="mb-3 text-[16px] font-serif font-bold">কালার অনুযায়ী বিক্রয় (ইউনিট)</h3>
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={colorPieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  label
                >
                  {colorPieData.map((d) => (
                    <Cell key={d.name} fill={COLOR_FILL[d.name] || "#B89A5A"} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-paper rounded-sm border border-line p-4">
          <h3 className="mb-3 text-[16px] font-serif font-bold">জেলাভিত্তিক ট্রানজ্যাকশন (সর্বোচ্চ আগে)</h3>
          <div className="max-h-[260px] overflow-y-auto">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="border-b border-line">
                  <th className="py-2 text-mute font-semibold">#</th>
                  <th className="py-2 text-mute font-semibold">জেলা</th>
                  <th className="py-2 text-mute font-semibold text-right">পরিমাণ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {districts.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-4 text-center text-mute">কোনো ডেটা নেই</td>
                  </tr>
                )}
                {districts.map((d, i) => (
                  <tr key={d.district}>
                    <td className="py-2 text-mute">{i + 1}</td>
                    <td className="py-2 text-ink font-medium">{d.district}</td>
                    <td className="py-2 text-ink text-right font-semibold">{money(d.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}