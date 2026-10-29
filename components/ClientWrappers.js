"use client";

import dynamic from "next/dynamic";

export const StickyOrderBar = dynamic(
  () => import("@/components/StickyOrderBar"),
  { ssr: false }
);

export const OrderModal = dynamic(
  () => import("@/components/OrderModal"),
  { ssr: false, loading: () => null }
);

export const AnalyticsCharts = dynamic(
  () => import("@/components/admin/AnalyticsCharts"),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="h-[260px] bg-alt rounded-sm animate-pulse" />
          <div className="h-[260px] bg-alt rounded-sm animate-pulse" />
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-[80px] bg-alt rounded-sm animate-pulse" />
          ))}
        </div>
        <div className="h-[280px] bg-alt rounded-sm animate-pulse" />
        <div className="h-[280px] bg-alt rounded-sm animate-pulse" />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="h-[260px] bg-alt rounded-sm animate-pulse" />
          <div className="h-[260px] bg-alt rounded-sm animate-pulse" />
        </div>
      </div>
    ),
  }
);