import { redirect } from "next/navigation";

/**
 * ড্যাশবোর্ড রুট পেজ (ইন্টারিম)।
 * ড্যাশবোর্ড ফিচার পরে বাস্তবায়ন করা হবে। এখন শুধুমাত্র লগইন পেজে রিডাইরেক্ট করে।
 */
export default function AdminPage() {
  redirect("/admin/login");
}