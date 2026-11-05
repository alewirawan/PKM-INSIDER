
CREATE TYPE "public"."post_status" AS ENUM (
  'Terbit',
  'Draft'
);

--> statement-breakpoint

CREATE TABLE "posts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "title" varchar(180) NOT NULL,
  "slug" varchar(180) NOT NULL,
  "category" varchar(60) NOT NULL,
  "image" varchar(500) NOT NULL,
  "excerpt" varchar(220) NOT NULL,
  "content" text[] NOT NULL,
  "author" varchar(120) NOT NULL,
  "status" "post_status" DEFAULT 'Draft' NOT NULL,
  "published_at" timestamp with time zone NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

--> statement-breakpoint

CREATE UNIQUE INDEX "posts_slug_uq"
ON "posts" USING btree ("slug");

--> statement-breakpoint

CREATE INDEX "posts_status_published_at_idx"
ON "posts" USING btree ("status", "published_at");

--> statement-breakpoint

CREATE INDEX "posts_updated_at_idx"
ON "posts" USING btree ("updated_at");
