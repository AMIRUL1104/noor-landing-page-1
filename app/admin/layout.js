import { getSession } from "@/lib/admin/auth";
import AdminHeader from "@/components/admin/Header";

export default async function AdminLayout({ children }) {
  const session = await getSession();

  return (
    <div className="min-h-screen bg-paper text-ink">
      <AdminHeader session={session} />
      <main className="wrap px-3.5 md:px-5 py-6 max-w-[1100px] mx-auto">
        {children}
      </main>
    </div>
  );
}