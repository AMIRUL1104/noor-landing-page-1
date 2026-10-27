import { getOrderById } from "@/lib/admin/orders";
import { PRODUCT, calcTotals } from "@/lib/products";
import { tk } from "@/lib/i18n";
import { getStatusLabel } from "@/lib/orderStatus";

export default async function OrderDetailsPage({ params }) {
  const { orderId } = await params;
  const lang = "bn";

  const order = await getOrderById(orderId);

  if (!order) {
    return (
      <div className="min-h-screen bg-paper text-ink p-6">
        <h1 className="text-[24px] font-serif font-bold">অর্ডার পাওয়া যায়নি</h1>
        <p className="mt-4">অর্ডার জমা হয়নি। আবার চেষ্টা করুন।</p>
      </div>
    );
  }

  const color = PRODUCT.colors.find((c) => c.id === order.item.colorId);
  const size = PRODUCT.sizes.find((s) => s.id === order.item.sizeId);
  const pricing = order.pricing || calcTotals(order.item.quantity);

  const phoneLink = `https://wa.me/${order.customer.phone}`;
  const phoneDisplay = order.customer.phone.replace(/^(\d{3})(\d{2})(\d{3})(\d{2})$/, "$1-$2 $3-$4");

  return (
    <div className="min-h-screen bg-paper text-ink p-3.5 md:p-5">
      <nav className="flex items-center gap-2 mb-6">
        <a
          href="/admin"
          className="text-[15px] hover:text-gold no-underline"
        >
          ← ড্যাশবোর্ডে ফিরে যান
        </a>
      </nav>

      <div className="bg-paper rounded-sm border border-line p-6">
        <h1 className="text-[24px] font-serif font-bold mb-6">
          অর্ডার #{order.orderId}
        </h1>

        {/* স্ট্যাটাস ব্যাজ */}
        <div className="mb-6">
          <span className={`inline-block px-3 py-1 rounded-xs text-[13px] font-semibold border ${getStatusColor(order.status || "pending")}`}>
            {getStatusLabel(order.status || "pending", lang)}
          </span>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* গ্রাহক তথ্য */}
          <div className="bg-alt rounded-sm p-4 border border-line">
            <h2 className="text-[18px] font-serif font-bold mb-4">গ্রাহকের নাম</h2>
            <p className="mb-2">{order.customer?.name || "—"}</p>
            <p className="mb-2">মোবাইল: <a href={`tel:${order.customer.phone}`} className="text-gold hover:underline">{phoneDisplay}</a></p>
            <p className="mb-2">ঠিকানা: {order.customer?.address || "—"}</p>
            <p className="mb-0">অর্ডার আইডি: {order.orderId}</p>
          </div>

          {/* অর্ডার ডিটেইল */}
          <div className="bg-alt rounded-sm p-4 border border-line">
            <h2 className="text-[18px] font-serif font-bold mb-4">অর্ডার ডিটেইল</h2>
            <p className="mb-2">রং: {color?.bn || order.item.colorId}</p>
            <p className="mb-2">সাইজ: {size?.id || order.item.sizeId}</p>
            <p className="mb-2">পরিমাণ: {order.item.quantity}টি</p>
            <p className="mb-2">এককমূল্য: {tk(lang, pricing.unitPrice)}</p>
            <p className="mb-2">ডেলিভারি চার্জ: {pricing.shipping ? tk(lang, pricing.shipping) : "ডেলিভারি ফ্রি"}</p>
            <p className="mb-0 font-bold">মোট: {tk(lang, pricing.total)}</p>
          </div>
        </div>

        {/* স্ট্যাটাস হিস্টোরি */}
        {order.statusHistory && order.statusHistory.length > 0 && (
          <div className="mt-6 bg-alt rounded-sm p-4 border border-line">
            <h2 className="text-[18px] font-serif font-bold mb-4">স্ট্যাটাস হিস্টোরি</h2>
            <ul className="space-y-2">
              {order.statusHistory.map((h, i) => (
                <li key={i} className="text-[14px] text-mute">
                  {getStatusLabel(h.status, lang)} — {new Date(h.changedAt).toLocaleDateString("bn-BD")} ({h.changedBy || "সিস্টেম"})
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* কল / ওয়াট্সআপ লিঙ্ক */}
        <div className="mt-6 flex gap-3">
          <a
            href={`tel:${order.customer.phone}`}
            className="flex-1 btn bg-gold"
          >
            📞 কল করুন
          </a>
          <a
            href={phoneLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 btn bg-gold"
          >
            WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}