begin;

create table if not exists public.flashcards (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  front_arabic text not null,
  back_english text not null,
  example_sentence_ar text,
  example_sentence_en text,
  created_at timestamptz default now()
);

create index if not exists flashcards_owner_created_idx
  on public.flashcards (owner_id, created_at desc);

alter table public.flashcards enable row level security;

drop policy if exists "flashcards_select_own" on public.flashcards;
create policy "flashcards_select_own" on public.flashcards
  for select using (auth.uid() = owner_id);

drop policy if exists "flashcards_insert_own" on public.flashcards;
create policy "flashcards_insert_own" on public.flashcards
  for insert with check (auth.uid() = owner_id);

drop policy if exists "flashcards_update_own" on public.flashcards;
create policy "flashcards_update_own" on public.flashcards
  for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

drop policy if exists "flashcards_delete_own" on public.flashcards;
create policy "flashcards_delete_own" on public.flashcards
  for delete using (auth.uid() = owner_id);

commit;

