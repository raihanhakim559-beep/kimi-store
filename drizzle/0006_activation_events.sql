CREATE TYPE "activation_event_type" AS ENUM (
  'activation_invite',
  'activation_reminder',
  'activation_completed',
  'activation_override_activate',
  'activation_override_deactivate'
);

CREATE TABLE IF NOT EXISTS "activation_event" (
  "id" text PRIMARY KEY,
  "userId" text NOT NULL,
  "eventType" activation_event_type NOT NULL,
  "metadata" jsonb,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "activation_event_user_fk" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "activation_event_user_idx" ON "activation_event" ("userId");
