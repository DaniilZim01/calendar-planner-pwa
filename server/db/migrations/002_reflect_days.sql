-- Migration: 002_reflect_days
-- Description: Daily reflect data (water, sleep, steps, mood, journal)
-- Created: 2025-08-16

-- Table: reflect_days
CREATE TABLE IF NOT EXISTS "reflect_days" (
    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "date" date NOT NULL,
    "water" real DEFAULT 0,
    "sleep" real DEFAULT 0,
    "steps" integer DEFAULT 0,
    "mood" integer DEFAULT 0,
    "journal" text,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Indexes
CREATE UNIQUE INDEX IF NOT EXISTS "reflect_days_user_date_unique" ON "reflect_days" ("user_id", "date");
CREATE INDEX IF NOT EXISTS "reflect_days_user_id_idx" ON "reflect_days" ("user_id");
CREATE INDEX IF NOT EXISTS "reflect_days_date_idx" ON "reflect_days" ("date");

-- Comments
COMMENT ON TABLE "reflect_days" IS 'Per-user daily reflect data: water (L), sleep (h), steps, mood (0..4), journal';

