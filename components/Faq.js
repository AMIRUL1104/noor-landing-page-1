import Bi from "./Bi";

const sum =
  "relative cursor-pointer list-none py-5 pr-10 text-[17px] font-semibold leading-normal md:text-[18px] " +
  "[&::-webkit-details-marker]:hidden after:absolute after:right-1.5 after:top-3.5 after:text-[28px] after:font-normal " +
  "after:text-gd after:transition-transform after:content-['+'] group-open:after:rotate-45";

export default function Faq() {
  return (
    <section id="faq" className="bg-alt py-[52px] md:py-[clamp(52px,8vw,100px)]">
      <div className="wrap">
        <h2 className="h2"><Bi k="faqt" /></h2>
        <div className="mt-[30px] max-w-[780px]">
          {[1, 2, 3].map((n) => (
            <details key={n} className="group border-t border-line last:border-b">
              <summary className={sum}><Bi k={`q${n}`} /></summary>
              <p className="pb-[22px] text-mute"><Bi k={`a${n}`} /></p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
