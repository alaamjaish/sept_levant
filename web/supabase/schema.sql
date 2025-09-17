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

create table if not exists public.flashcard_sets (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  cover_image text,
  created_at timestamp with time zone default now()
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

create table if not exists public.flashcards (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  set_id uuid not null references public.flashcard_sets(id) on delete cascade,
  front_arabic text not null,
  back_english text not null,
  example_sentence_ar text,
  example_sentence_en text,
  created_at timestamp with time zone default now()
);

create index if not exists flashcard_sets_owner_idx
  on public.flashcard_sets (owner_id, created_at desc);

create index if not exists flashcards_set_created_idx
  on public.flashcards (set_id, created_at desc);

-- Row Level Security
alter table public.exercises enable row level security;
alter table public.attempts enable row level security;
alter table public.profiles enable row level security;
alter table public.flashcard_sets enable row level security;
alter table public.flashcards enable row level security;

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

drop policy if exists "update_exercises_teachers" on public.exercises;
create policy "update_exercises_teachers" on public.exercises
  for update using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'teacher'
    )
  ) with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'teacher'
    )
  );

drop policy if exists "delete_exercises_teachers" on public.exercises;
create policy "delete_exercises_teachers" on public.exercises
  for delete using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'teacher'
    )
  );

-- Profiles / attempts policies
drop policy if exists "read_own_profile" on public.profiles;
create policy "read_own_profile" on public.profiles
  for select using (id = auth.uid());

drop policy if exists "insert_own_attempts" on public.attempts;
create policy "insert_own_attempts" on public.attempts
  for insert with check (student_id = auth.uid());

drop policy if exists "read_own_attempts" on public.attempts;
create policy "read_own_attempts" on public.attempts
  for select using (student_id = auth.uid());

-- Flashcard sets policies
drop policy if exists "flashcard_sets_select_own" on public.flashcard_sets;
create policy "flashcard_sets_select_own" on public.flashcard_sets
  for select using (owner_id = auth.uid());

drop policy if exists "flashcard_sets_insert_own" on public.flashcard_sets;
create policy "flashcard_sets_insert_own" on public.flashcard_sets
  for insert with check (owner_id = auth.uid());

drop policy if exists "flashcard_sets_update_own" on public.flashcard_sets;
create policy "flashcard_sets_update_own" on public.flashcard_sets
  for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());

drop policy if exists "flashcard_sets_delete_own" on public.flashcard_sets;
create policy "flashcard_sets_delete_own" on public.flashcard_sets
  for delete using (owner_id = auth.uid());

-- Flashcards policies
drop policy if exists "flashcards_select_own" on public.flashcards;
create policy "flashcards_select_own" on public.flashcards
  for select using (owner_id = auth.uid());

drop policy if exists "flashcards_insert_own" on public.flashcards;
create policy "flashcards_insert_own" on public.flashcards
  for insert with check (
    owner_id = auth.uid()
    and exists (
      select 1 from public.flashcard_sets s
      where s.id = set_id and s.owner_id = auth.uid()
    )
  );

drop policy if exists "flashcards_update_own" on public.flashcards;
create policy "flashcards_update_own" on public.flashcards
  for update using (
    owner_id = auth.uid()
    and exists (
      select 1 from public.flashcard_sets s
      where s.id = set_id and s.owner_id = auth.uid()
    )
  ) with check (
    owner_id = auth.uid()
    and exists (
      select 1 from public.flashcard_sets s
      where s.id = set_id and s.owner_id = auth.uid()
    )
  );

drop policy if exists "flashcards_delete_own" on public.flashcards;
create policy "flashcards_delete_own" on public.flashcards
  for delete using (
    owner_id = auth.uid()
    and exists (
      select 1 from public.flashcard_sets s
      where s.id = set_id and s.owner_id = auth.uid()
    )
  );

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

insert into storage.buckets (id, name, public)
values ('audio', 'audio', true)
on conflict (id) do nothing;

alter table if exists storage.objects enable row level security;

drop policy if exists "read_audio_public" on storage.objects;
create policy "read_audio_public" on storage.objects
  for select using (bucket_id = 'audio');

drop policy if exists "insert_audio_teachers" on storage.objects;
create policy "insert_audio_teachers" on storage.objects
  for insert with check (
    bucket_id = 'audio' and exists (
      select 1 from public.profiles p where p.id = auth.uid() and p.role = 'teacher'
    )
  );

commit;

drop policy if exists "delete_audio_teachers" on storage.objects;
create policy "delete_audio_teachers" on storage.objects
  for delete using (
    bucket_id = 'audio' and exists (
      select 1 from public.profiles p where p.id = auth.uid() and p.role = 'teacher'
    )
  );
