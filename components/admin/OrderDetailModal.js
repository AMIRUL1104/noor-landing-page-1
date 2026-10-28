"use client";

import { getOrderById } from "@/lib/admin/orders";
import { PRODUCT, calcTotals } from "@/lib/products";
import { tk } from "@/lib/i18n";
import { getStatusLabel, getStatusColor } from "@/lib/orderStatus";
import StatusSelect from "@/components/admin/StatusSelect";
import { setOrderStatus } from "@/app/admin/actions";
import { useEffect, useState, useTransition } from "react";

export default function OrderDetailModal({ isOpen, onClose, orderId }) {
  const [order, setOrder] = useState(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState(null);
  const lang = "bn";

  useEffect(() => {
    if (isOpen && orderId) {
      getOrderById(orderId).then(setOrder);
    }
  }, [isOpen, orderId]);

  const handleStatusChange = (newStatus) => {
    const formData = new FormData();
    formData.set("orderId", orderId);
    formData.set("status", newStatus);

    startTransition(() => {
      setError(null);
      setOrderStatus(formData).then((result) => {
        if (result?.error) {
          setError("স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
        } else {
          getOrderById(orderId).then(setOrder);
        }
      });
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-paper rounded-sm border border-line max-w-[500px] w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b border-line flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h2 className="text-[18px] font-serif font-bold">
              অর্ডার #{orderId}
            </h2>
            {order && (
              <span
                className={`inline-block px-2 py-0.5 rounded-xs text-[12px] font-semibold border ${getStatusColor(
                  order.status || "pending"
                )}`}
              >
                {getStatusLabel(order.status || "pending", lang)}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-[20px] font-bold text-gold no-underline"
          >
            X
          </button>
        </div>

        {!order && (
          <div className="p-8 text-center text-mute">লোড হচ্ছে...</div>
        )}

        {order && (
          <div className="p-4 space-y-6">
            {/* গ্রাহক তথ্য */}
            <div className="bg-alt rounded-sm p-4 border border-line">
              <h3 className="text-[16px] font-serif font-bold mb-3">
                গ্রাহকের তথ্য
              </h3>
              <p className="mb-2">
                <span className="font-semibold">নাম:</span>{" "}
                {order.customer?.name || "—"}
              </p>
              <p className="mb-2">
                <span className="font-semibold">ফোন:</span>{" "}
                <a
                  href={`tel:${order.customer.phone}`}
                  className="text-gold sm:hover:underline max-sm:underline"
                >
                  {order.customer?.phone || "—"}
                </a>
              </p>
              <p className="mb-0">
                <span className="font-semibold">ঠিকানা:</span>{" "}
                {order.customer?.address || "—"}
              </p>
            </div>

            {/* অর্ডার ডিটেইল */}
            <div className="bg-alt rounded-sm p-4 border border-line">
              <h3 className="text-[16px] font-serif font-bold mb-3">
                অর্ডার ডিটেইল
              </h3>
              <p className="mb-2">
                <span className="font-semibold">অর্ডার আইডি:</span> {orderId}
              </p>
              <p className="mb-2">
                <span className="font-semibold">রং:</span>{" "}
                {PRODUCT.colors.find((c) => c.id === order.item.colorId)?.bn ||
                  order.item.colorId}
              </p>
              <p className="mb-2">
                <span className="font-semibold">সাইজ:</span>{" "}
                {PRODUCT.sizes.find((s) => s.id === order.item.sizeId)?.id ||
                  order.item.sizeId}
              </p>
              <p className="mb-2">
                <span className="font-semibold">পরিমাণ:</span>{" "}
                {order.item.quantity}টি
              </p>
              <p className="mb-0 font-bold">
                <span className="font-semibold">মোট:</span>{" "}
                {tk(
                  lang,
                  (order.pricing || calcTotals(order.item.quantity)).total,
                )}
              </p>
            </div>

            {/* স্ট্যাটাস আপডেট */}
            <div className="bg-alt rounded-sm p-4 border border-line">
              <h3 className="text-[16px] font-serif font-bold mb-3">
                স্ট্যাটাস আপডেট
              </h3>
              <StatusSelect
                orderId={orderId}
                currentStatus={order.status || "pending"}
              />
              {isPending && (
                <span className="text-[11px] text-mute">আপডেট হচ্ছে...</span>
              )}
              {error && (
                <span className="text-[11px] text-err mt-1 block">{error}</span>
              )}
            </div>

            {/* স্ট্যাটাস হিস্টোরি */}
            {order.statusHistory && order.statusHistory.length > 0 && (
              <div className="bg-alt rounded-sm p-4 border border-line">
                <h3 className="text-[16px] font-serif font-bold mb-3">
                  স্ট্যাটাস হিস্টোরি
                </h3>
                <ul className="space-y-2">
                  {order.statusHistory.map((h, i) => (
                    <li key={i} className="text-[13px] text-mute">
                      {getStatusLabel(h.status, lang)} —{" "}
                      {new Date(h.changedAt).toLocaleDateString("bn-BD")} (
                      {h.changedBy || "সিস্টেম"})
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
