ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "phone" text;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "hasAcceptedTerms" boolean DEFAULT false NOT NULL;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "onboardingCompletedAt" timestamp;
