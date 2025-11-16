DB Schema Overview — Kimi Store (created 2025-11-16)

Purpose

This memory captures the current Drizzle database schema implemented in `src/lib/schema.ts`. It documents tables, enums, relationships, important columns and constraints, and operational notes for migrations and seeding. Use this as the canonical reference for future developer tasks (migrations, queries, admin UI, seeding, etc.).

High-level domain areas

- Auth (existing): users, accounts, sessions, verificationToken, authenticators
- Commerce: categories, tags, products, product_images, product_variants, product_tag (many-to-many), wishlists, wishlist_item, carts, cart_item, addresses, promo_code, orders, order_item, order_applied_promotion, reviews
- Enums: product_gender, product_status, cart_status, order_status, payment_status, fulfillment_status, discount_type

Key tables and noteworthy fields/constraints

1) users
- id (text PK, UUID default)
- name, email (unique), emailVerified (timestamp), image
- stripeCustomerId (text, unique)
- isActive (boolean default false)

2) accounts / sessions / verificationToken / authenticators
- Standard NextAuth adapter-style tables are present and wired to `users` via FK cascade.

3) categories
- id (text PK)
- name, slug (unique), description
- gender (product_gender enum) default 'unisex'
- parentCategory relationship implemented via a foreign key `parentCategoryId` -> categories.id with ON DELETE SET NULL (implemented using foreignKey helper to avoid self-ref TypeScript cycle)
- isActive, timestamps

4) tags
- id, name, slug (unique), createdAt

5) products
- id, categoryId -> categories.id (FK, not null)
- name, slug (unique), summary, description
- gender (product_gender), status (product_status)
- price stored as integer (cents), currency default 'MYR'
- sku unique, brand, isFeatured, metadata (jsonb), timestamps

6) product_images
- productId -> products.id (cascade)
- url, alt, position, isPrimary

7) product_variants
- productId -> products.id (cascade)
- sku (unique), size, color, stock (integer), price (optional override in cents)

8) product_tag (productTags)
- composite PK on (productId, tagId)

9) wishlists / wishlist_items
- wishlist linked to user (one wishlist per user enforced by unique userId)
- wishlist_item composite PK (wishlistId, productVariantId)

10) carts / cart_items
- cart has userId (nullable), sessionId (unique), status (cart_status enum), currency, subtotal, discounts, taxes, shipping, timestamps
- cart_item stores productVariantId, quantity, unitPrice, lineTotal

11) addresses
- userId FK, address fields, isDefaultShipping/isDefaultBilling booleans, country default 'MY'

12) promo_codes
- code (unique), discountType (discount_type enum), value (integer), maxRedemptions, redemptionCount, startsAt/endsAt, isActive

13) orders / order_items / order_applied_promotion
- orders: orderNumber unique, userId (nullable), cartId (nullable), status (order_status), paymentStatus (payment_status), fulfillmentStatus (fulfillment_status), currency, totals, shippingAddressSnapshot/billingAddressSnapshot (jsonb), stripe ids (paymentIntent/checkout session), placedAt
- order_items: snapshot fields (name, sku, size, color, price, quantity, line total) plus JSON snapshot to preserve product state at purchase
- order_applied_promotion: composite PK (orderId, promoCodeId) mapping applied discounts

14) reviews
- productId -> products.id, userId -> users.id
- rating integer (1–5), title, comment, isPublished boolean, timestamps

Enums

- product_gender: ["men","women","unisex"]
- product_status: ["draft","active","archived"]
- cart_status: ["active","converted","abandoned"]
- order_status: ["pending","paid","fulfilled","cancelled","refunded"]
- payment_status: ["pending","requires_action","succeeded","refunded","failed"]
- fulfillment_status: ["pending","processing","shipped","delivered","cancelled"]
- discount_type: ["percentage","fixed"]

Relationship & delete semantics (summary)

- Many child rows use ON DELETE CASCADE where a parent deletion should remove children (e.g., product_images, product_variants, product_tags, wishlist_items, cart_items, order_items when appropriate).
- Where preserving historical data is important, relations are set to RESTRICT or SET NULL instead of CASCADE (e.g., products.categoryId uses RESTRICT to avoid accidental deletion of categories with products; orders keep userId or cartId as nullable to preserve order history).
- Order snapshots use jsonb: shippingAddressSnapshot, billingAddressSnapshot, and order_item.snapshot to retain historical purchase data even if referenced product rows change later.

Design decisions & rationale

- Use integer cents for money (avoid floating issues). Currency kept as string (default MYR).
- Use UUID-like text primary keys (crypto.randomUUID()) to fit serverless DB patterns and avoid numeric sequences that can conflict across branches/environments.
- Keep product variant as separate table to support sizes/colors/stock at variant level.
- Wishlist linked to user with unique constraint (one wishlist per user). If multiple wishlists required later, change schema accordingly.
- Promo codes stored with redemption counts and start/end times to support expiry and limited usage.

Operational notes and developer commands

- Generate migrations with Drizzle CLI (example naming):
  - npm run drizzle:generate -- --name init_schema
  - npm run drizzle:generate -- --name add_products_table
- Apply migrations (example):
  - npm run drizzle:push
  - or use drizzle-kit migrate commands if you prefer migration plan/apply flow depending on drizzle-kit version.

- Seed data suggestions:
  - seed categories, tags, a few products with images/variants, an admin user, and a promo code. Keep a small seed script (scripts/seed.ts) that uses `db` connection.

- Indexing & performance:
  - Consider indexes on: products.slug, products.sku, product_variants.sku, tags.slug, categories.slug, orders.orderNumber, promo_codes.code, cart.sessionId, users.email.
  - Add partial or multi-column indexes for common filter queries (e.g., products by categoryId + status, product_variants by sku + productId).

- Migration safety:
  - For production, add nullable columns and backfill before making NOT NULL constraints. Use `SET DEFAULT` + UPDATE flows in migrations to avoid downtime.

Where to find schema

- The authoritative schema file is `src/lib/schema.ts` (Drizzle table definitions). Drizzle config is `drizzle.config.ts` and points at this schema.

Next suggested tasks

- Generate and review SQL migration scripts (drizzle generate) and apply to a dev Neon DB.
- Create seed script and small ER diagram for documentation.
- Add documentation in repo (e.g., `docs/db-schema.md`) with this content and a generated ERD PNG for quick onboarding.

If you want I can also:
- Generate the migration SQL files here and commit them.
- Create a `scripts/seed.ts` file with sample seed data and a `npm` script to run it.
- Produce a simple ER diagram file (Mermaid syntax) and save it as `docs/db-schema.mmd`.

