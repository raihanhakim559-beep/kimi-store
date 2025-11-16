Project: Kimi Store (Next.js 15 App Router)

Short summary:
- Storefront + Admin scaffold implemented under `src/app/[locale]` using next-intl for locales `en` and `ms`.
- Data layer moved to locale-aware Copy objects in `src/lib/data/storefront.ts` (uses `makeCopy` and `Copy` type).
- Key UI: storefront pages (home, men/women, product, blog, cart, checkout, account) and admin modules (products, categories, orders, customers, blog, cms, discounts, admin-users).
- i18n: `messages/en.json` and `messages/ms.json` exist for message-level translations; `src/lib/i18n/copy.ts` provides `makeCopy`, `translateCopy`, and `translateCopies` utilities.

Recent changes:
- Converted `storefront.ts` to export Copy-typed strings and data (categories, products, blogPosts, faqs, cmsPages, navs, adminModules, dashboard data, etc.).
- Many page components read from `@/lib/data/storefront` and currently expect Copy objects (some components still render raw Copy objects directly — next step is to pipe them through `translateCopy` in each page when locale is available).

Important files / locations:
- `src/lib/data/storefront.ts` — localized copy data (authoritative content source for UI strings in pages/components).
- `src/lib/i18n/copy.ts` — Copy type + helpers.
- `src/i18n/routing.ts`, `src/i18n/request.ts`, `src/middleware.ts` — locale routing & request config.
- `messages/en.json`, `messages/ms.json` — runtime messages for next-intl.

Assumptions made:
- Default locale `en` used when missing translation.
- Components will later call `translateCopy` or a wrapper to render localized strings.

Next recommended steps:
1. Update pages/components to translate Copy objects using the locale from `request` or `NextIntlClientProvider` context.
2. Update unit tests to assert translated text for `en` and `ms`.
3. Run lint and tests after translation wiring.

Created: 2025-11-17
