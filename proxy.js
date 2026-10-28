import { NextResponse } from "next/server";

/**
 * Next.js proxy (Next.js 16: middleware renamed to proxy).
 * শুধুমাত্র /admin/:path*-এ সক্রিয়।
 * কুকি নেইলে /admin/login-এ রিডাইরেক্ট করে।
 * /admin-এর সব রেসপন্সে no-store ও noindex হেডার যোগ করে।
 */
export function proxy(req) {
  const { pathname } = req.nextUrl;

  // শুধুমাত্র /admin**-এর জন্য সুরক্ষা
  if (pathname.startsWith("/admin")) {
    const cookie =
      req.cookies.get("__Host-admin_session")?.value ||
      req.cookies.get("admin_session")?.value;

    // লগইন পেজে কুকি থাকলে ড্যাশবোর্ডে পাঠানো যেতে পারে (অপশনাল)
    if (pathname === "/admin/login" && cookie) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }

    // অন্যান্য /admin রুটে কুকি নেইলে লগইন পেজে পাঠানো হবে
    if (!cookie && pathname !== "/admin/login") {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }

  const res = NextResponse.next();

  // /admin-এর সব রেসপন্সে no-store ও noindex যোগ করা
  if (pathname.startsWith("/admin")) {
    res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
  }

  return res;
}

export const config = {
  matcher: ["/admin/:path*"],
};
