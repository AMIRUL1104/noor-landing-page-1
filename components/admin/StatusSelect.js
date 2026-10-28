"use client";

import { setOrderStatus } from "@/app/admin/actions";
import { ORDER_STATUSES } from "@/lib/orderStatus";
import { useLang } from "@/lib/prefs";
import { useTransition, useState } from "react";

export default function StatusSelect({ orderId, currentStatus }) {
  const lang = useLang();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState(null);

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    const formData = new FormData();
    formData.set("orderId", orderId);
    formData.set("status", newStatus);

    startTransition(() => {
      setError(null);
      setOrderStatus(formData).then((result) => {
        if (result?.error) {
          setError("স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
        }
      });
    });
  };

  return (
    <div className="relative">
      <select
        onChange={handleStatusChange}
        defaultValue={currentStatus}
        disabled={isPending}
        className="min-w-[120px] min-h-[40px] rounded-xs border-[1.5px] border-line bg-paper px-2.5 py-1.5 text-[14px] text-ink focus:border-gold focus:outline-3 focus:outline-offset-1 focus:outline-gold disabled:opacity-60"
      >
        {ORDER_STATUSES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label.bn}
          </option>
        ))}
      </select>
      {isPending && <span className="text-[11px] text-mute">আপডেট হচ্ছে...</span>}
      {error && <span className="text-[11px] text-err mt-1 block">{error}</span>}
    </div>
  );
}