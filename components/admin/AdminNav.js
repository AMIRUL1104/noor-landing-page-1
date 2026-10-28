"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingBag } from "lucide-react";

const NAV = [
  { href: "/admin", label: "ওভারভিউ", icon: LayoutDashboard },
  { href: "/admin/orders", label: "অর্ডারস", icon: ShoppingBag },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="mb-6 flex gap-2 border-b border-line pb-3">
      {NAV.map((item) => {
        const Icon = item.icon;
        const active =
          item.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2 rounded-xs border px-3 py-2 text-[14px] transition-colors ${
              active
                ? "border-gold bg-gold text-black"
                : "border-line bg-paper text-ink sm:hover:text-gold max-sm:text-gold"
            }`}
          >
            <Icon className="size-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
