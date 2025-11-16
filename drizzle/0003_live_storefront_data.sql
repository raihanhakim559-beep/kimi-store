ALTER TABLE "category" ADD COLUMN IF NOT EXISTS "metadata" jsonb;

-- Seed primary storefront categories
INSERT INTO "category" ("id", "name", "slug", "description", "gender", "metadata")
VALUES
  (
    'cat_sneakers',
    'Sneakers',
    'sneakers',
    'Street-ready silhouettes with breathable knit uppers and responsive midsoles.',
    'men',
    '{"heroCopy":"Built for downtown commutes and late-night sessions.","features":["Recycled Flyknit","BubbleSoft cushioning","Grippy city tread"]}'::jsonb
  ),
  (
    'cat_running',
    'Running',
    'running',
    'Distance-tuned foams and rocker geometry for personal best pacing.',
    'men',
    '{"heroCopy":"Trim grams, add miles, keep energy high.","features":["NitroVault midsole","Stability rails","Four-foot strike map"]}'::jsonb
  ),
  (
    'cat_sandals',
    'Sandals',
    'sandals',
    'Water-friendly straps with plush cushioning for post-session recovery.',
    'men',
    '{"heroCopy":"Slip on comfort that still looks intentional.","features":["Ripple traction","MemoryCloud footbed","Salt & sun proof"]}'::jsonb
  ),
  (
    'cat_lifestyle',
    'Lifestyle',
    'lifestyle',
    'Soft leathers and tonal palettes that elevate everyday looks.',
    'women',
    '{"heroCopy":"City tailoring meets lounge-level comfort.","features":["Foam-wrapped collar","CloudFlex outsole","Stain guard upper"]}'::jsonb
  ),
  (
    'cat_training',
    'Training',
    'training',
    'Low-to-ground stability and wraparound support for everything studio.',
    'women',
    '{"heroCopy":"Dialed for HIIT, reformer, and every hybrid workout in between.","features":["Tri-anchored lacing","Stability chassis","360° rubber wraps"]}'::jsonb
  ),
  (
    'cat_heels',
    'Heels',
    'heels',
    'Statement heels with dual-density cushioning and slip-resistant rubber.',
    'women',
    '{"heroCopy":"All-day poise with midnight durability.","features":["Anti-sway shank","Sculpted arch support","Softskn straps"]}'::jsonb
  )
ON CONFLICT ("slug") DO UPDATE SET
  "name" = EXCLUDED."name",
  "description" = EXCLUDED."description",
  "gender" = EXCLUDED."gender",
  "metadata" = EXCLUDED."metadata";

-- Seed hero products mirrored from the placeholder content
INSERT INTO "product" (
  "id",
  "categoryId",
  "name",
  "slug",
  "summary",
  "description",
  "gender",
  "status",
  "price",
  "currency",
  "sku",
  "brand",
  "isFeatured",
  "metadata"
)
VALUES
  (
    'prod_kinetic',
    'cat_running',
    'Kinetic Air Runner',
    'kinetic-air-runner',
    'Featherweight trainer with lateral carbon rods to return more energy every stride.',
    'Featherweight trainer with lateral carbon rods to return more energy every stride.',
    'men',
    'active',
    19500,
    'USD',
    'KS-001',
    'Kimi Labs',
    true,
    '{"specs":["6 mm drop","248 g","NitroVault + Pebax plate"],"colors":["Obsidian","Solar Burst","Glacier"],"badges":["new"]}'::jsonb
  ),
  (
    'prod_orbit',
    'cat_sneakers',
    'Orbit City Sneaker',
    'orbit-city-sneaker',
    'Minimal leather upper paired with sculpted BubbleSoft cushioning for the commute.',
    'Minimal leather upper paired with sculpted BubbleSoft cushioning for the commute.',
    'men',
    'active',
    16500,
    'USD',
    'KS-002',
    'Kimi Labs',
    true,
    '{"specs":["Recycled leather","BubbleSoft midsole","CityGrip outsole"],"colors":["Stone","Indigo"],"badges":[]}'::jsonb
  ),
  (
    'prod_shoreline',
    'cat_sandals',
    'Shoreline Relief Sandal',
    'shoreline-relief-sandal',
    'Recovery slide with dual-density memory foam and drainage grooves.',
    'Recovery slide with dual-density memory foam and drainage grooves.',
    'men',
    'active',
    9500,
    'USD',
    'KS-003',
    'Kimi Labs',
    false,
    '{"specs":["HydroSafe straps","MemoryCloud footbed","Ripple traction"],"colors":["Deep Sea","Signal Orange"],"badges":["sale"]}'::jsonb
  ),
  (
    'prod_aura',
    'cat_lifestyle',
    'Aura Lift Lifestyle',
    'aura-lift-lifestyle',
    'Tone-on-tone leather sneaker with Softskn lining and hidden wedge lift.',
    'Tone-on-tone leather sneaker with Softskn lining and hidden wedge lift.',
    'women',
    'active',
    17800,
    'USD',
    'KS-004',
    'Kimi Labs',
    true,
    '{"specs":["Softskn leather","CloudFlex outsole","Hidden 20 mm lift"],"colors":["Ivory","Wild Berry"],"badges":["new"]}'::jsonb
  ),
  (
    'prod_pulse',
    'cat_training',
    'Pulse Sync Trainer',
    'pulse-sync-trainer',
    'Studio sneaker with 360° rubber wraps and tri-anchored lacing for explosive sets.',
    'Studio sneaker with 360° rubber wraps and tri-anchored lacing for explosive sets.',
    'women',
    'active',
    16200,
    'USD',
    'KS-005',
    'Kimi Labs',
    false,
    '{"specs":["Tri-anchored lacing","Low 3 mm drop","Stability chassis"],"colors":["Lilac","Storm"],"badges":[]}'::jsonb
  ),
  (
    'prod_zenith',
    'cat_heels',
    'Zenith Form Heel',
    'zenith-form-heel',
    '12-hour heel featuring anti-sway shank and sculpted arch cushioning.',
    '12-hour heel featuring anti-sway shank and sculpted arch cushioning.',
    'women',
    'active',
    21000,
    'USD',
    'KS-006',
    'Kimi Labs',
    false,
    '{"specs":["Anti-sway shank","Softskn straps","Slip-resistant rubber"],"colors":["Amber","Noir"],"badges":["sale"]}'::jsonb
  )
ON CONFLICT ("slug") DO UPDATE SET
  "name" = EXCLUDED."name",
  "summary" = EXCLUDED."summary",
  "description" = EXCLUDED."description",
  "gender" = EXCLUDED."gender",
  "status" = EXCLUDED."status",
  "price" = EXCLUDED."price",
  "currency" = EXCLUDED."currency",
  "brand" = EXCLUDED."brand",
  "isFeatured" = EXCLUDED."isFeatured",
  "metadata" = EXCLUDED."metadata";

-- Seed a handful of active customers
INSERT INTO "user" ("id", "name", "email", "stripeCustomerId", "isActive")
VALUES
  ('user_alif', 'Alif Rahman', 'alif@example.com', 'cus_P1', true),
  ('user_maya', 'Maya Ortega', 'maya@example.com', 'cus_P2', true),
  ('user_lina', 'Lina Chen', 'lina@example.com', NULL, false)
ON CONFLICT ("id") DO UPDATE SET
  "name" = EXCLUDED."name",
  "email" = EXCLUDED."email",
  "stripeCustomerId" = EXCLUDED."stripeCustomerId",
  "isActive" = EXCLUDED."isActive";

-- Seed representative orders referencing the catalog
INSERT INTO "order" (
  "id",
  "orderNumber",
  "userId",
  "status",
  "paymentStatus",
  "fulfillmentStatus",
  "currency",
  "subtotal",
  "discountTotal",
  "taxTotal",
  "shippingTotal",
  "total",
  "placedAt"
)
VALUES
  (
    'ord_1001',
    'KS-10492',
    'user_alif',
    'paid',
    'succeeded',
    'processing',
    'USD',
    36000,
    2000,
    1800,
    1200,
    37000,
    NOW() - INTERVAL '10 minutes'
  ),
  (
    'ord_1002',
    'KS-10493',
    'user_maya',
    'pending',
    'requires_action',
    'pending',
    'USD',
    21000,
    0,
    1050,
    1500,
    23550,
    NOW() - INTERVAL '1 hour'
  ),
  (
    'ord_1003',
    'KS-10494',
    'user_lina',
    'fulfilled',
    'succeeded',
    'shipped',
    'USD',
    19500,
    0,
    975,
    0,
    20475,
    NOW() - INTERVAL '1 day'
  )
ON CONFLICT ("id") DO UPDATE SET
  "status" = EXCLUDED."status",
  "paymentStatus" = EXCLUDED."paymentStatus",
  "fulfillmentStatus" = EXCLUDED."fulfillmentStatus",
  "subtotal" = EXCLUDED."subtotal",
  "discountTotal" = EXCLUDED."discountTotal",
  "taxTotal" = EXCLUDED."taxTotal",
  "shippingTotal" = EXCLUDED."shippingTotal",
  "total" = EXCLUDED."total";

INSERT INTO "order_item" (
  "id",
  "orderId",
  "productId",
  "name",
  "sku",
  "size",
  "color",
  "quantity",
  "unitPrice",
  "lineTotal"
)
VALUES
  ('item_1', 'ord_1001', 'prod_kinetic', 'Kinetic Air Runner', 'KS-001', 'US9', 'Obsidian', 1, 19500, 19500),
  ('item_2', 'ord_1001', 'prod_shoreline', 'Shoreline Relief Sandal', 'KS-003', 'US10', 'Deep Sea', 1, 9500, 9500),
  ('item_3', 'ord_1002', 'prod_zenith', 'Zenith Form Heel', 'KS-006', 'EU38', 'Amber', 1, 21000, 21000),
  ('item_4', 'ord_1003', 'prod_orbit', 'Orbit City Sneaker', 'KS-002', 'US8', 'Stone', 1, 16500, 16500)
ON CONFLICT ("id") DO UPDATE SET
  "productId" = EXCLUDED."productId",
  "quantity" = EXCLUDED."quantity",
  "unitPrice" = EXCLUDED."unitPrice",
  "lineTotal" = EXCLUDED."lineTotal";

-- Add a few promo codes for the admin discounts module
INSERT INTO "promo_code" (
  "id",
  "code",
  "description",
  "discountType",
  "value",
  "maxRedemptions",
  "redemptionCount",
  "startsAt",
  "endsAt",
  "isActive"
)
VALUES
  (
    'promo_launch15',
    'LAUNCH15',
    '15% off new arrivals',
    'percentage',
    15,
    500,
    120,
    NOW() - INTERVAL '7 days',
    NOW() + INTERVAL '14 days',
    true
  ),
  (
    'promo_memday',
    'MEMDAY40',
    'Memorial day doorbuster',
    'percentage',
    40,
    NULL,
    20,
    NOW() - INTERVAL '30 days',
    NOW() - INTERVAL '5 days',
    false
  ),
  (
    'promo_vip',
    'VIPFIX30',
    '30 MYR fixed VIP credit',
    'fixed',
    3000,
    50,
    5,
    NOW() - INTERVAL '1 day',
    NOW() + INTERVAL '30 days',
    true
  )
ON CONFLICT ("code") DO UPDATE SET
  "description" = EXCLUDED."description",
  "discountType" = EXCLUDED."discountType",
  "value" = EXCLUDED."value",
  "maxRedemptions" = EXCLUDED."maxRedemptions",
  "redemptionCount" = EXCLUDED."redemptionCount",
  "startsAt" = EXCLUDED."startsAt",
  "endsAt" = EXCLUDED."endsAt",
  "isActive" = EXCLUDED."isActive";
