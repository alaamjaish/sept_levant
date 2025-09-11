-- Add a Level field to exercises with safe defaults.
-- Paste this whole script into Supabase SQL Editor and run.

-- 1) Create enum type if not exists
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'exercise_level'
  ) THEN
    CREATE TYPE exercise_level AS ENUM ('beginner', 'intermediate', 'advanced');
  END IF;
END $$;

-- 2) Add column if not exists (nullable first)
ALTER TABLE public.exercises
  ADD COLUMN IF NOT EXISTS level exercise_level;

-- 3) Backfill existing rows to the default level
UPDATE public.exercises
  SET level = 'beginner'
  WHERE level IS NULL;

-- 4) Set default for new rows
ALTER TABLE public.exercises
  ALTER COLUMN level SET DEFAULT 'beginner';

-- 5) Enforce NOT NULL now that everything is filled
ALTER TABLE public.exercises
  ALTER COLUMN level SET NOT NULL;

-- Done.

