"use server";

import { updateOrderStatus } from "@/lib/admin/orders";

/** অর্ডার স্ট্যাটাস আপডেট সার্ভার অ্যাকশন (Zod ও সেশন যাচাইসহ) */
export async function setOrderStatus(formData) {
  if (!formData || typeof formData.get !== "function") {
    return { error: "invalid_request" };
  }

  const orderId = formData.get("orderId");
  const status = formData.get("status");

  return updateOrderStatus(
    typeof orderId === "string" ? orderId : "",
    typeof status === "string" ? status : ""
  );
}