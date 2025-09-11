-- Add title and short_description to exercises
-- How to run:
-- 1) Open Supabase SQL editor
-- 2) Paste this entire script
-- 3) Run

-- Safe-guard: add columns only if missing
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_name = 'exercises' and column_name = 'title'
  ) then
    alter table public.exercises add column title text;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_name = 'exercises' and column_name = 'short_description'
  ) then
    alter table public.exercises add column short_description text;
  end if;
end $$;

-- Optional: quick backfill title from arabic_text first snippet (non-destructive)
-- This keeps existing rows readable in lists; you can skip if you prefer to fill manually.
update public.exercises
set title = left(regexp_replace(coalesce(title, arabic_text, ''), E'[\n\r]+', ' ', 'g'), 60)
where coalesce(nullif(title, ''), '') = ''
  and coalesce(nullif(arabic_text, ''), '') <> '';

-- Note: Both columns are nullable by design. UI will hide empty description.

