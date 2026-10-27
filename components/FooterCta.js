import Image from "next/image";
import Bi from "./Bi";
import OrderButton from "./OrderButton";
import { PHONE_DISPLAY, PHONE_INTL, T, nf } from "@/lib/i18n";

const light = "hover:border-[#FAF8F2] hover:bg-[#FAF8F2] hover:text-[#111]";

export default function FooterCta() {
  return (
    <footer className="site-footer">
      <div className="py-12 text-center dark:border-t dark:border-line md:py-[clamp(48px,7vw,84px)]">
        <div className="wrap">
          <h2 className="h2"><Bi k="ct" /></h2>
          <p className="opacity-85"><Bi bn={nf("bn", PHONE_DISPLAY)} en={PHONE_DISPLAY} /></p>
          <div className="mt-[26px] flex flex-col flex-wrap justify-center gap-3 x4:flex-row">
            <OrderButton className={light} />
            <a className={`btn btn-o ${light}`} href={`https://wa.me/${PHONE_INTL}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>
            <a className={`btn btn-o ${light}`} href={`tel:${PHONE_DISPLAY}`}>
              <Bi bn={`${T.bn.call}: ${nf("bn", PHONE_DISPLAY)}`} en={`${T.en.call}: ${PHONE_DISPLAY}`} />
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-[rgba(250,248,242,.2)] pt-[26px]">
        <div className="wrap flex flex-col items-center justify-between gap-3.5 md:flex-row">
          <Image src="/logo/noor-white.png" alt="NOOR" width={900} height={251} className="h-6 w-auto md:h-8" />
          <span className="font-disp text-xl tracking-[.04em] opacity-85">Your Everyday Style Guide</span>
        </div>
      </div>
    </footer>
  );
}
