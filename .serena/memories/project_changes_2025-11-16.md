Summary of changes made on 2025-11-16 for the kimi-store project

- Removed environment variable: STRIPE_SUBSCRIPTION_PRICE_ID
  - Files edited: src/env.mjs (removed schema/runtime entry), .env.example (removed line), .github/workflows/playwright.yml (removed mapping)
  - Code refactor: src/actions/create-checkout-session.ts now throws a clear Error if called; src/components/stripe-button.tsx returns null; page no longer imports or shows upgrade button.

- Removed commitlint integration
  - package.json: removed @commitlint/cli and @commitlint/config-conventional from devDependencies
  - .husky/commit-msg: deleted (stub previously replaced then removed)
  - commitlint.config.cjs: removed (was stubbed then deleted)
  - README.md: removed feature listing for commitlint
  - Note: package-lock.json still contains commitlint entries; recommend running npm install / regenerate lockfile locally to update.

- Locales changed to English and Malay only
  - Updated src/i18n/routing.ts to locales: ["en","ms"]
  - Updated src/components/lang-switcher.tsx to toggle between /en and /ms
  - messages/ms.json added (initially copied from en.json as placeholders)
  - messages/pl.json neutralized/removed

- Drizzle helper scripts added
  - package.json: added scripts: drizzle, drizzle:generate, drizzle:push, drizzle:pull, drizzle:migrate:up, drizzle:migrate:down, drizzle:migrate:status
  - drizzle.config.ts already present and points to src/lib/schema.ts

- Database schema implemented in Drizzle (src/lib/schema.ts)
  - Added commerce domain tables and enums: categories, tags, products, product_images, product_variants, product_tags, wishlists, wishlist_items, carts, cart_items, addresses, promo_codes, orders, order_items, order_applied_promotions, reviews, enums for statuses
  - Auth tables (users, accounts, sessions, verificationTokens, authenticators) preserved and integrated
  - Typecheck passed (tsc --noEmit ran successfully)
  - Next steps: generate drizzle migrations and run them against the Neon DB; optional seed scripts.

Operational notes / next steps
- Regenerate package-lock.json locally and run npm install to remove commitlint artifacts from lockfile and node_modules.
- Run: npm run drizzle:generate -- <args> to produce SQL migrations for the DB schema.
- If further modifications are requested, there are clear files to edit: src/lib/schema.ts, package.json, messages/*.json, src/i18n/routing.ts.

This memory is intended to help future tasks and avoid repeating context gathering about the above changes.