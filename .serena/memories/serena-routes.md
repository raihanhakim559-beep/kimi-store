Routes implemented (localized under `/:locale` e.g., /en or /ms):

Storefront:
- `/` — Home
- `/men` — Men overview
- `/men/[category]` — Men category detail (category slugs: sneakers, running, sandals)
- `/women` — Women overview
- `/women/[category]` — Women category detail (lifestyle, training, heels)
- `/new-arrivals` — New arrivals (products with status `new`)
- `/sale` — Sale collection (products with status `sale`)
- `/products/[slug]` — Product detail (kinetic-air-runner, orbit-city-sneaker, shoreline-relief-sandal, aura-lift-lifestyle, pulse-sync-trainer, zenith-form-heel)
- `/blog` — Blog index
- `/blog/[slug]` — Article pages (elevate-the-daily-commute, tempo-training-reset, heels-that-go-the-distance)
- `/about` — About page
- `/contact` — Contact page (uses cmsPages.contact)
- `/faq` — FAQ
- `/wishlist` — Wishlist (empty-state & tips)
- `/cart` — Cart page
- `/checkout` — Checkout flow
- `/account/login` — Account login (magic link)
- `/account/dashboard` — Account dashboard

Admin (under `/admin`):
- `/admin` — Admin dashboard overview
- `/admin/login` — Admin login
- `/admin/products` — Product management
- `/admin/categories` — Category management
- `/admin/orders` — Order management
- `/admin/customers` — Customer management
- `/admin/discounts` — Discounts management
- `/admin/blog` — Blog management
- `/admin/cms` — CMS page editor
- `/admin/admin-users` — Admin users/roles

APIs / Special routes:
- `/api/auth/[...nextauth]` — NextAuth auth routes
- `/api/stripe/webhook` — Stripe webhook
- `/robots.txt` and `/sitemap.xml` — generated via app actions

Notes:
- Many UI strings are now stored as Copy objects in `src/lib/data/storefront.ts` and need to be translated at render-time using the locale.
- Generated static params for blog and products exist (pages call generateStaticParams). 

Created: 2025-11-17
