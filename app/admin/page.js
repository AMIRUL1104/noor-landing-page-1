import SummaryCards from "@/components/admin/SummaryCards";
import AdminNav from "@/components/admin/AdminNav";
import AnalyticsCharts from "@/components/admin/AnalyticsCharts";

export default function AdminPage() {
  return (
    <div className="space-y-8">
      <AdminNav />
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-[28px] font-serif font-bold">ওভারভিউ</h1>
      </div>

      <SummaryCards />

      <AnalyticsCharts />
    </div>
  );
}
