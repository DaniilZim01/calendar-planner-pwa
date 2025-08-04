-- Migration: 001_initial
-- Description: Initial database schema for calendar planner PWA
-- Created: 2024-08-04

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS "users" (
    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "email" varchar(255) NOT NULL UNIQUE,
    "phone" varchar(20),
    "name" varchar(255) NOT NULL,
    "password_hash" varchar(255) NOT NULL,
    "email_verified" boolean DEFAULT false,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Create indexes for users table
CREATE INDEX IF NOT EXISTS "email_idx" ON "users" ("email");
CREATE INDEX IF NOT EXISTS "phone_idx" ON "users" ("phone");

-- Tasks table
CREATE TABLE IF NOT EXISTS "tasks" (
    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "title" varchar(255) NOT NULL,
    "description" text,
    "due_date" timestamp,
    "completed" boolean DEFAULT false,
    "priority" integer DEFAULT 1,
    "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Create indexes for tasks table
CREATE INDEX IF NOT EXISTS "user_id_idx" ON "tasks" ("user_id");
CREATE INDEX IF NOT EXISTS "due_date_idx" ON "tasks" ("due_date");
CREATE INDEX IF NOT EXISTS "completed_idx" ON "tasks" ("completed");

-- User tasks junction table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS "user_tasks" (
    "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "task_id" uuid NOT NULL REFERENCES "tasks"("id") ON DELETE CASCADE,
    PRIMARY KEY ("user_id", "task_id")
);

-- Create index for user_tasks table
CREATE INDEX IF NOT EXISTS "user_tasks_pk" ON "user_tasks" ("user_id", "task_id");

-- Periods table for future functionality
CREATE TABLE IF NOT EXISTS "periods" (
    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "date_start" date NOT NULL,
    "date_end" date NOT NULL,
    "cycle_length" integer DEFAULT 28,
    "created_at" timestamp DEFAULT now() NOT NULL
);

-- Create indexes for periods table
CREATE INDEX IF NOT EXISTS "periods_user_id_idx" ON "periods" ("user_id");
CREATE INDEX IF NOT EXISTS "date_range_idx" ON "periods" ("date_start", "date_end");

-- Events table
CREATE TABLE IF NOT EXISTS "events" (
    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "title" varchar(255) NOT NULL,
    "location" varchar(255),
    "date" date NOT NULL,
    "time" varchar(10),
    "end_time" varchar(10),
    "category" varchar(50) DEFAULT 'other',
    "all_day" boolean DEFAULT false,
    "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "created_at" timestamp DEFAULT now() NOT NULL
);

-- Create indexes for events table
CREATE INDEX IF NOT EXISTS "events_user_id_idx" ON "events" ("user_id");
CREATE INDEX IF NOT EXISTS "events_date_idx" ON "events" ("date");

-- Wellbeing data table
CREATE TABLE IF NOT EXISTS "wellbeing_data" (
    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "date" date NOT NULL,
    "water_intake" integer DEFAULT 0,
    "sleep_hours" integer DEFAULT 0,
    "mood" varchar(50),
    "activity" varchar(255),
    "created_at" timestamp DEFAULT now() NOT NULL
);

-- Create indexes for wellbeing_data table
CREATE INDEX IF NOT EXISTS "wellbeing_user_id_idx" ON "wellbeing_data" ("user_id");
CREATE INDEX IF NOT EXISTS "wellbeing_date_idx" ON "wellbeing_data" ("date");

-- Create unique constraint for wellbeing data per user per date
CREATE UNIQUE INDEX IF NOT EXISTS "wellbeing_user_date_unique" ON "wellbeing_data" ("user_id", "date");

-- Add comments for documentation
COMMENT ON TABLE "users" IS 'User accounts for the calendar planner application';
COMMENT ON TABLE "tasks" IS 'User tasks with priority and completion status';
COMMENT ON TABLE "user_tasks" IS 'Many-to-many relationship between users and tasks';
COMMENT ON TABLE "periods" IS 'Period tracking for future menstrual cycle functionality';
COMMENT ON TABLE "events" IS 'Calendar events with time and location information';
COMMENT ON TABLE "wellbeing_data" IS 'Daily wellbeing tracking data (water, sleep, mood)';

COMMENT ON COLUMN "tasks"."priority" IS '1 = low, 2 = medium, 3 = high';
COMMENT ON COLUMN "wellbeing_data"."water_intake" IS 'Water intake in milliliters';
COMMENT ON COLUMN "wellbeing_data"."sleep_hours" IS 'Sleep duration in hours'; 