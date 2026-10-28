"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { ORDER_STATUSES } from "@/lib/orderStatus";
import { useLang } from "@/lib/prefs";

export default function Filters() {
  const lang = useLang();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const currentStatus = searchParams.get("status") || "all";

  const handleStatusChange = (status) => {
    const params = new URLSearchParams(searchParams.toString());
    if (status === "all") {
      params.delete("status");
    } else {
      params.set("status", status);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap gap-3 mb-6 md:mb-8 items-center">
      <span className="text-[14px] font-semibold text-mute">ফিল্টার:</span>
      <button
        onClick={() => handleStatusChange("all")}
        className={`px-3 py-1.5 rounded-xs border text-[13px] ${
          currentStatus === "all"
            ? "border-gold bg-gold text-black"
            : "border-line bg-paper text-ink hover:text-gold max-md:text-gold"
        }`}
      >
        সব
      </button>
      {ORDER_STATUSES.map((s) => (
        <button
          key={s.value}
          onClick={() => handleStatusChange(s.value)}
          className={`px-3 py-1.5 rounded-xs border text-[13px] ${
            currentStatus === s.value
              ? "border-gold bg-gold text-black"
            : "border-line bg-paper text-ink hover:text-gold max-md:text-gold"
          }`}
        >
          {s.label[lang] || s.label.en}
        </button>
      ))}
    </div>
  );
}