"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { Search } from "lucide-react";

export default function SearchBox() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const inputRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      const urlValue = searchParams.get("search") || "";
      if (inputRef.current.value !== urlValue) {
        inputRef.current.value = urlValue;
      }
    }
  }, [searchParams]);

  const handleChange = () => {
    const value = inputRef.current ? inputRef.current.value : "";
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value.trim()) {
        params.set("search", value.trim());
      } else {
        params.delete("search");
      }
      router.push(`${pathname}?${params.toString()}`);
    }, 500);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div className="relative mb-6 md:mb-8">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-mute" />
      <input
        ref={inputRef}
        name="search"
        type="text"
        defaultValue={searchParams.get("search") || ""}
        placeholder="অর্ডার আইডি, ফোন বা নাম দিয়ে সার্চ করুন"
        onChange={handleChange}
        className="min-h-[50px] w-full rounded-xs border-[1.5px] border-line bg-paper pl-10 pr-3.5 py-2.5 text-[16px] text-ink focus:border-gold focus:outline-3 focus:outline-offset-1 focus:outline-gold"
      />
    </div>
  );
}