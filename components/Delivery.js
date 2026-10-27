import Bi from "./Bi";
import { PRODUCT, calcTotals } from "@/lib/products";
import { qtyLabel, tk } from "@/lib/i18n";

const row = "flex justify-between gap-3 border-t border-line py-[9px]";
const money = (n) => <Bi bn={tk("bn", n)} en={tk("en", n)} />;
const qtyText = (n) => <Bi bn={qtyLabel("bn", n)} en={qtyLabel("en", n)} />;

export default function Delivery() {
  const one = calcTotals(1);
  const two = calcTotals(PRODUCT.freeShippingMinQty);
  return (
    <section id="delivery" className="py-[52px] md:py-[clamp(52px,8vw,100px)]">
      <div className="wrap">
        <h2 className="h2"><Bi k="delt" /></h2>
        <p className="max-w-[56ch] text-mute"><Bi k="dels" /></p>
        <div className="mt-[34px] grid gap-5 md:grid-cols-2">
          <div className="border border-line bg-card px-[18px] py-[22px] md:p-[30px]">
            <h3 className="mb-3 text-xl"><Bi k="d1" /></h3>
            <div className="big">{money(one.total)}</div>
            <ul className="mt-3.5 list-none p-0 text-mute">
              <li className={row}><span><Bi k="hd" /></span><span>{money(one.subtotal)}</span></li>
              <li className={row}><span><Bi k="dp" /></span><span>{money(one.shipping)}</span></li>
            </ul>
          </div>
          <div className="border border-gold bg-card px-[18px] py-[22px] shadow-[inset_0_4px_0_var(--gold)] md:p-[30px]">
            <h3 className="mb-3 text-xl"><Bi k="d2" /></h3>
            <div className="big"><Bi k="fd" /></div>
            <ul className="mt-3.5 list-none p-0 text-mute">
              <li className={row}><span>{qtyText(PRODUCT.freeShippingMinQty)}</span><span>{money(two.subtotal)}</span></li>
              <li className={row}><span><Bi k="dl" /></span><span><Bi k="fr" /></span></li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
