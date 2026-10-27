import { login } from "@/lib/admin/auth";

const ERROR_MESSAGES = {
  invalid_request: "অনুরোধ সঠিক নয়। আবার চেষ্টা করুন।",
  invalid_credentials: "ইমেইল বা পাসওয়ার্ড সঠিক নয়।",
  rate_limited: "অনেকবার চেষ্টা করা হয়েছে। কিছুক্ষণ পরে আবার চেষ্টা করুন, অথবা কল করুন।",
};

export default async function LoginPage({ searchParams }) {
  const resolved = await searchParams;
  const params = Object.fromEntries(Object.entries(resolved || {}));
  const errorCode = params.error;
  const error = errorCode ? ERROR_MESSAGES[errorCode] || ERROR_MESSAGES.invalid_credentials : null;

  return (
    <div className="min-h-[calc(100vh-60px)] flex items-center justify-center bg-paper">
      <div className="w-full max-w-[360px] px-3.5 py-8">
        <div className="bg-paper rounded-sm border border-line p-6">
          <h1 className="text-[24px] font-serif font-bold mb-6 text-center">লগইন</h1>
          {error && (
            <p className="mb-4 text-[14px] text-err text-center">{error}</p>
          )}
          <form action={login} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-[15px] font-semibold">ইমেইল</label>
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
                className="min-h-[50px] w-full rounded-xs border-[1.5px] border-line bg-paper px-3.5 py-2.5 text-[17px] text-ink focus:border-gold focus:outline-3 focus:outline-offset-1 focus:outline-gold"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[15px] font-semibold">পাসওয়ার্ড</label>
              <input
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="min-h-[50px] w-full rounded-xs border-[1.5px] border-line bg-paper px-3.5 py-2.5 text-[17px] text-ink focus:border-gold focus:outline-3 focus:outline-offset-1 focus:outline-gold"
              />
            </div>
            <button
              type="submit"
              className="btn w-full"
            >
              লগইন
            </button>
          </form>
          <p className="mt-4 text-[13px] text-center text-mute">
            ল্যান্ডিং পেজে কোনো লগইন লিঙ্ক নেই। শুধুমাত্র আপনি এই পেজটি জানেন।
          </p>
        </div>
      </div>
    </div>
  );
}