import Bi from "./Bi";
import OrderButton from "./OrderButton";
import { PRODUCT } from "@/lib/products";
import { tk } from "@/lib/i18n";

export default function StickyOrderBar() {
  return (
    <div className="stick">
      <div className="min-w-0">
        <small className="block text-xs leading-tight text-mute x4:text-[13px]"><Bi k="per" /></small>
        <b className="font-disp text-2xl font-semibold leading-none text-gd x4:text-[28px]">
          <Bi bn={tk("bn", PRODUCT.price)} en={tk("en", PRODUCT.price)} />
        </b>
      </div>
      <OrderButton className="min-w-0 max-w-[260px] flex-1 whitespace-nowrap px-2.5 text-base x4:px-7 x4:text-[17px]" />
    </div>
  );
}
