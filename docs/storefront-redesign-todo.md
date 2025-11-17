# Storefront Redesign Tracker

> **Brief reminder**: The inspirational mockups are treated as guiding references. Final implementations should feel native to Kimi Store’s brand system, not 1:1 replicas.

## Goals & Principles
- Ship a cohesive, responsive UI system for every route under `src/app/[locale]/(storefront)`.
- Lean into **shadcn/ui** primitives (Card, Navigation Menu, Tabs, Badge, Tooltip, Sheet, Carousel) for consistency and velocity.
- Maintain localization support and Drizzle-powered data hooks.
- Keep admin/storefront parity where interactions overlap (wishlist, account, etc.).

## Page & Component Checklist
| Priority | Route / Feature | File(s) | Status | Notes |
| --- | --- | --- | --- | --- |
| P0 | Global layout & header/footer system | `app/[locale]/(storefront)/layout.tsx`, shared nav/search components | ⭕ Pending | Rebuild shell with sticky nav, mobile sheet nav (shadcn `sheet`, `navigation-menu`). |
| P0 | Home / landing | `app/[locale]/(storefront)/page.tsx` | ⭕ Pending | Replace current literal mockup copy with bespoke hero, story grid, live data highlights, shadcn cards/carousel. |
| P0 | Catalog overview (Men) | `app/[locale]/(storefront)/men/page.tsx`, `men/[category]/page.tsx` | ⭕ Pending | Harmonize filters + tiles using `card`, `badge`, `accordion` for facets. |
| P0 | Catalog overview (Women) | `.../women/page.tsx`, `women/[category]/page.tsx` | ⭕ Pending | Mirror men’s experience with gender-specific storytelling. |
| P0 | New Arrivals spotlight | `.../new-arrivals/page.tsx` | ⭕ Pending | Build dynamic drop timeline + carousel (shadcn `carousel`). |
| P0 | Sale hub | `.../sale/page.tsx` | ⭕ Pending | Introduce promo banner, compare-at pricing cards, promo code CTA. |
| P1 | Product detail | `.../products/[slug]/page.tsx` + gallery components | ⭕ Pending | Upgrade gallery (shadcn `carousel`), sticky purchase panel, reviews accordion. |
| P1 | Wishlist & account onboarding | `.../wishlist/page.tsx`, `account/onboarding/page.tsx`, `account/dashboard/page.tsx` | ⭕ Pending | Align UI with new cards, show progress trackers (shadcn `progress`). |
| P1 | Cart & checkout | `.../cart/page.tsx`, `.../checkout/page.tsx` | ⭕ Pending | Two-column layout with order summary card, express buttons (shadcn `sheet`, `input`). |
| P1 | Contact & FAQ | `.../contact/page.tsx`, `.../faq/page.tsx` | ⭕ Pending | Use `accordion` for FAQs, embed contact form using shadcn `form` primitives. |
| P1 | Blog index & story detail | `.../blog/page.tsx`, `.../blog/[slug]/page.tsx` | ⭕ Pending | Redesign hero, cards, in-article TOC using `toc`, `badge` for categories. |
| P2 | Search results | `.../search/page.tsx` | ⭕ Pending | Introduce filter sheet on mobile, result cards w/ quick add. |
| P2 | About / brand story | `.../about/page.tsx` | ⭕ Pending | Timeline + stat bars (shadcn `progress`, `tooltip`). |
| P2 | Localization polish | Copy data in `lib/data/storefront.ts`, `messages/*.json` | ⭕ Pending | Audit new text for translation coverage.

## Shadcn/ui Component Plan
- Already present: `button`. 
- To add via `npx shadcn-ui@latest add ...` (ordered by need):
  1. `navigation-menu`
  2. `sheet`
  3. `card`
  4. `badge`
  5. `tabs`
  6. `accordion`
  7. `carousel`
  8. `tooltip`
  9. `progress`
  10. `form` (input, label, textarea, checkbox)

Keep this list updated as components land.

## Next Steps
1. Finalize visual language (spacing, typography scale, gradients) so it can be reused across pages.
2. Implement layout + home page overhaul first (highest visibility).
3. Continue down the checklist, marking ✅ as each page ships.
4. Log any schema/i18n updates alongside UI work.
