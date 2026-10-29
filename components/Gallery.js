"use client";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { PRODUCT } from "@/lib/products";
import { T } from "@/lib/i18n";
import { useLang } from "@/lib/prefs";
import { useOrder } from "./OrderProvider";
import Bi from "./Bi";

const colors = PRODUCT.colors;
const arrow = "absolute top-1/2 grid size-10 -translate-y-1/2 cursor-pointer place-items-center rounded-full border-0 bg-[rgba(250,248,242,.92)] md:size-11";

export default function Gallery() {
  const { colorIdx: cur, setColorIdx } = useOrder();
  const lang = useLang();
  const strip = useRef(null);
  const startX = useRef(null);
  const go = (i) => setColorIdx((i + colors.length) % colors.length);

  // Compute loaded indices during render - current, prev, next
  const loadedIndices = new Set([
    cur,
    (cur - 1 + colors.length) % colors.length,
    (cur + 1) % colors.length,
  ]);

  // keep the selected thumbnail centred inside the horizontally scrolling strip
  useEffect(() => {
    const box = strip.current;
    const el = box?.children[cur];
    if (!box || !el) return;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    box.scrollTo({ left: el.offsetLeft - (box.clientWidth - el.offsetWidth) / 2, behavior: calm ? "auto" : "smooth" });
  }, [cur]);

  return (
    <div className="-mx-3 min-w-0 x3:-mx-4 md:mx-0">
      <div
        className="relative aspect-4/5 touch-pan-y overflow-hidden bg-alt short:aspect-auto short:h-[calc(100svh-150px)]"
        onTouchStart={(e) => (startX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (startX.current === null) return;
          const d = e.changedTouches[0].clientX - startX.current;
          if (Math.abs(d) > 50) go(cur + (d < 0 ? 1 : -1));
          startX.current = null;
        }}
      >
        {colors.map((c, i) => loadedIndices.has(i) && (
          <Image
            key={c.id}
            src={c.img}
            alt={c[lang]}
            fill
            priority={i === 0}
            sizes="(min-width: 981px) 600px, (min-width: 761px) 50vw, 100vw"
            aria-hidden={i !== cur}
            className={`object-cover transition-opacity duration-200 ${i === cur ? "opacity-100" : "opacity-0"}`}
          />
        ))}
        <span className="absolute left-2.5 top-2.5 rounded-xs bg-[#111] px-2.5 py-0.5 text-[13.5px] font-bold text-[#FAF8F2] md:left-3.5 md:top-3.5 md:px-3 md:text-[14.5px]">
          <Bi k="stock" />
        </span>
        <span className="absolute right-2.5 top-2.5 rounded-xs bg-[#FAF8F2] px-2.5 py-0.5 text-[13.5px] font-bold text-[#111] md:right-3.5 md:top-3.5 md:px-3 md:text-[14.5px]">
          <Bi bn={colors[cur].bn} en={colors[cur].en} />
        </span>
        <button type="button" className={`${arrow} left-2 md:left-3`} aria-label={T[lang].prev} onClick={() => go(cur - 1)}>
          <svg viewBox="0 0 24 24" className="size-5 fill-none stroke-[#111] stroke-[2.2]" aria-hidden="true"><path d="m15 5-7 7 7 7" /></svg>
        </button>
        <button type="button" className={`${arrow} right-2 md:right-3`} aria-label={T[lang].next} onClick={() => go(cur + 1)}>
          <svg viewBox="0 0 24 24" className="size-5 fill-none stroke-[#111] stroke-[2.2]" aria-hidden="true"><path d="m9 5 7 7-7 7" /></svg>
        </button>
      </div>

      <div ref={strip} className="flex snap-x snap-proximity gap-2.5 overflow-x-scroll overscroll-x-contain px-3 pb-2.5 pt-3 [scrollbar-width:thin] x3:px-4 md:px-0.5">
        {colors.map((c, i) => (
          <button
            key={c.id}
            type="button"
            aria-pressed={i === cur}
            aria-label={c[lang]}
            onClick={() => setColorIdx(i)}
            className="relative aspect-4/5 w-[72px] flex-none cursor-pointer snap-center border-2 border-transparent bg-alt p-0 opacity-80 transition aria-pressed:border-gold aria-pressed:opacity-100 aria-pressed:outline aria-pressed:outline-1 aria-pressed:-outline-offset-3 aria-pressed:outline-ink md:w-[clamp(66px,9vw,92px)]"
          >
            <Image src={c.img} alt="" fill sizes="92px" className="object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
