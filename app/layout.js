import "./globals.css";
import Script from "next/script";
import { Cormorant_Garamond, Hind_Siliguri, Noto_Serif_Bengali } from "next/font/google";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
  variable: "--font-disp",
});

const hind = Hind_Siliguri({
  subsets: ["latin", "bengali"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-sans",
});

const notoBengali = Noto_Serif_Bengali({
  subsets: ["bengali"],
  weight: ["600", "700"],
  display: "swap",
  variable: "--font-serif-bn",
});

export const metadata = {
  metadataBase: process.env.SITE_URL ? new URL(process.env.SITE_URL) : undefined,
  title: "NOOR Premium Export Quality Hoodie – ৳৫৫০",
  description: "NOOR Premium Export Quality Hoodie. 100% fleece cotton, 320–350 GSM. ছয়টি রঙ, সারা বাংলাদেশে ডেলিভারি।",
};

export const viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }) {
  return (
    <html
      lang="bn"
      data-theme="light"
      suppressHydrationWarning
      className={`${cormorant.variable} ${hind.variable} ${notoBengali.variable}`}
    >
      <head>
        {/* Inline script restored from localStorage before first paint */}
        <Script strategy="beforeInteractive" id="noor-init-script">
          {`(function(){var d=document.documentElement,t,l;try{t=localStorage.getItem("noor-theme");l=localStorage.getItem("noor-lang")}catch(e){}if(!t)t=matchMedia("(prefers-color-scheme:dark)").matches?"dark":"light";d.dataset.theme=t;d.lang=l==="en"?"en":"bn"})();`}
        </Script>
      </head>
      <body>{children}</body>
    </html>
  );
}