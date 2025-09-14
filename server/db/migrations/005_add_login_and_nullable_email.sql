-- Migration: 005_add_login_and_nullable_email
-- Description: Add required unique login to users; make email temporarily optional

-- 1) Add new column login (nullable for now to allow backfill)
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "login" varchar(255);

-- 2) Backfill login for existing users using their email
UPDATE "users"
SET "login" = COALESCE("login", "email")
WHERE "login" IS NULL OR "login" = '';

-- 3) Enforce NOT NULL on login
ALTER TABLE "users" ALTER COLUMN "login" SET NOT NULL;

-- 4) Add unique constraint/index for login
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_login_unique'
  ) THEN
    ALTER TABLE "users" ADD CONSTRAINT users_login_unique UNIQUE ("login");
  END IF;
END $$;

-- Optional: named index for faster lookup by login (besides unique constraint)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class WHERE relname = 'login_idx'
  ) THEN
    CREATE INDEX login_idx ON "users" ("login");
  END IF;
END $$;

-- 5) Make email temporarily optional (drop NOT NULL)
ALTER TABLE "users" ALTER COLUMN "email" DROP NOT NULL;


