"use client";

import { toggleTheme } from "@/lib/prefs";

export default function ThemeToggle() {
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="ib"
      aria-label="থিম টগল"
      suppressHydrationWarning
    >
      <svg viewBox="0 0 24 24" className="size-5 fill-none stroke-current stroke-[1.8]" aria-hidden="true">
        <path
          className="dark:hidden"
          d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z"
        />
        <path
          className="hidden dark:inline"
          d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5"
        />
        <circle cx="12" cy="12" r="4" className="hidden dark:inline" />
      </svg>
    </button>
  );
}
