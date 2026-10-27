import SummaryCards from "@/components/admin/SummaryCards";
import SearchBox from "@/components/admin/SearchBox";
import Filters from "@/components/admin/Filters";
import OrderList from "@/components/admin/OrderList";

export default async function AdminPage({ searchParams }) {
  // Next.js 16 dev server: searchParams is an object; build time: it's a Promise
  const resolved = await searchParams;
  const params = Object.fromEntries(Object.entries(resolved || {}));
  const search = params.search || undefined;
  const status = params.status || undefined;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-[28px] font-serif font-bold">ড্যাশবোর্ড</h1>
        <SearchBox />
      </div>

      <SummaryCards />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <Filters />
      </div>

      <OrderList search={search} status={status} />
    </div>
  );
}