import { T } from "@/lib/i18n";

/** Renders both languages; globals.css shows the one matching <html lang>. Works in server & client components. */
export default function Bi({ k, bn, en }) {
  return (
    <>
      <span data-l="bn">{bn ?? T.bn[k]}</span>
      <span data-l="en">{en ?? T.en[k]}</span>
    </>
  );
}
