-- Content source tracking, General-Training/Academic/Shared classification, and
-- access control for future licensed imports. Fully additive and idempotent.
-- No third-party content is added here; only Clearband-original metadata.

-- 1. Classification / provenance enums --------------------------------------
do $$ begin
  create type content_module_type as enum ('general_training', 'academic', 'shared', 'unknown');
exception when duplicate_object then null; end $$;

do $$ begin
  create type content_access_scope as enum ('public', 'admin_only');
exception when duplicate_object then null; end $$;

do $$ begin
  create type content_review_status as enum ('pending', 'approved', 'rejected');
exception when duplicate_object then null; end $$;

do $$ begin
  create type import_batch_status as enum ('pending', 'approved', 'rejected', 'imported');
exception when duplicate_object then null; end $$;

-- 2. Content sources + import batches ----------------------------------------
create table if not exists public.content_sources (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  publisher text,
  edition text,
  source_year int,
  is_licensed boolean not null default true,
  personal_use_only boolean not null default false,
  licence_note text,
  attribution text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.imported_content_batches (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.content_sources(id) on delete cascade,
  name text not null,
  status import_batch_status not null default 'pending',
  item_count int not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Shared listening transcripts, kept separate so future licensed scripts can be
-- access-controlled and linked to a question without duplicating the question.
create table if not exists public.listening_scripts (
  id uuid primary key default gen_random_uuid(),
  question_id uuid references public.practice_questions(id) on delete cascade,
  title text not null,
  script text not null,
  source_id uuid references public.content_sources(id),
  module_type content_module_type not null default 'shared',
  access_scope content_access_scope not null default 'public',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. Classification + provenance columns on every content table --------------
do $$
declare
  t text;
  content_tables text[] := array[
    'lessons', 'practice_questions', 'writing_prompts', 'speaking_prompts',
    'mock_exams', 'vocabulary_items', 'grammar_items'
  ];
begin
  foreach t in array content_tables loop
    execute format('alter table public.%I add column if not exists module_type content_module_type not null default ''general_training''', t);
    execute format('alter table public.%I add column if not exists express_entry_relevant boolean not null default true', t);
    execute format('alter table public.%I add column if not exists canada_path_eligible boolean not null default true', t);
    execute format('alter table public.%I add column if not exists access_scope content_access_scope not null default ''public''', t);
    execute format('alter table public.%I add column if not exists review_status content_review_status not null default ''approved''', t);
    execute format('alter table public.%I add column if not exists source_id uuid references public.content_sources(id)', t);
    execute format('alter table public.%I add column if not exists import_batch_id uuid references public.imported_content_batches(id)', t);
    execute format('alter table public.%I add column if not exists source_page_start int', t);
    execute format('alter table public.%I add column if not exists source_page_end int', t);
    execute format('alter table public.%I add column if not exists imported_from text', t);
    execute format('create index if not exists idx_%I_module_type on public.%I (module_type)', t, t);
  end loop;
end $$;

-- 4. Correct classification for the existing original content -----------------
-- Listening and Speaking are shared across Academic and General Training.
update public.practice_questions set module_type = 'shared' where skill in ('listening', 'speaking');
update public.speaking_prompts set module_type = 'shared';
update public.lessons set module_type = 'shared' where skill in ('listening', 'speaking');
-- Reading drills and Writing prompts stay general_training (Express Entry path).

-- 5. Seed the Clearband Original source and link existing content -------------
insert into public.content_sources (name, publisher, source_year, is_licensed, personal_use_only, licence_note, attribution)
values (
  'Clearband Original',
  'Clearband',
  2026,
  true,
  false,
  'Original IELTS General Training-style content authored for Clearband. Safe for all users.',
  'Clearband'
)
on conflict (name) do nothing;

do $$
declare
  clearband_id uuid;
  t text;
  content_tables text[] := array[
    'lessons', 'practice_questions', 'writing_prompts', 'speaking_prompts',
    'mock_exams', 'vocabulary_items', 'grammar_items'
  ];
begin
  select id into clearband_id from public.content_sources where name = 'Clearband Original';
  foreach t in array content_tables loop
    execute format('update public.%I set source_id = %L where source_id is null', t, clearband_id);
  end loop;
end $$;

-- 6. RLS for the new tables ---------------------------------------------------
alter table public.content_sources enable row level security;
alter table public.imported_content_batches enable row level security;
alter table public.listening_scripts enable row level security;

drop policy if exists "content sources readable" on public.content_sources;
create policy "content sources readable" on public.content_sources
  for select using (auth.uid() is not null);
drop policy if exists "content sources admin" on public.content_sources;
create policy "content sources admin" on public.content_sources
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "import batches admin" on public.imported_content_batches;
create policy "import batches admin" on public.imported_content_batches
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "listening scripts readable" on public.listening_scripts;
create policy "listening scripts readable" on public.listening_scripts
  for select using (access_scope = 'public' or public.is_admin());
drop policy if exists "listening scripts admin" on public.listening_scripts;
create policy "listening scripts admin" on public.listening_scripts
  for all using (public.is_admin()) with check (public.is_admin());

-- 7. Tighten content read policies with access_scope --------------------------
-- Public content stays readable to signed-in learners; admin_only content
-- (e.g. future personal-use licensed imports) is visible to admins only.
drop policy if exists "content readable when live" on public.lessons;
create policy "content readable when live" on public.lessons
  for select using ((published and access_scope = 'public') or public.is_admin());

drop policy if exists "practice readable when live" on public.practice_questions;
create policy "practice readable when live" on public.practice_questions
  for select using ((published and access_scope = 'public') or public.is_admin());

drop policy if exists "writing prompts readable when live" on public.writing_prompts;
create policy "writing prompts readable when live" on public.writing_prompts
  for select using ((published and access_scope = 'public') or public.is_admin());

drop policy if exists "speaking prompts readable when live" on public.speaking_prompts;
create policy "speaking prompts readable when live" on public.speaking_prompts
  for select using ((published and access_scope = 'public') or public.is_admin());

drop policy if exists "mock readable when live" on public.mock_exams;
create policy "mock readable when live" on public.mock_exams
  for select using ((published and access_scope = 'public') or public.is_admin());

drop policy if exists "vocab readable when live" on public.vocabulary_items;
create policy "vocab readable when live" on public.vocabulary_items
  for select using ((published and access_scope = 'public') or public.is_admin());

drop policy if exists "grammar readable when live" on public.grammar_items;
create policy "grammar readable when live" on public.grammar_items
  for select using ((published and access_scope = 'public') or public.is_admin());

-- 8. updated_at triggers for the new tables -----------------------------------
drop trigger if exists set_content_sources_updated_at on public.content_sources;
create trigger set_content_sources_updated_at
  before update on public.content_sources
  for each row execute function public.set_updated_at();

drop trigger if exists set_import_batches_updated_at on public.imported_content_batches;
create trigger set_import_batches_updated_at
  before update on public.imported_content_batches
  for each row execute function public.set_updated_at();

drop trigger if exists set_listening_scripts_updated_at on public.listening_scripts;
create trigger set_listening_scripts_updated_at
  before update on public.listening_scripts
  for each row execute function public.set_updated_at();
