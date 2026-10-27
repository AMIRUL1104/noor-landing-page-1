"use client";

import { logout } from "@/lib/admin/auth";
import { getSession } from "@/lib/admin/auth";
import { T } from "@/lib/i18n";
import { useLang } from "@/lib/prefs";
import { useEffect, useState } from "react";

export default function AdminHeader() {
  const lang = useLang();
  const t = T[lang];
  const [session, setSession] = useState(null);

  useEffect(() => {
    getSession().then(setSession);
  }, []);

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-paper">
      <div className="wrap flex h-[60px] items-center justify-between gap-3 md:h-[66px] px-3.5 md:px-5">
        <a href="/admin" className="no-underline text-[20px] font-serif font-bold hover:text-gold">
          NOOR Admin
        </a>
        <div className="flex items-center gap-3">
          {session && (
            <span className="text-[13px] text-mute hidden md:block">
              {session.adminEmail}
            </span>
          )}
          <form action={logout} style={{ display: "inline" }}>
            <button
              type="submit"
              className="text-[15px] hover:text-ink no-underline"
            >
              লগআউট
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}