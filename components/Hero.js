import Gallery from "./Gallery";
import Bi from "./Bi";
import { PRODUCT } from "@/lib/products";
import { tk } from "@/lib/i18n";

export default function Hero() {
  return (
    <section className="pb-[52px] md:py-14 md:pb-[90px]">
      <div className="wrap grid grid-cols-1 items-center gap-5 md:grid-cols-[minmax(0,1.05fr)_minmax(0,.95fr)] md:gap-7 lg:gap-[clamp(24px,5vw,72px)] short:grid-cols-[minmax(0,.8fr)_minmax(0,1.2fr)]">
        <Gallery />
        <div className="min-w-0">
          <h1 className="hero-h1"><Bi k="h1" /></h1>
          <p className="max-w-[56ch] text-mute"><Bi k="hs" /></p>
          <div className="mb-2.5 mt-6 flex items-baseline gap-3.5 md:mt-[26px]">
            <b className="font-disp text-[44px] font-semibold leading-none text-gd x4:text-[clamp(46px,7vw,68px)]">
              <Bi bn={tk("bn", PRODUCT.price)} en={tk("en", PRODUCT.price)} />
            </b>
            <span className="text-mute"><Bi k="per" /></span>
          </div>
          <p className="inline-block max-w-full border-[1.5px] border-gold px-3.5 py-1 font-semibold"><Bi k="hook" /></p>
        </div>
      </div>
    </section>
  );
}
