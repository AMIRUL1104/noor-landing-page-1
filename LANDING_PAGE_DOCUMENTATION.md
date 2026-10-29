# NOOR Fashion Landing Page — বিস্তারিত ডকুমেন্টেশন

> এই ডকুমেন্টেশন Next.js কোডবেস বিশ্লেষণ করে তৈরি করা হয়েছে। ভবিষ্যতে reusable landing page template এবং AI skill তৈরির জন্য এটি রেফারেন্স হিসেবে ব্যবহার করা যাবে।

---

## ১. Project Overview

- **প্রজেক্ট নাম:** `noor-hoodie-landing`
- **ব্র্যান্ড:** NOOR Fashion (NOOR Premium Export Quality Hoodie)
- **পণ্য:** প্রিমিয়াম এক্সপোর্ট কোয়ালিটি হুডি (১০০% ফ্লিস কটন, ৩২০–৩৫০ GSM)
- **মূল লক্ষ্য:** হুডি পণ্যের জন্য একটি উচ্চ-রূপান্তর (high-conversion) ল্যান্ডিং পেজ, যেখানে পণ্য বিবরণ, রঙ/সাইজ নির্বাচন, মূল্য হিসাব, অর্ডার ফর্ম এবং WhatsApp/কল ইন্টিগ্রেশন রয়েছে।
- **অ্যাডমিন ড্যাশবোর্ড:** অর্ডার ম্যানেজমেন্ট, স্ট্যাটাস আপডেট, অ্যানালিটিক্স ও ফিনান্সিয়াল রিপোর্টিং।
- **ভাষা:** বাংলা (ডিফল্ট) + ইংরেজি (language toggle)।
- **থিম:** Light/Dark (localStorage + inline script দিয়ে first-paint flash প্রতিরোধ)।

---

## ২. Technology Stack

- **Framework:** Next.js `^16.4.3` (App Router)
- **UI Library:** React `^19.3.1`, React DOM `^19.3.1`
- **Styling:** Tailwind CSS `^4.3.3` (`@tailwindcss/postcss`), custom CSS variables (`app/globals.css`)
- **Database:** MongoDB `^7.7.0` (native driver)
- **Validation:** Zod `^4.6.7`
- **Charts:** Recharts `^3.10.1`
- **Icons:** Lucide React `^1.63.0`
- **Language:** JavaScript (TypeScript নেই; `jsconfig.json` দিয়ে path alias)
- **Runtime:** Node.js (proxy/middleware Node runtime)
- **Fonts:** Google Fonts (Cormorant Garamond, Hind Siliguri, Noto Serif Bengali)
- **Notifications:** Telegram Bot API (অর্ডার নোটিফিকেশন)

### `package.json` স্ক্রিপ্ট
- `dev`: `next dev`
- `build`: `next build`
- `start`: `next start`
- `lint`: `eslint .`
- `test`: `node scripts/test-api.mjs`
- `admin:hash`: `node scripts/hash-password.mjs`

---
## ৩. Project Architecture

### Folder Structure (গুরুত্বপূর্ণ অংশ)
```
noor/
├── app/
│   ├── globals.css
│   ├── layout.js                 # Root layout, metadata, theme/lang init script
│   ├── page.js                   # Landing page composition
│   ├── robots.js
│   ├── admin/
│   │   ├── layout.js             # Admin layout (Header + main)
│   │   ├── page.js               # Overview (SummaryCards + AnalyticsCharts)
│   │   ├── login/page.js         # Admin login
│   │   └── orders/page.js        # Orders list (Search + Filters + OrderList)
│   └── api/orders/route.js       # Order submission API
├── components/
│   ├── Header.js, Hero.js, Gallery.js, Details.js, Delivery.js, Faq.js
│   ├── FooterCta.js, StickyOrderBar.js, OrderButton.js, OrderModal.js
│   ├── OrderProvider.js, Bi.js
│   └── admin/
│       ├── Header.js, AdminNav.js, SummaryCards.js, AnalyticsCharts.js
│       ├── Filters.js, SearchBox.js, OrderList.js, StatusSelect.js
│       └── OrderDetailModal.js
├── lib/
│   ├── products.js, rules.js, validation.js, i18n.js, prefs.js
│   ├── db.js, rateLimit.js, telegram.js, orderStatus.js
│   └── admin/
│       ├── session.js, auth.js, orders.js
├── proxy.js                      # Next.js 16 proxy (auth guard)
├── scripts/
│   ├── hash-password.mjs, test-admin.mjs, test-api.mjs
└── public/
    ├── images/, logo/, favicon, webmanifest
```

### Path Alias
- `jsconfig.json`: `@/*` → `./*`

### Data Flow (ল্যান্ডিং)
1. `OrderProvider` গ্লোবাল state (colorIdx, modal open) সরবরাহ করে।
2. `Hero` → `Gallery` (color selection) + price display।
3. `OrderButton`/`StickyOrderBar` → `OrderModal` ওপেন।
4. `OrderModal` → client-side validation (`lib/rules.js`) → `POST /api/orders`।
5. API → Zod validation (`lib/validation.js`) → MongoDB insert + Telegram notify → response।

### Data Flow (অ্যাডমিন)
1. `proxy.js` cookie চেক করে `/admin` রুট সুরক্ষিত রাখে।
2. `lib/admin/orders.js` সার্ভার ফাংশন (`getOrders`, `getOrderSummary`, `getOverviewAnalytics`, `getOrderById`, `updateOrderStatus`) — প্রতিটিতে `requireSession()`।
3. Client components (`OrderList`, `SummaryCards`, `AnalyticsCharts`) সার্ভার ফাংশন কল করে।
4. Status update → Server Action `setOrderStatus` → `updateOrderStatus`।

---\n'
## ৪. Page Structure (Landing)

`app/page.js` কম্পোজিশন:
1. `Header` (sticky, nav, theme/lang toggle)
2. `main#top`
   - `Hero` (gallery + headline + price + free delivery badge)
   - `Details` (features + specifications table)
   - `Delivery` (delivery charges comparison)
   - `Faq` (3 Q&A)
3. `FooterCta` (order + WhatsApp + call)
4. `StickyOrderBar` (mobile sticky price + order button)
5. `OrderModal` (order form dialog)

---\n'
## ৫. Design System

### Colors (CSS variables, `app/globals.css`)
- `--ink: #111111`, `--paper: #FAF8F2`, `--alt: #EFE9DA`, `--card: #FFFFFF`
- `--gold: #B89A5A`, `--gd: #6B5322`, `--mute: #46433B`, `--line: rgba(17,17,17,.24)`, `--err: #A81E16`
- Dark theme: `:root[data-theme="dark"]` এ ink/paper ইত্যাদি পরিবর্তিত।

### Typography
- `--sans: "Hind Siliguri"`, `--serif: "Noto Serif Bengali"`, `--disp: "Cormorant Garamond"`
- `html[lang="en"]` এ serif font swap।
- Base font-size: 16px (mobile), 16.5px (≥421px), 17px (≥761px)।

### Breakpoints (Tailwind v4 custom)
- `x3: 341px`, `x4: 421px`, `md: 761px`, `lg: 981px`
- Standard `sm: 640px` (default) ব্যবহার হয় responsive/hover-এ।

### Layout
- `.wrap`: width calc(100% - 24px) mobile, min(1160px, 100% - 40px) desktop।
- `.btn`, `.btn-o`, `.ib`, `.h2`, `.hero-h1`, `.big`, `.stick`, `.pop` component classes।

---\n'
## ৬. Component Documentation

### Landing Components
- `components/Header.js`: sticky header, logo, nav (desktop), theme/lang toggle (lucide? no, svg), `ib` icon buttons।
- `components/Hero.js`: gallery + headline + price + free delivery badge।
- `components/Gallery.js`: color carousel, swipe support, thumbnail strip, selected color context।
- `components/Details.js`: feature list + specification table (fabric, weight, colors, sizes)।
- `components/Delivery.js`: delivery charge comparison (1 vs 2+ hoodies)।
- `components/Faq.js`: 3 native `<details>` Q&A।
- `components/FooterCta.js`: order/WhatsApp/call CTAs।
- `components/StickyOrderBar.js`: mobile sticky price + order button।
- `components/OrderButton.js`: opens order modal।
- `components/OrderModal.js`: order form dialog (color/size/qty, customer info, validation, submit, success state)।
- `components/OrderProvider.js`: context for colorIdx + modal open।
- `components/Bi.js`: bilingual text renderer (shows bn/en based on html lang)।

### Admin Components
- `components/admin/Header.js`: admin header, session email, logout।
- `components/admin/AdminNav.js`: Overview/Orders tabs with active highlight।
- `components/admin/SummaryCards.js`: order counts (total/pending/confirmed/delivered/cancelled)।
## ৭. Features and Interactions

- Language toggle: `toggleLang()` in `lib/prefs.js`, updates `<html lang>` and localStorage, `Bi` component renders both languages।
- Theme toggle: `toggleTheme()`, dark/light, localStorage + inline script।
- Product gallery: color selection syncs with order modal (`OrderProvider.colorIdx`)।
- Quantity: +/- buttons, min 1, max 20 (`PRODUCT.maxQty`)।
- Price calculation: `calcTotals(qty)` → subtotal + shipping (free if qty ≥ 2)।
- Order form: name, phone, address, honeypot `website`।
- Validation: client (`lib/rules.js`) + server Zod (`lib/validation.js`)।
- Order submission: `POST /api/orders` with idempotency key, rate limits, duplicate detection, Telegram notify।
- Success modal: shows order ID, total, WhatsApp share।
- Admin: login (rate limited), session cookie, orders list, search, filter, status update, analytics।
- Real-time debounced search (500ms) on Orders page।
- Responsive: mobile cards for orders, sticky order bar, swipe gallery।

---\n'
- `components/admin/AnalyticsCharts.js`: financial cards + monthly/weekly/color/district charts।
- `components/admin/Filters.js`: status filter buttons।
- `components/admin/SearchBox.js`: debounced search input (500ms)।
- `components/admin/OrderList.js`: orders table (desktop) + cards (mobile) + details modal।
- `components/admin/StatusSelect.js`: status dropdown (server action)।
- `components/admin/OrderDetailModal.js`: order details + status update modal।

---\n'

## ৮. Styling and Responsive Design

- Tailwind CSS v4 with custom breakpoints (`x3`, `x4`, `md`, `lg`) and standard `sm: 640px`।
- Custom CSS variables for theming; dark mode via `data-theme`।
- Mobile-first utilities; `max-sm:` used to apply hover-final state on mobile।
- `globals.css` component classes: `.btn`, `.btn-o`, `.ib`, `.wrap`, `.h2`, `.hero-h1`, `.big`, `.stick`, `.pop`।
- Safe area insets for mobile (`env(safe-area-inset-*)`)।
- Reduced motion support (`prefers-reduced-motion`)।

## ৯. Product Configuration

- Single source of truth: `lib/products.js` (`PRODUCT` object)।
- `price: 550`, `shipping: 130`, `freeShippingMinQty: 2`, `maxQty: 20`।
- `colors`: 6 items (black, white, navy, maroon, brown, forest-green) with bn/en names and image paths।
- `sizes`: M (40), L (42), XL (44)।
- `calcTotals(qty)` computes subtotal, shipping, total।
- API never trusts client prices; recomputes from `PRODUCT`।

## ১০. Order Flow and Integrations

### Frontend
- `OrderModal` validates with `lib/rules.js` (name 2-80, phone regex, address 8-300)।
- Generates UUID idempotency key (crypto.randomUUID or fallback)।
- POST to `/api/orders` with JSON body।
- On success: shows order ID, total, WhatsApp share link।

### Backend (`app/api/orders/route.js`)
- Runtime: Node.js, dynamic force-dynamic।
- Security: same-origin check, content-type, body size limit (4096 bytes)।
- Zod strict schema validation (unknown keys rejected)।
- Rate limiting: per IP (5/10min), per phone (3/hour) via MongoDB `rate_limits` TTL।
- Duplicate detection: same idempotency key or same phone+item within 2 min।
- Price recomputed server-side from `lib/products.js`।
- Order ID generation: `NR-XXXXXX` (custom charset)।
- MongoDB insert with unique indexes (`orderId`, `idempotencyKey`)।
- Telegram notification (`lib/telegram.js`) — best-effort, never fails request।
- Honeypot `website` field → fake success, no storage।

### Database (MongoDB)
- Collections: `orders`, `rate_limits`, `admin_sessions`।
- Indexes: idempotencyKey (unique), orderId (unique), phone+createdAt, createdAt, status+createdAt, TTL on rate_limits/admin_sessions।

### Admin Auth
- Cookie-based session token (random, SHA-256 hashed in DB)।
- scrypt password hash (`ADMIN_PASSWORD_HASH` env)।
## ১১. Reusable Template Requirements

### Reusable parts
- `OrderProvider` pattern (global UI state)।
- `Bi` bilingual text component।
- `OrderModal` form structure (validation + submit + success)।
- Admin dashboard structure (Overview + Orders)।
- Tailwind design tokens (CSS variables)।

### Configuration-driven (change via config)
- `lib/products.js`: price, shipping, colors, sizes, maxQty।
- `lib/i18n.js`: all text (bn/en)।
- `app/layout.js`: metadata, fonts।
- `public/`: images, logo।
- `.env`: MONGODB_URI, TELEGRAM_*, ADMIN_*, RATE_LIMIT_SALT, SITE_URL।

### Project-specific
- Product-specific copy (Hero, Details, Delivery, Faq)।
- Admin analytics (district list, color mapping)।
- Brand assets।

---\n'
- Rate limiting on login।
- `proxy.js` guards `/admin` routes।

## ১২. Functional Requirements and Edge Cases

- Quantity range: 1–20 (`PRODUCT.maxQty`)।
- Phone normalization: Bangla digits, +88/88 prefixes, spaces/dashes removed।
- Address length: 8–300 chars (after clean)।
- Name length: 2–80 chars।
- Invalid input → field-level errors + focus।
- Network failure → user-friendly error banner।
- Rate limit → 429 with Retry-After।
- Duplicate order → returns existing order (no new row)।
- Honeypot filled → fake success।
- Mobile usability: sticky order bar, swipe gallery, card-based admin tables।
- Empty states: no orders, no district data।

## ১৩. Limitations and Improvements

- No TypeScript (JS only)।
- No test coverage for UI/admin (only API tests)।
- `middleware.js` deprecated (migrated to `proxy.js`)।
- District detection is substring-based (may mis-match)।
- No image optimization config beyond Next default।
- Admin analytics depend on MongoDB aggregation; large datasets may need indexing।
- No pagination on admin orders (page 1 only)।
- `getOrderById` uses `findOne` without index? `orderId` unique index exists।

## ১৪. Future AI Skill Guidelines

When generating a new landing page from this template:
1. Keep `lib/products.js` as single source of truth।
2. Reuse `OrderModal` validation + submit flow।
3. Preserve bilingual `Bi` component pattern।
4. Maintain mobile-first responsive classes and `max-sm:` hover-final rule।
5. Keep admin structure: proxy guard, session, server actions।
6. Use CSS variables for theming; avoid hard-coded colors।
7. Ensure API never trusts client prices।
8. Include rate limiting + honeypot + idempotency।

---\n'
### Confirmed vs UI-only
- **Confirmed working:** API order submission, validation, rate limiting, DB insert, Telegram notify, admin auth, order status update, analytics aggregation।
- **UI-only/not confirmed:** None identified beyond standard client interactions; all listed integrations have backend code।

---\n'
## ১৫. বিশ্লেষণ করা গুরুত্বপূর্ণ ফাইল

- `app/page.js`, `app/layout.js`, `app/globals.css`
- `app/admin/page.js`, `app/admin/layout.js`, `app/admin/login/page.js`, `app/admin/orders/page.js`
- `app/api/orders/route.js`, `app/robots.js`
- `components/*` (Header, Hero, Gallery, Details, Delivery, Faq, FooterCta, StickyOrderBar, OrderButton, OrderModal, OrderProvider, Bi)
- `components/admin/*` (Header, AdminNav, SummaryCards, AnalyticsCharts, Filters, SearchBox, OrderList, StatusSelect, OrderDetailModal)
- `lib/products.js`, `lib/rules.js`, `lib/validation.js`, `lib/i18n.js`, `lib/prefs.js`, `lib/db.js`, `lib/rateLimit.js`, `lib/telegram.js`, `lib/orderStatus.js`
- `lib/admin/session.js`, `lib/admin/auth.js`, `lib/admin/orders.js`
- `proxy.js`, `next.config.mjs`, `jsconfig.json`, `package.json`
- `scripts/test-api.mjs`, `scripts/test-admin.mjs`, `scripts/hash-password.mjs`

## ১৬. নিশ্চিতভাবে পাওয়া গেছে vs নিশ্চিত করা যায়নি

### নিশ্চিতভাবে পাওয়া গেছে
- সম্পূর্ণ ল্যান্ডিং পেজ কম্পোজিশন ও কম্পোনেন্ট।
- পণ্য কনফিগারেশন ও মূল্য হিসাব।
- অর্ডার ফর্ম, ভ্যালিডেশন, API, DB, rate limit, Telegram।
- অ্যাডমিন auth, session, orders, analytics।
- i18n, theme, prefs।
- Admin proxy guard।

### নিশ্চিত করা যায়নি / অনুমান নয়
- `lib/admin/session.js` এর বিস্তারিত ইমপ্লিমেন্টেশন (ফাইল পড়া হয়নি)।
- Production deployment specifics (hosting, env values)।
- Real-world traffic/performance metrics।
- `public/` এর সব অ্যাসেট তালিকা (favicon, manifest)।

---\n'