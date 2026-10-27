import AdminHeader from "@/components/admin/Header";

export default async function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <AdminHeader />
      <main className="wrap px-3.5 md:px-5 py-6 max-w-[1100px] mx-auto">
        {children}
      </main>
    </div>
  );
}