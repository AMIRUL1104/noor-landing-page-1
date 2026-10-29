"use client";
import Image from "next/image";
import Bi from "./Bi";
import { T } from "@/lib/i18n";
import { toggleLang, toggleTheme, useLang, useTheme } from "@/lib/prefs";

export default function Header() {
  const lang = useLang();
  const theme = useTheme();
  const t = T[lang];
  return (
    <header className="sticky top-[env(safe-area-inset-top,0px)] z-20 border-b border-line bg-paper">
      <div className="wrap flex h-[60px] items-center justify-between gap-3 md:h-[66px]">
        <a href="#top" aria-label="NOOR" className="min-w-0">
          <Image
            src="/logo/noor-black.png"
            alt="NOOR"
            width={180}
            height={50}
            className="h-[34px] w-auto dark:hidden"
          />
          <Image
            src="/logo/noor-white.png"
            alt="NOOR"
            width={180}
            height={50}
            className="hidden h-[34px] w-auto dark:block"
          />
        </a>
        <div className="flex items-center gap-[22px]">
          <nav className="hidden gap-6 text-[15.5px] text-mute lg:flex">
            <a className="no-underline sm:hover:text-ink max-sm:text-ink" href="#details"><Bi k="nav1" /></a>
            <a className="no-underline sm:hover:text-ink max-sm:text-ink" href="#delivery"><Bi k="nav2" /></a>
            <a className="no-underline sm:hover:text-ink max-sm:text-ink" href="#faq"><Bi k="nav3" /></a>
          </nav>
          <div className="flex gap-1.5 x4:gap-2">
            <button type="button" className="ib" onClick={toggleTheme} aria-label={theme === "dark" ? t.light : t.dark}>
              <svg viewBox="0 0 24 24" className="size-5 fill-none stroke-current stroke-[1.8]" aria-hidden="true">
                {theme === "dark" ? (
                  <>
                    <circle cx="12" cy="12" r="4" />
                    <path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5" />
                  </>
                ) : (
                  <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
                )}
              </svg>
            </button>
            <button type="button" className="ib" onClick={toggleLang} aria-label={t.langAria}>{t.lang}</button>
          </div>
        </div>
      </div>
    </header>
  );
}
