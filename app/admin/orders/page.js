import AdminNav from "@/components/admin/AdminNav";
import SearchBox from "@/components/admin/SearchBox";
import Filters from "@/components/admin/Filters";
import AdminOrdersClient from "@/components/admin/AdminOrdersClient";

export default async function AdminOrdersPage({ searchParams }) {
  const resolved = await searchParams;
  const params = Object.fromEntries(Object.entries(resolved || {}));
  const search = params.search || undefined;
  const status = params.status || undefined;

  return (
    <div className="space-y-8">
      <AdminNav />
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-[28px] font-serif font-bold">অর্ডারস</h1>
        <SearchBox />
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <Filters />
      </div>

      <AdminOrdersClient search={search} status={status} />
    </div>
  );
}
