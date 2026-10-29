"use client";

import { getOrders } from "@/lib/admin/orders";
import StatusSelect from "@/components/admin/StatusSelect";
import { tk } from "@/lib/i18n";
import { useLang } from "@/lib/prefs";
import { useEffect, useState } from "react";
import OrderDetailModal from "@/components/admin/OrderDetailModal";

export default function OrderList({ search, status }) {
  const lang = useLang();
  const [result, setResult] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    getOrders({ page: 1, search, status }).then(setResult);
  }, [search, status]);

  if (!result) {
    return (
      <div className="bg-paper rounded-sm border border-line p-6">
        <p className="text-mute">লোড হচ্ছে...</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="bg-paper rounded-sm border border-line p-6">
        <p className="text-err">অনুমতি নেই। লগইন করুন。</p>
      </div>
    );
  }

  const { orders, totalCount, totalPages, page } = result;

  if (orders.length === 0) {
    return (
      <div className="bg-paper rounded-sm border border-line p-6 text-center">
        <p className="text-mute">কোনো অর্ডার পাওয়া যায়নি।</p>
      </div>
    );
  }

  const openModal = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  return (
    <>
      <div className="hidden md:block bg-paper rounded-sm border border-line overflow-hidden">
        <table className="w-full text-left text-[14px]">
          <thead>
            <tr className="bg-alt border-b border-line">
              <th className="p-3 text-mute font-semibold">অর্ডার আইডি</th>
              <th className="p-3 text-mute font-semibold">নাম</th>
              <th className="p-3 text-mute font-semibold">ফোন</th>
              <th className="p-3 text-mute font-semibold">রং / সাইজ</th>
              <th className="p-3 text-mute font-semibold">পরিমাণ</th>
              <th className="p-3 text-mute font-semibold">মোট</th>
              <th className="p-3 text-mute font-semibold">তারিখ</th>
              <th className="p-3 text-mute font-semibold">স্ট্যাটাস</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {orders.map((order) => {
              const pricing = order.pricing || { total: 0 };
              const color = order.item.colorId;
              const size = order.item.sizeId;
              const date = new Date(order.createdAt).toLocaleDateString(
                lang === "bn" ? "bn-BD" : "en-US",
              );
              return (
                <tr
                  key={order.orderId}
                  className="sm:hover:bg-alt max-sm:bg-alt transition-colors"
                >
                  <td className="p-3 text-ink font-medium">
                    #{order.orderId}
                  </td>
                  <td className="p-3 text-ink">
                    {order.customer?.name || "—"}
                  </td>
                  <td className="p-3 text-ink">
                    <a
                      href={`tel:${order.customer.phone}`}
                      className="text-gold sm:hover:underline max-sm:underline"
                    >
                      {order.customer?.phone || "—"}
                    </a>
                  </td>
                  <td className="p-3 text-ink">
                    {color} / {size}
                  </td>
                  <td className="p-3 text-ink">{order.item.quantity}টি</td>
                  <td className="p-3 text-ink font-semibold">
                    {tk(lang, pricing.total)}
                  </td>
                  <td className="p-3 text-mute">{date}</td>
                  <td className="p-3">
                    <StatusSelect
                      orderId={order.orderId}
                      currentStatus={order.status || "pending"}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* পেজিনেশন */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-3 py-3 border-t border-line bg-paper">
            <p className="text-[13px] text-mute">
              পেজ {page} এর মধ্যে {totalPages}, মোট {totalCount}টি অর্ডার
            </p>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    // পেজিনেশন হ্যান্ডলার (বর্তমানে পেজ ১ লক করা, পেজ প্যারামিটারের ভিত্তিতে রেন্ডার করবে সার্ভার)
                  }}
                  className={`px-3 py-1.5 rounded-xs border text-[13px] ${
                    p === page
                      ? "border-gold bg-gold text-black"
                      : "border-line bg-paper text-ink sm:hover:text-gold max-sm:text-gold"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* মোবাইল: কার্ড ভিউ */}
      <div className="md:hidden space-y-3">
        {orders.map((order) => {
          const pricing = order.pricing || { total: 0 };
          const color = order.item.colorId;
          const size = order.item.sizeId;
          return (
            <div
              key={order.orderId}
              className="bg-paper rounded-sm border border-line p-3 w-full"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-semibold text-ink truncate">
                    {order.customer?.name || "—"}
                  </p>
                  <a
                    href={`tel:${order.customer?.phone}`}
                    className="text-[13px] text-gold sm:hover:underline max-sm:underline block truncate"
                  >
                    {order.customer?.phone || "—"}
                  </a>
                </div>
                <div className="shrink-0">
                  <StatusSelect
                    orderId={order.orderId}
                    currentStatus={order.status || "pending"}
                  />
                </div>
              </div>

              <div className="mt-2 flex items-center justify-between gap-2">
                <p className="text-[11px] text-mute truncate">
                  {color} / {size} · {order.item.quantity}টি ·{" "}
                  {tk(lang, pricing.total)}
                </p>
                <button
                  type="button"
                  onClick={() => openModal(order)}
                  className="text-[12px] px-2.5 py-1.5 rounded-xs border border-gold text-gold sm:hover:bg-gold max-sm:bg-gold sm:hover:text-black max-sm:text-black transition-colors shrink-0"
                >
                  বিস্তারিত
                </button>
              </div>
            </div>
          );
        })}

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-1 py-2">
            <p className="text-[12px] text-mute">
              পেজ {page} / {totalPages} · মোট {totalCount}টি
            </p>
          </div>
        )}
      </div>

      <OrderDetailModal
        isOpen={isModalOpen}
        onClose={closeModal}
        order={selectedOrder}
      />
    </>
  );
}
