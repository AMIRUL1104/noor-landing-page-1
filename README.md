# NOOR Hoodie Landing Page (Next.js App Router + JavaScript + Tailwind CSS)

## চালানোর নিয়ম

```bash
npm install
cp .env.example .env.local      # তারপর ভ্যালুগুলো পূরণ করুন
npm run dev                     # http://localhost:3000
npm run build && npm start      # production
npm run lint
npm test                        # API logic টেস্ট (ফেক DB + ফেক Telegram, কোনো credential লাগে না)
```

## Environment variables (সবই server-side, কোনোটিই `NEXT_PUBLIC_` নয়)

| নাম                                      | কাজ                                                         |
| ---------------------------------------- | ----------------------------------------------------------- |
| `MONGODB_URI`, `MONGODB_DB`              | MongoDB Atlas সংযোগ                                         |
| `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` | নতুন অর্ডারের নোটিফিকেশন                                    |
| `RATE_LIMIT_SALT`                        | IP/ফোন hash করার গোপন স্ট্রিং (`openssl rand -hex 32`)      |
| `SITE_URL`                               | same-origin চেক ও metadata (যেমন `https://your-domain.com`) |

`.env*` ফাইল `.gitignore`-এ আছে; শুধু `.env.example` কমিট হবে।

## কোথায় কী

- `lib/products.js`: দাম (৳550), ডেলিভারি (৳130, ২টি বা বেশিতে ফ্রি), রং, সাইজ। UI ও API দুটোই এখান থেকে নেয়। দাম বদলাতে শুধু এই ফাইল।
- `app/api/orders/route.js`: অর্ডার API (validation, duplicate/idempotency, rate limit, server-side pricing, DB, Telegram)।
- `lib/validation.js` (Zod), `lib/rules.js` (ব্রাউজার ও সার্ভারের shared নিয়ম), `lib/rateLimit.js`, `lib/telegram.js`, `lib/db.js`।
- `components/`: UI। `lib/i18n.js`: বাংলা/English টেক্সট।
- MongoDB ইন্ডেক্স প্রথম অর্ডারে নিজে তৈরি হয় (`orders`, `rate_limits` TTL)।

## নোট

- ফন্ট `<link>` দিয়ে Google Fonts থেকে লোড হয় (`app/layout.js`)। চাইলে `next/font/google`-এ নেওয়া যায়।
- হোস্টিং Vercel ধরা হয়েছে (IP পাওয়া যায় `x-forwarded-for` থেকে)। অন্য হোস্টে proxy কনফিগার ঠিক আছে কিনা দেখুন।
- প্রথম লাইভ টেস্টে নিজের Atlas ও Telegram bot দিয়ে একটা অর্ডার দিয়ে যাচাই করুন।
