CREATE TYPE "public"."activation_event_type" AS ENUM('activation_invite', 'activation_reminder', 'activation_completed', 'activation_override_activate', 'activation_override_deactivate');--> statement-breakpoint
CREATE TYPE "public"."admin_role" AS ENUM('owner', 'editor', 'analyst', 'support');--> statement-breakpoint
CREATE TYPE "public"."admin_user_status" AS ENUM('active', 'pending', 'disabled');--> statement-breakpoint
CREATE TYPE "public"."blog_post_status" AS ENUM('draft', 'scheduled', 'published');--> statement-breakpoint
CREATE TYPE "public"."cms_page_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."cms_section_type" AS ENUM('pillar', 'faq', 'contact_channel', 'content_block');--> statement-breakpoint
CREATE TABLE "activation_event" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"eventType" "activation_event_type" NOT NULL,
	"metadata" jsonb,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "admin_user" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"role" "admin_role" DEFAULT 'support' NOT NULL,
	"status" "admin_user_status" DEFAULT 'pending' NOT NULL,
	"location" text,
	"teams" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"mfaEnabled" boolean DEFAULT false NOT NULL,
	"invitedAt" timestamp DEFAULT now() NOT NULL,
	"lastLoginAt" timestamp,
	"metadata" jsonb,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "admin_user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "blog_post" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"author" text NOT NULL,
	"excerpt" text NOT NULL,
	"sections" jsonb NOT NULL,
	"minutesToRead" integer DEFAULT 4 NOT NULL,
	"status" "blog_post_status" DEFAULT 'draft' NOT NULL,
	"publishedAt" timestamp,
	"scheduledAt" timestamp,
	"lastEditedAt" timestamp DEFAULT now(),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "blog_post_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "cms_page_section" (
	"id" text PRIMARY KEY NOT NULL,
	"pageId" text NOT NULL,
	"sectionType" "cms_section_type" DEFAULT 'content_block' NOT NULL,
	"key" text,
	"title" jsonb,
	"body" jsonb,
	"metadata" jsonb,
	"position" integer DEFAULT 0 NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cms_page" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"label" jsonb,
	"hero" jsonb,
	"description" jsonb,
	"owner" text,
	"summary" text,
	"status" "cms_page_status" DEFAULT 'draft' NOT NULL,
	"publishedAt" timestamp,
	"lastEditedAt" timestamp DEFAULT now(),
	"metadata" jsonb,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "cms_page_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "activation_event" ADD CONSTRAINT "activation_event_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_user" ADD CONSTRAINT "admin_user_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cms_page_section" ADD CONSTRAINT "cms_page_section_pageId_cms_page_id_fk" FOREIGN KEY ("pageId") REFERENCES "public"."cms_page"("id") ON DELETE cascade ON UPDATE no action;