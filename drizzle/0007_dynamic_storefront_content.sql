CREATE TYPE IF NOT EXISTS "blog_post_status" AS ENUM ('draft', 'scheduled', 'published');
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "blog_post" (
  "id" text PRIMARY KEY NOT NULL,
  "slug" text NOT NULL,
  "title" text NOT NULL,
  "author" text NOT NULL,
  "excerpt" text NOT NULL,
  "sections" jsonb NOT NULL,
  "minutesToRead" integer NOT NULL,
  "status" "blog_post_status" DEFAULT 'draft' NOT NULL,
  "publishedAt" timestamp,
  "scheduledAt" timestamp,
  "lastEditedAt" timestamp DEFAULT now(),
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "blog_post_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
INSERT INTO "blog_post" (
  "id",
  "slug",
  "title",
  "author",
  "excerpt",
  "sections",
  "minutesToRead",
  "status",
  "publishedAt",
  "scheduledAt",
  "lastEditedAt"
)
VALUES
  (
    'blog_commute',
    'elevate-the-daily-commute',
    'Elevate the Daily Commute',
    'Lina Ortega',
    'Layer breathable knits with waterproof protection for the sprint between meetings.',
    '[
      {"body":"Commuting shoes need to move fast between climates. The Orbit City Sneaker uses coated leather on high splash zones and perforations elsewhere to breathe."},
      {"heading":"Layered Cushioning","body":"Stacking BubbleSoft foam over a firm crash pad stops heel drag on subway platforms while keeping your stride crisp on sidewalks."},
      {"heading":"Styling cues","body":"Monochrome palettes lengthen the leg line—pair Stone with crisp tailoring for instant polish."}
    ]'::jsonb,
    6,
    'published',
    '2025-08-12',
    NULL,
    '2025-08-12'
  ),
  (
    'blog_tempo',
    'tempo-training-reset',
    'Tempo Training Reset',
    'Maya Rahman',
    'Rebuild stability after a heavy season with functional drills and the Pulse Sync Trainer.',
    '[
      {"body":"Tempo work needs support that will not collapse under lateral loads. The Pulse Sync Trainer wraps the midsole with rubber so the shoe stays planted during skaters and deadlifts."},
      {"heading":"Programming reset","body":"Alternate tempo runs with eccentric strength work twice weekly. Keep the RPE at 6/10 to rebuild connective tissue."},
      {"heading":"Gear checklist","body":"Pair the trainers with moisture-wicking socks and a breathable compression layer to manage sweat indoors."}
    ]'::jsonb,
    5,
    'published',
    '2025-07-05',
    NULL,
    '2025-07-05'
  ),
  (
    'blog_capsule',
    'capsule-lookbook-2026',
    'Capsule Lookbook 2026',
    'Editorial Studio',
    'Preview the spring capsule narrative slated for the flagship launch.',
    '[
      {"body":"A taste of the upcoming capsule with color studies and motion labs scheduled for early 2026."}
    ]'::jsonb,
    4,
    'scheduled',
    NULL,
    '2025-12-15',
    '2025-11-10'
  ),
  (
    'blog_atelier',
    'atelier-maker-notes',
    'Atelier Maker Notes',
    'Design Lab',
    'Behind-the-scenes sketches from the cushioning lab.',
    '[
      {"body":"Notes collected from the atelier as we iterate on cushioning stacks and materials."}
    ]'::jsonb,
    7,
    'draft',
    NULL,
    NULL,
    '2025-11-05'
  )
ON CONFLICT ("slug") DO UPDATE SET
  "title" = EXCLUDED."title",
  "author" = EXCLUDED."author",
  "excerpt" = EXCLUDED."excerpt",
  "sections" = EXCLUDED."sections",
  "minutesToRead" = EXCLUDED."minutesToRead",
  "status" = EXCLUDED."status",
  "publishedAt" = EXCLUDED."publishedAt",
  "scheduledAt" = EXCLUDED."scheduledAt",
  "lastEditedAt" = EXCLUDED."lastEditedAt",
  "updatedAt" = now();
--> statement-breakpoint
INSERT INTO "review" (
  "id",
  "productId",
  "userId",
  "rating",
  "title",
  "comment",
  "isPublished",
  "createdAt",
  "updatedAt"
)
VALUES
  (
    'rev_kinetic_1',
    'prod_kinetic',
    'user_maya',
    5,
    'Cloud cushioning for 14-hour days',
    'Rotated these through a conference week and never once wanted to switch pairs. Foam rebounds fast and the collar padding stops rubbing even without socks.',
    true,
    '2025-08-04',
    '2025-08-04'
  ),
  (
    'rev_pulse_1',
    'prod_pulse',
    'user_alif',
    4,
    'Stable platform for HIIT',
    'Lateral support feels dialed—no ankle wobble during jumps. Runs slightly narrow so I sized up half a size.',
    true,
    '2025-07-16',
    '2025-07-16'
  ),
  (
    'rev_orbit_1',
    'prod_orbit',
    'user_lina',
    5,
    'Waterproof without the heat',
    'Tested in KL storms and feet stayed dry while the knit still breathed. Traction on wet tile is impressive.',
    true,
    '2025-06-02',
    '2025-06-02'
  )
ON CONFLICT ("id") DO UPDATE SET
  "rating" = EXCLUDED."rating",
  "title" = EXCLUDED."title",
  "comment" = EXCLUDED."comment",
  "isPublished" = EXCLUDED."isPublished",
  "updatedAt" = now();
