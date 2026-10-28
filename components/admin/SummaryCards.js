"use client";

import { getOrderSummary } from "@/lib/admin/orders";
import { T } from "@/lib/i18n";
import { useLang } from "@/lib/prefs";
import { useEffect, useState } from "react";

const CARD_CONFIG = [
  { key: "total", labelKey: "tt", color: "text-ink" },
  { key: "pending", labelKey: "pending", color: "text-yellow-700" },
  { key: "confirmed", labelKey: "confirmed", color: "text-blue-700" },
  { key: "delivered", labelKey: "delivered", color: "text-green-700" },
  { key: "cancelled", labelKey: "cancelled", color: "text-red-700" },
];

export default function SummaryCards() {
  const lang = useLang();
  const t = T[lang];
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    getOrderSummary().then(setSummary);
  }, []);

  const labels = {
    total: t.tt || "মোট",
    pending: "পেন্ডিং",
    confirmed: "কনফার্মড",
    delivered: "ডেলিভারড",
    cancelled: "ক্যানসেলড",
  };

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
      {CARD_CONFIG.map((card) => (
        <div
          key={card.key}
          className="bg-paper rounded-sm border border-line p-3 md:p-4"
        >
          <p className={`text-[12px] md:text-[13px] ${card.color} font-semibold mb-1`}>
            {labels[card.key] || card.key}
          </p>
          <p className="text-[20px] md:text-[24px] font-serif font-bold text-ink">
            {summary?.[card.key] ?? 0}
          </p>
        </div>
      ))}
    </div>
  );
}