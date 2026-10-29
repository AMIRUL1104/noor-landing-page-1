"use client";
import { useEffect, useRef, useState } from "react";
import { PRODUCT, calcTotals } from "@/lib/products";
import { PHONE_DISPLAY, PHONE_INTL, T, nf, qtyLabel, tk } from "@/lib/i18n";
import { isValidAddress, isValidName, isValidPhone } from "@/lib/rules";
import { useLang } from "@/lib/prefs";
import { useOrder } from "./OrderProvider";

const { colors, sizes } = PRODUCT;
const EMPTY = { name: "", phone: "", address: "", website: "" };

const label = "mb-[7px] block text-[15.5px] font-semibold";
const input =
  "min-h-[50px] w-full rounded-xs border-[1.5px] border-line bg-paper px-3.5 py-2.5 text-[17px] text-ink " +
  "focus:border-gold focus:outline-3 focus:outline-offset-1 focus:outline-gold aria-[invalid=true]:border-err";
const chip =
  "flex min-h-[46px] items-center gap-2 rounded-xs border-[1.5px] border-line bg-paper px-3.5 " +
  "peer-checked:border-gold peer-checked:bg-alt peer-checked:font-bold peer-checked:shadow-[inset_0_0_0_1.5px_var(--gold)] " +
  "peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gold";
const err = "mt-1 text-[14.5px] text-err";

function uuid() {
  if (globalThis.crypto?.randomUUID) return crypto.randomUUID();
  const b = crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = [...b].map((x) => x.toString(16).padStart(2, "0")).join("");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

export default function OrderModal({ onSuccess }) {
  const { isOpen, closeModal, colorIdx, setColorIdx } = useOrder();
  const lang = useLang();
  const t = T[lang];
  const dlg = useRef(null);
  const bodyRef = useRef(null);
  const keyRef = useRef(null);
  const [qty, setQty] = useState(1);
  const [size, setSize] = useState(0);
  const [form, setForm] = useState(EMPTY);
  const [errs, setErrs] = useState({});
  const [status, setStatus] = useState("idle"); // idle | loading | success
  const [banner, setBanner] = useState("");
  const [result, setResult] = useState(null);

  // Sync React state -> native <dialog> (native dialog gives us focus trap, ESC and inert background).
  useEffect(() => {
    const d = dlg.current;
    if (!d) return;
    if (isOpen && !d.open) d.showModal();
    if (!isOpen && d.open) d.close();
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const totals = calcTotals(qty);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  function handleClose() {
    closeModal();
    if (status === "success") {
      setStatus("idle");
      setResult(null);
      setForm(EMPTY);
      setQty(1);
    }
  }

  async function submit(e) {
    e.preventDefault();
    if (status === "loading") return;
    const found = {};
    if (!isValidName(form.name)) found.name = t.e1;
    if (!isValidPhone(form.phone)) found.phone = t.e2;
    if (!isValidAddress(form.address)) found.address = t.e3;
    setErrs(found);
    setBanner("");
    const first = Object.keys(found)[0];
    if (first) return document.getElementById(`f-${first}`)?.focus();

    setStatus("loading");
    keyRef.current ??= uuid();
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          colorId: colors[colorIdx].id,
          sizeId: sizes[size].id,
          quantity: qty,
          name: form.name,
          phone: form.phone,
          address: form.address,
          lang,
          idempotencyKey: keyRef.current,
          website: form.website,
        }),
      });
      let data = null;
      try {
        data = await res.json();
      } catch {
        /* non-JSON error page */
      }
      if (res.ok && data?.ok) {
        setResult({ orderId: data.orderId, total: data.total, color: colors[colorIdx], size: sizes[size], qty, ...form });
        keyRef.current = null;
        setStatus("success");
        bodyRef.current?.scrollTo(0, 0);
        onSuccess?.(data);
        return;
      }
      if (res.status === 400 && data?.code === "INVALID") {
        const m = { name: t.e1, phone: t.e2, address: t.e3 };
        setErrs(Object.fromEntries((data.fields || []).filter((f) => m[f]).map((f) => [f, m[f]])));
        setBanner(t.eBad);
      } else if (res.status === 429) setBanner(t.eRate);
      else setBanner(t.eSrv);
    } catch {
      setBanner(t.eNet);
    }
    setStatus("idle");
  }

  const waText = result
    ? [
        t.mm, `${t.oid}: ${result.orderId}`, `${t.mc}: ${result.color[lang]}`, `${t.ms}: ${result.size.id} (${nf(lang, result.size.num)})`,
        `${t.mq}: ${qtyLabel(lang, result.qty)}`, `${t.tt}: ${tk(lang, result.total)}`,
        `${t.mn}: ${result.name}`, `${t.mp}: ${result.phone}`, `${t.ma}: ${result.address}`,
      ].join("\n")
    : "";

  return (
    <dialog
      ref={dlg}
      onClose={handleClose}
      onMouseDown={(e) => e.target === e.currentTarget && e.currentTarget.close()}
      aria-labelledby="order-title"
      className="pop m-0 h-dvh max-h-none w-full max-w-none flex-col border-0 bg-card p-0 text-ink open:flex md:m-auto md:h-auto md:max-h-[calc(100dvh-40px)] md:w-[620px] md:max-w-[calc(100%-40px)] md:border md:border-line"
    >
      <div className="flex items-center justify-between border-b border-line px-4 py-3 md:px-5 md:py-4">
        <h2 id="order-title" className="m-0 text-[21px] md:text-2xl">{t.mt}</h2>
        <button type="button" className="ib" aria-label={t.close} onClick={() => dlg.current?.close()}>
          <svg viewBox="0 0 24 24" className="size-5 fill-none stroke-current stroke-[1.8]" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
        </button>
      </div>

      {status === "success" && result ? (
        <div ref={bodyRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-8 text-center md:px-5" role="status">
          <svg viewBox="0 0 24 24" className="mx-auto mb-3 size-14 fill-none stroke-gd stroke-[1.8]" aria-hidden="true">
            <circle cx="12" cy="12" r="10" /><path d="m7.5 12.5 3 3 6-6.5" />
          </svg>
          <h3 className="mb-2 text-[22px]">{t.dn}</h3>
          <p className="text-mute">{t.oid}</p>
          <p className="my-1 font-disp text-[34px] font-semibold tracking-wider text-gd">{result.orderId}</p>
          <p className="mb-7 font-semibold">{t.tt}: {tk(lang, result.total)}</p>
          <div className="flex flex-col gap-2.5">
            <button type="button" className="btn" onClick={() => dlg.current?.close()}>{t.done}</button>
            <a className="btn btn-o" target="_blank" rel="noopener noreferrer" href={`https://wa.me/${PHONE_INTL}?text=${encodeURIComponent(waText)}`}>{t.wa2}</a>
          </div>
        </div>
      ) : (
        <form onSubmit={submit} noValidate className="flex min-h-0 flex-1 flex-col">
          <div ref={bodyRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-[18px] md:px-5 md:py-[22px]">
            {banner && (
              <div role="alert" className="mb-[18px] border-[1.5px] border-err p-3.5 text-[15.5px]">
                <p className="font-semibold text-err">{banner}</p>
                <p className="mt-1 text-mute">
                  <a className="underline" href={`tel:${PHONE_DISPLAY}`}>{nf(lang, PHONE_DISPLAY)}</a> · <a className="underline" href={`https://wa.me/${PHONE_INTL}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>
                </p>
              </div>
            )}

            <fieldset className="mb-[18px] min-w-0 border-0 p-0">
              <legend className={label}>{t.mc}</legend>
              <div className="flex flex-wrap gap-2">
                {colors.map((c, i) => (
                  <label key={c.id} className="relative grow basis-[calc(50%_-_4px)] md:grow-0 md:basis-auto">
                    <input type="radio" name="color" className="peer absolute inset-0 size-full cursor-pointer opacity-0" checked={colorIdx === i} onChange={() => setColorIdx(i)} />
                    <span className={`${chip} py-1 pl-1 pr-3`}>
                      <span className="relative h-11 w-9 flex-none overflow-hidden rounded-xs">
                        <img src={c.img} alt="" width={36} height={44} className="size-full object-cover" loading="lazy" />
                      </span>
                      {c[lang]}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className="mb-[18px] min-w-0 border-0 p-0">
              <legend className={label}>{t.ms}</legend>
              <div className="flex flex-wrap gap-2">
                {sizes.map((s, i) => (
                  <label key={s.id} className="relative">
                    <input type="radio" name="size" className="peer absolute inset-0 size-full cursor-pointer opacity-0" checked={size === i} onChange={() => setSize(i)} />
                    <span className={chip}>{s.id} ({nf(lang, s.num)})</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="mb-[18px]">
              <span className={label}>{t.mq}</span>
              <div className="inline-flex border-[1.5px] border-line">
                <button type="button" className="size-[50px] cursor-pointer bg-paper text-2xl text-ink" aria-label="−" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
                <output className="grid min-w-14 place-items-center text-xl font-semibold" aria-live="polite">{nf(lang, qty)}</output>
                <button type="button" className="size-[50px] cursor-pointer bg-paper text-2xl text-ink" aria-label="+" onClick={() => setQty((q) => Math.min(PRODUCT.maxQty, q + 1))}>+</button>
              </div>
            </div>

            <div className="grid gap-x-4 md:grid-cols-2">
              <div className="mb-[18px]">
                <label className={label} htmlFor="f-name">{t.mn}</label>
                <input id="f-name" className={input} type="text" autoComplete="name" maxLength={120} value={form.name} onChange={set("name")} aria-invalid={!!errs.name} aria-describedby={errs.name ? "e-name" : undefined} />
                {errs.name && <p id="e-name" className={err}>{errs.name}</p>}
              </div>
              <div className="mb-[18px]">
                <label className={label} htmlFor="f-phone">{t.mp}</label>
                <input id="f-phone" className={input} type="tel" inputMode="tel" autoComplete="tel" maxLength={30} placeholder="01XXXXXXXXX" value={form.phone} onChange={set("phone")} aria-invalid={!!errs.phone} aria-describedby={errs.phone ? "e-phone" : undefined} />
                {errs.phone && <p id="e-phone" className={err}>{errs.phone}</p>}
              </div>
            </div>
            <div className="mb-[18px]">
              <label className={label} htmlFor="f-address">{t.ma}</label>
              <textarea id="f-address" className={`${input} min-h-[92px] resize-y`} autoComplete="street-address" maxLength={600} placeholder={t.map} value={form.address} onChange={set("address")} aria-invalid={!!errs.address} aria-describedby={errs.address ? "e-address" : undefined} />
              {errs.address && <p id="e-address" className={err}>{errs.address}</p>}
            </div>

            {/* honeypot: hidden from people, bots tend to fill it */}
            <div aria-hidden="true" className="absolute -left-[9999px] size-0 overflow-hidden">
              <input type="text" name="website" tabIndex={-1} autoComplete="off" value={form.website} onChange={set("website")} />
            </div>

            <div className="border-t border-line pt-3.5">
              <div className="flex justify-between py-[3px]"><span>{qtyLabel(lang, qty)}</span><span>{tk(lang, totals.subtotal)}</span></div>
              <div className="flex justify-between py-[3px]"><span>{t.dp}</span><span>{totals.shipping ? tk(lang, totals.shipping) : t.free}</span></div>
              <div className="flex justify-between pt-2.5 font-serif text-[22px] font-bold"><span>{t.tt}</span><span>{tk(lang, totals.total)}</span></div>
            </div>
          </div>
          <div className="border-t border-line bg-card px-4 pb-[calc(14px_+_env(safe-area-inset-bottom,0px))] pt-3.5 md:px-5">
            <button type="submit" className="btn w-full" disabled={status === "loading"}>{status === "loading" ? t.sending : t.sub}</button>
          </div>
        </form>
      )}
    </dialog>
  );
}
