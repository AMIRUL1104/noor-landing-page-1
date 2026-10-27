// অর্ডার স্ট্যাটাস ধ্রুবক (plan.tx অনুযায়ী: pending, confirmed, delivered, cancelled)
export const ORDER_STATUSES = [
  { value: "pending", label: { bn: "পেন্ডিং", en: "Pending" } },
  { value: "confirmed", label: { bn: "কনফার্মড", en: "Confirmed" } },
  { value: "delivered", label: { bn: "ডেলিভারড", en: "Delivered" } },
  { value: "cancelled", label: { bn: "ক্যানসেলড", en: "Cancelled" } },
];

export function getStatusLabel(status, lang = "bn") {
  const found = ORDER_STATUSES.find((s) => s.value === status);
  return found ? found.label[lang] : status;
}

export function getStatusColor(status) {
  switch (status) {
    case "pending":
      return "text-yellow-700 bg-yellow-100 border-yellow-200";
    case "confirmed":
      return "text-blue-700 bg-blue-100 border-blue-200";
    case "delivered":
      return "text-green-700 bg-green-100 border-green-200";
    case "cancelled":
      return "text-red-700 bg-red-100 border-red-200";
    default:
      return "text-ink bg-alt border-line";
  }
}