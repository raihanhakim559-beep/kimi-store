# Kimi Store Shoes 2025

A fully scaffolded multilingual Next.js 15 experience showcasing the entire Kimi Store Shoes sitemap—from the public storefront (men/women collections, blog, cart, checkout, CMS pages) to the secure admin workspace for internal merchandising teams.

## 🗺️ Storefront sitemap coverage
- **Home** hero with curated navigation, category tiles, blog teasers, and wishlist/account CTAs.
- **Men shoes** (`/men`) with Sneakers, Running, Sandals subpages (`/men/[category]`).
- **Women shoes** (`/women`) with Lifestyle, Training, Heels subpages (`/women/[category]`).
- **Merchandising flows:** New Arrivals, Sale, Product Details (`/products/[slug]`).
- **Content hub:** Blog listing + dynamic article pages, About, Contact, FAQ.
- **Commerce flow:** Wishlist, Cart, Checkout, Account Login/Registration, Account Dashboard (order tracking).

## �️ Admin dashboard sitemap
- **Admin login** (`/admin/login`) with OTP mock form.
- **Dashboard overview** (`/admin`).
- **Management modules:** Products, Categories, Orders, Customers, Blog, CMS Pages, Discounts, Admin Users.

Each admin module uses shared UI that highlights current metrics, CTA buttons, and placeholder workflow cards ready to be wired to live data sources.

## ⚙️ Tech stack
- Next.js 15 (App Router) + React 19
- TypeScript + ESLint + Prettier
- Tailwind CSS 4 utility classes
- next-intl for locale-aware routing (`/en`, `/ms`)
- next-auth scaffolding (GitHub + Google + Apple providers ready)
- Shadcn button primitives, Lucide icons
- Jest + Testing Library, Playwright for E2E
- Drizzle ORM + Neon-ready config, Stripe SDK hooks

## 🚀 Getting started
```bash
npm install
npm run dev
```
Open `http://localhost:3000/en` (or `/ms`) to browse the storefront. Admin routes live under `/en/admin`.

Add environment variables by copying `.env.example` → `.env` and filling the values required by `src/env.mjs` (Stripe keys, NextAuth secrets, etc.).

### 🔔 Activation CRM automation
- Every activation email, reminder, override, and completion is tracked in the `activation_event` table so the admin Customers module displays outreach counts and timestamps.
- Configure the protected reminder endpoint to keep inactive users warm:

```bash
curl -X POST \
	-H "Authorization: Bearer $ONBOARDING_CRON_SECRET" \
	"${APP_URL}/api/internal/onboarding-reminders"
```

Trigger it via your scheduler (Vercel Cron, GitHub Actions, etc.) every few hours. A `24h` reminder fires once the first invite is at least a day old, and a `72h` reminder goes out three days later. Set `ONBOARDING_CRON_SECRET` to guard the route.

## 🧪 Quality checks
Run whichever checks you need before shipping:
- `npm run lint`
- `npm run test`
- `npm run e2e`

## 📁 Notable paths
```
src/app/[locale]/(storefront)  # All user-facing pages and route groups
src/app/[locale]/(admin)/admin # Admin layout, login, and management modules
src/lib/data/storefront.ts     # Source of truth for categories, products, blog, CMS copy, admin metrics
src/components/admin-module-template.tsx # Reusable admin module UI shell
```

## 📌 Roadmap ideas
- Hook product/category data to Drizzle models and Stripe inventory webhooks.
- Replace placeholder checkout and login flows with real server actions.
- Expand localization strings beyond `home` namespace for full Malay support.
- Connect admin modules to role-based auth and live analytics.

---
Crafted for the "Kimi Store Shoes 2025" brief. PRs and feedback welcome! ✨