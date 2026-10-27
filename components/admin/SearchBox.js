"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useState } from "react";

export default function SearchBox() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState(searchParams.get("search") || "");

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (query.trim()) {
      params.set("search", query.trim());
    } else {
      params.delete("search");
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="relative mb-6 md:mb-8">
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          name="search"
          type="text"
          placeholder="অর্ডার আইডি, ফোন বা নাম দিয়ে সার্চ করুন"
          defaultValue={query}
          onChange={(e) => setQuery(e.target.value)}
          className="min-h-[50px] w-full rounded-xs border-[1.5px] border-line bg-paper px-3.5 py-2.5 text-[16px] text-ink focus:border-gold focus:outline-3 focus:outline-offset-1 focus:outline-gold"
        />
        <button
          type="submit"
          className="btn bg-gold min-h-[50px] px-4"
        >
          সার্চ
        </button>
      </form>
    </div>
  );
}