import OrderProvider from "@/components/OrderProvider";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Details from "@/components/Details";
import Delivery from "@/components/Delivery";
import Faq from "@/components/Faq";
import FooterCta from "@/components/FooterCta";
import StickyOrderBar from "@/components/StickyOrderBar";
import OrderModal from "@/components/OrderModal";

export default function Page() {
  return (
    <OrderProvider>
      <Header />
      <main id="top">
        <Hero />
        <Details />
        <Delivery />
        <Faq />
      </main>
      <FooterCta />
      <StickyOrderBar />
      <OrderModal />
    </OrderProvider>
  );
}
