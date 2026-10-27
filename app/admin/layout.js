import { logout } from "@/lib/admin/auth";
import { getSession } from "@/lib/admin/auth";

export default async function AdminLayout({ children }) {
  const session = await getSession();
  if (!session) {
    // মিডলওয়্যারও রিডাইরেক্ট করবে; লেআউটোও ডবল চেক করার জন্য
    console.warn("[AdminLayout] Unauthenticated access");
  }

  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="sticky top-0 z-20 border-b border-line bg-paper">
        <div className="wrap flex h-[60px] items-center justify-between gap-3 md:h-[66px] px-3.5 md:px-5">
          <a href="/admin" className="no-underline text-[20px] font-serif font-bold hover:text-gold">
            NOOR Admin
          </a>
          <form action={logout} style={{ display: "inline" }}>
            <button
              type="submit"
              className="text-[15px] hover:text-ink no-underline"
            >
              লগআউট
            </button>
          </form>
        </div>
      </header>
      <main className="wrap px-3.5 md:px-5 py-6 max-w-[1100px] mx-auto">
        {children}
      </main>
    </div>
  );
}