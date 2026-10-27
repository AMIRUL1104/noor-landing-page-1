import Bi from "./Bi";
import { PRODUCT } from "@/lib/products";
import { nf } from "@/lib/i18n";

const svg = "size-8 flex-none fill-none stroke-gd stroke-[1.6]";
const features = [
  { k: "f1", icon: <><path d="M16 4c5 6 8 9.5 8 14a8 8 0 0 1-16 0c0-4.5 3-8 8-14Z" /><path d="M12 19a4 4 0 0 0 4 4" /></> },
  { k: "f2", icon: <><path d="M9 14c0-6 14-6 14 0v6c0 4-14 4-14 0Z" /><path d="M12 15c0-3 8-3 8 0" /></> },
  { k: "f3", icon: <><path d="M4 11h24M4 21h24" strokeDasharray="3 3" /><path d="M4 16h24" /></> },
  { k: "f4", icon: <><path d="M12 4v16M20 4v18" /><circle cx="12" cy="24" r="3" /><circle cx="20" cy="26" r="3" /></> },
];

export default function Details() {
  const names = (l) => PRODUCT.colors.map((c) => c[l]).join(l === "bn" ? "، " : ", ");
  const sizes = (l) => PRODUCT.sizes.map((s) => `${s.id} (${nf(l, s.num)})`).join(", ");
  const rows = [
    ["s1", <Bi key="a" k="s1v" />],
    ["s2", <Bi key="b" bn={nf("bn", "320–350") + " GSM"} en="320–350 GSM" />],
    ["s3", <Bi key="c" bn={names("bn")} en={names("en")} />],
    ["s4", <Bi key="d" bn={sizes("bn")} en={sizes("en")} />],
  ];
  return (
    <section id="details" className="bg-alt py-[52px] md:py-[clamp(52px,8vw,100px)]">
      <div className="wrap">
        <h2 className="h2"><Bi k="dt" /></h2>
        <div className="mt-9 grid items-start gap-6 md:grid-cols-2 md:gap-[clamp(24px,6vw,80px)]">
          <ul className="m-0 grid list-none grid-cols-1 gap-3.5 p-0 x4:grid-cols-2">
            {features.map((f) => (
              <li key={f.k} className="flex items-center gap-3.5 border border-line bg-card p-3.5 font-semibold leading-snug x3:p-[18px]">
                <svg viewBox="0 0 32 32" className={svg} aria-hidden="true">{f.icon}</svg>
                <span><Bi k={f.k} /></span>
              </li>
            ))}
          </ul>
          <div>
            <h3 className="mb-3.5 text-[21px]"><Bi k="spt" /></h3>
            <dl className="m-0 border-t border-line">
              {rows.map(([k, v]) => (
                <div key={k} className="grid grid-cols-1 gap-0.5 border-b border-line py-3.5 x4:grid-cols-[90px_1fr] x4:gap-4 md:grid-cols-[110px_1fr]">
                  <dt className="text-mute"><Bi k={k} /></dt>
                  <dd className="m-0 font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
