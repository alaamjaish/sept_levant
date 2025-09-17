create table if not exists public.flashcard_sets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  cover_seed text,
  created_at timestamp with time zone default now()
);

create table if not exists public.flashcards (
  id uuid primary key default gen_random_uuid(),
  set_id uuid not null references public.flashcard_sets(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  front_ar text not null,
  back_en text not null,
  example_ar text not null,
  example_en text not null,
  input_text text not null,
  input_language text check (input_language in ('arabic','english','unknown')) default 'unknown',
  created_at timestamp with time zone default now()
);

create index if not exists flashcard_sets_user_id_idx on public.flashcard_sets(user_id);
create index if not exists flashcards_set_id_idx on public.flashcards(set_id);
create index if not exists flashcards_user_id_idx on public.flashcards(user_id);

alter table public.flashcard_sets enable row level security;
alter table public.flashcards enable row level security;

drop policy if exists "select_own_flashcard_sets" on public.flashcard_sets;
create policy "select_own_flashcard_sets" on public.flashcard_sets
  for select using (user_id = auth.uid());

drop policy if exists "insert_own_flashcard_sets" on public.flashcard_sets;
create policy "insert_own_flashcard_sets" on public.flashcard_sets
  for insert with check (user_id = auth.uid());

drop policy if exists "update_own_flashcard_sets" on public.flashcard_sets;
create policy "update_own_flashcard_sets" on public.flashcard_sets
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "delete_own_flashcard_sets" on public.flashcard_sets;
create policy "delete_own_flashcard_sets" on public.flashcard_sets
  for delete using (user_id = auth.uid());

drop policy if exists "select_own_flashcards" on public.flashcards;
create policy "select_own_flashcards" on public.flashcards
  for select using (user_id = auth.uid());

drop policy if exists "insert_own_flashcards" on public.flashcards;
create policy "insert_own_flashcards" on public.flashcards
  for insert with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.flashcard_sets s
      where s.id = set_id and s.user_id = auth.uid()
    )
  );

drop policy if exists "update_own_flashcards" on public.flashcards;
create policy "update_own_flashcards" on public.flashcards
  for update using (user_id = auth.uid()) with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.flashcard_sets s
      where s.id = set_id and s.user_id = auth.uid()
    )
  );

drop policy if exists "delete_own_flashcards" on public.flashcards;
create policy "delete_own_flashcards" on public.flashcards
  for delete using (user_id = auth.uid());
