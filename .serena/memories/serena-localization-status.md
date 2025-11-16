Localization status snapshot:

- Locales supported: ["en", "ms"], default: "en" (see `src/i18n/routing.ts`).
- `src/lib/i18n/copy.ts` defines Copy = Record<Locale,string> and helpers `makeCopy`, `translateCopy`, `translateCopies`.
- `src/lib/data/storefront.ts` converted to use Copy for most content (categories, products, blogPosts, faqs, contactChannels, cmsPages, adminModules, dashboardOverview, wishlistCopy, checkoutSteps, etc.).
- Runtime messages live in `messages/en.json` and `messages/ms.json` for next-intl-provided messages.

Gaps / Next steps:
1. Pages/components still directly render Copy objects in many files (e.g., `HomePage`, `MenCategoryPage`, `ProductDetailPage`, `WishlistPage`, `NewArrivalsPage`, `AdminModuleTemplate`, etc.). Those must call `translateCopy` with the active locale or be wrapped with a small utility (e.g., `t(copy)` in a localized context).
2. Add a small helper hook or utility to fetch current locale server/client-side and translate (e.g., `useLocale` + `translateCopy`) to avoid repetitive code.
3. Update tests to expect translated strings for `en` and `ms`.

Created: 2025-11-17
