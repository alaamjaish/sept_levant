-- Minimal schema for MVP (safe to paste and run as-is)
-- You can run this multiple times without errors.

begin;

-- UUID support for gen_random_uuid()
create extension if not exists "pgcrypto" with schema extensions;

-- Tables
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  role text check (role in ('student','teacher')) default 'student'
);

create table if not exists public.exercises (
  id uuid primary key default gen_random_uuid(),
  arabic_text text not null,
  audio_url text not null,
  exercise_type text check (exercise_type in ('listening','speaking')) not null,
  created_at timestamp with time zone default now()
);

create table if not exists public.attempts (
  id uuid primary key default gen_random_uuid(),
  exercise_id uuid references public.exercises(id) on delete cascade,
  student_id uuid references auth.users(id) on delete cascade,
  passed boolean,
  score integer,
  created_at timestamp with time zone default now()
);

-- Row Level Security
alter table public.exercises enable row level security;
alter table public.attempts enable row level security;
alter table public.profiles enable row level security;

-- Policies (drop if already exist; then recreate)
drop policy if exists "read_exercises" on public.exercises;
create policy "read_exercises" on public.exercises
  for select using (true);

drop policy if exists "insert_exercises_teachers" on public.exercises;
create policy "insert_exercises_teachers" on public.exercises
  for insert
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'teacher'
    )
  );

drop policy if exists "read_own_profile" on public.profiles;
create policy "read_own_profile" on public.profiles
  for select using (id = auth.uid());

drop policy if exists "insert_own_attempts" on public.attempts;
create policy "insert_own_attempts" on public.attempts
  for insert with check (student_id = auth.uid());

drop policy if exists "read_own_attempts" on public.attempts;
create policy "read_own_attempts" on public.attempts
  for select using (student_id = auth.uid());

-- Auto-create profile rows on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

commit;

-- Additional: Storage bucket and policies for audio uploads (teachers only)
begin;

-- Create public audio bucket if missing
insert into storage.buckets (id, name, public)
values ('audio', 'audio', true)
on conflict (id) do nothing;

-- Enable RLS on objects (usually enabled by default)
alter table if exists storage.objects enable row level security;

-- Public read for audio bucket
drop policy if exists "read_audio_public" on storage.objects;
create policy "read_audio_public" on storage.objects
  for select using (bucket_id = 'audio');

-- Teachers can upload to audio bucket
drop policy if exists "insert_audio_teachers" on storage.objects;
create policy "insert_audio_teachers" on storage.objects
  for insert with check (
    bucket_id = 'audio' and exists (
      select 1 from public.profiles p where p.id = auth.uid() and p.role = 'teacher'
    )
  );

commit;
