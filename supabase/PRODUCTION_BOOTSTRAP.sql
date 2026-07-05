-- PRODUCTION_BOOTSTRAP.sql
-- Generated from supabase/migrations/0001..0006 with idempotency guards.
-- Safe to paste into the Supabase SQL Editor on a fresh OR partially
-- migrated project: existing tables, types, policies and data are kept.
-- Order matters; run this file top to bottom in one go.


-- ============ from 0001_clearband_schema.sql ============

create extension if not exists "pgcrypto";

do $$ begin
  create type goal_mode as enum ('eligible', 'crs', 'unsure');
exception when duplicate_object then null; end $$;
do $$ begin
  create type skill as enum ('listening', 'reading', 'writing', 'speaking');
exception when duplicate_object then null; end $$;
do $$ begin
  create type task_block as enum ('warmup', 'lesson', 'practice', 'review');
exception when duplicate_object then null; end $$;
do $$ begin
  create type task_status as enum ('pending', 'done', 'skipped');
exception when duplicate_object then null; end $$;
do $$ begin
  create type subscription_plan as enum ('free', 'premium');
exception when duplicate_object then null; end $$;
do $$ begin
  create type admin_role as enum ('admin', 'editor');
exception when duplicate_object then null; end $$;

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  locale text not null default 'en-CA',
  onboarded boolean not null default false,
  daily_minutes int not null default 30 check (daily_minutes between 10 and 90),
  consent_audio boolean not null default false,
  consent_samples boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role admin_role not null default 'editor',
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists(select 1 from public.admin_users where user_id = auth.uid());
$$;

create table if not exists public.onboarding_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  goal_mode goal_mode not null,
  test_date date,
  confidence int not null check (confidence between 1 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id)
);

create table if not exists public.clb_targets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  target_clb int not null check (target_clb between 7 and 10),
  listening numeric(3,1) not null,
  reading numeric(3,1) not null,
  writing numeric(3,1) not null,
  speaking numeric(3,1) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id)
);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  module text not null,
  skill skill not null,
  summary text not null,
  est_minutes int not null,
  display_order int not null,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lesson_sections (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  display_order int not null,
  heading text not null,
  body text not null,
  media jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.practice_questions (
  id uuid primary key default gen_random_uuid(),
  skill skill not null,
  question_type text not null,
  topic text not null,
  difficulty int not null default 2,
  prompt text not null,
  payload jsonb not null default '{}'::jsonb,
  answer_key jsonb not null default '{}'::jsonb,
  explanation text not null,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.diagnostic_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'in_progress',
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  result jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.diagnostic_answers (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.diagnostic_attempts(id) on delete cascade,
  question_id uuid,
  skill skill not null,
  response jsonb not null default '{}'::jsonb,
  is_correct boolean,
  score numeric,
  created_at timestamptz not null default now()
);

create table if not exists public.study_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'active',
  start_date date not null default current_date,
  weeks jsonb not null default '[]'::jsonb,
  current_week int not null default 1,
  generated_by text not null default 'mock',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.daily_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id uuid references public.study_plans(id) on delete cascade,
  task_date date not null,
  block task_block not null,
  ref_type text not null,
  ref_id text not null,
  status task_status not null default 'pending',
  xp int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.practice_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id uuid references public.practice_questions(id),
  response jsonb not null default '{}'::jsonb,
  is_correct boolean,
  score numeric,
  time_ms int,
  context text not null default 'drill',
  created_at timestamptz not null default now()
);

create table if not exists public.writing_prompts (
  id uuid primary key default gen_random_uuid(),
  task text not null check (task in ('task1', 'task2')),
  letter_type text,
  essay_type text,
  prompt text not null,
  bullets jsonb not null default '[]'::jsonb,
  band_samples jsonb not null default '[]'::jsonb,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.writing_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  prompt_id uuid references public.writing_prompts(id),
  text text not null,
  word_count int not null,
  time_ms int,
  estimate jsonb,
  is_estimate boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.speaking_prompts (
  id uuid primary key default gen_random_uuid(),
  part text not null check (part in ('p1', 'p2', 'p3')),
  topic text not null,
  prompt text not null,
  cue_points jsonb not null default '[]'::jsonb,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.speaking_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  prompt_id uuid references public.speaking_prompts(id),
  audio_path text,
  duration_s int,
  self_rating jsonb,
  estimate jsonb,
  is_estimate boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.mock_exams (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  type text not null check (type in ('mini', 'half', 'full')),
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.mock_sections (
  id uuid primary key default gen_random_uuid(),
  mock_id uuid not null references public.mock_exams(id) on delete cascade,
  display_order int not null,
  skill skill not null,
  time_limit_s int not null,
  item_refs jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.mock_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mock_id uuid references public.mock_exams(id),
  status text not null default 'in_progress',
  started_at timestamptz not null default now(),
  section_state jsonb not null default '{}'::jsonb,
  answers jsonb not null default '{}'::jsonb,
  raw_scores jsonb,
  band_estimate jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.vocabulary_items (
  id uuid primary key default gen_random_uuid(),
  term text not null,
  definition text not null,
  example text not null,
  topic text not null,
  cefr text,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_vocabulary_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  item_id uuid references public.vocabulary_items(id) on delete cascade,
  status text not null default 'new',
  ease numeric not null default 2.5,
  interval int not null default 0,
  due_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, item_id)
);

create table if not exists public.grammar_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  rule text not null,
  examples jsonb not null default '[]'::jsonb,
  drill_question_ids jsonb not null default '[]'::jsonb,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.revision_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  ref_type text not null,
  ref_id text not null,
  ease numeric not null default 2.5,
  interval int not null default 0,
  due_at timestamptz not null default now(),
  last_grade text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.error_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null,
  skill skill not null,
  ref_type text not null,
  ref_id text not null,
  note text,
  resolved boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.xp_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source_type text not null,
  source_id text not null,
  amount int not null,
  reason text not null,
  created_at timestamptz not null default now(),
  unique(user_id, source_type, source_id)
);

create table if not exists public.badges (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text not null,
  criterion jsonb not null default '{}'::jsonb,
  art text,
  created_at timestamptz not null default now()
);

create table if not exists public.user_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  badge_id uuid not null references public.badges(id) on delete cascade,
  earned_at timestamptz not null default now(),
  unique(user_id, badge_id)
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan subscription_plan not null default 'free',
  status text not null default 'active',
  stripe_customer_id text,
  entitlements jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id)
);

alter table public.user_profiles enable row level security;
alter table public.onboarding_goals enable row level security;
alter table public.clb_targets enable row level security;
alter table public.diagnostic_attempts enable row level security;
alter table public.diagnostic_answers enable row level security;
alter table public.study_plans enable row level security;
alter table public.daily_tasks enable row level security;
alter table public.practice_attempts enable row level security;
alter table public.writing_attempts enable row level security;
alter table public.speaking_attempts enable row level security;
alter table public.mock_attempts enable row level security;
alter table public.user_vocabulary_progress enable row level security;
alter table public.revision_items enable row level security;
alter table public.error_logs enable row level security;
alter table public.xp_events enable row level security;
alter table public.user_badges enable row level security;
alter table public.subscriptions enable row level security;

alter table public.lessons enable row level security;
alter table public.lesson_sections enable row level security;
alter table public.practice_questions enable row level security;
alter table public.writing_prompts enable row level security;
alter table public.speaking_prompts enable row level security;
alter table public.mock_exams enable row level security;
alter table public.mock_sections enable row level security;
alter table public.vocabulary_items enable row level security;
alter table public.grammar_items enable row level security;
alter table public.badges enable row level security;
alter table public.admin_users enable row level security;

drop policy if exists "own rows" on public.user_profiles;
create policy "own rows" on public.user_profiles for all using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "own goals" on public.onboarding_goals;
create policy "own goals" on public.onboarding_goals for all using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "own targets" on public.clb_targets;
create policy "own targets" on public.clb_targets for all using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "own diagnostic attempts" on public.diagnostic_attempts;
create policy "own diagnostic attempts" on public.diagnostic_attempts for all using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "own diagnostic answers" on public.diagnostic_answers;
create policy "own diagnostic answers" on public.diagnostic_answers
  for all
  using (
    exists (
      select 1 from public.diagnostic_attempts da
      where da.id = attempt_id and da.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.diagnostic_attempts da
      where da.id = attempt_id and da.user_id = auth.uid()
    )
  );
drop policy if exists "own plans" on public.study_plans;
create policy "own plans" on public.study_plans for all using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "own tasks" on public.daily_tasks;
create policy "own tasks" on public.daily_tasks for all using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "own practice attempts" on public.practice_attempts;
create policy "own practice attempts" on public.practice_attempts for all using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "own writing attempts" on public.writing_attempts;
create policy "own writing attempts" on public.writing_attempts for all using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "own speaking attempts" on public.speaking_attempts;
create policy "own speaking attempts" on public.speaking_attempts for all using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "own mock attempts" on public.mock_attempts;
create policy "own mock attempts" on public.mock_attempts for all using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "own vocab progress" on public.user_vocabulary_progress;
create policy "own vocab progress" on public.user_vocabulary_progress for all using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "own revision" on public.revision_items;
create policy "own revision" on public.revision_items for all using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "own errors" on public.error_logs;
create policy "own errors" on public.error_logs for all using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "own xp" on public.xp_events;
create policy "own xp" on public.xp_events for all using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "own user badges" on public.user_badges;
create policy "own user badges" on public.user_badges for all using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "own subscription" on public.subscriptions;
create policy "own subscription" on public.subscriptions for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "content readable when live" on public.lessons;
create policy "content readable when live" on public.lessons for select using (published or public.is_admin());
drop policy if exists "content write admin" on public.lessons;
create policy "content write admin" on public.lessons for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "lesson sections readable" on public.lesson_sections;
create policy "lesson sections readable" on public.lesson_sections for select using (exists(select 1 from public.lessons l where l.id = lesson_id and (l.published or public.is_admin())));
drop policy if exists "lesson sections admin" on public.lesson_sections;
create policy "lesson sections admin" on public.lesson_sections for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "practice readable when live" on public.practice_questions;
create policy "practice readable when live" on public.practice_questions for select using (published or public.is_admin());
drop policy if exists "practice write admin" on public.practice_questions;
create policy "practice write admin" on public.practice_questions for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "writing prompts readable when live" on public.writing_prompts;
create policy "writing prompts readable when live" on public.writing_prompts for select using (published or public.is_admin());
drop policy if exists "writing prompts write admin" on public.writing_prompts;
create policy "writing prompts write admin" on public.writing_prompts for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "speaking prompts readable when live" on public.speaking_prompts;
create policy "speaking prompts readable when live" on public.speaking_prompts for select using (published or public.is_admin());
drop policy if exists "speaking prompts write admin" on public.speaking_prompts;
create policy "speaking prompts write admin" on public.speaking_prompts for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "mock readable when live" on public.mock_exams;
create policy "mock readable when live" on public.mock_exams for select using (published or public.is_admin());
drop policy if exists "mock write admin" on public.mock_exams;
create policy "mock write admin" on public.mock_exams for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "mock sections readable" on public.mock_sections;
create policy "mock sections readable" on public.mock_sections for select using (exists(select 1 from public.mock_exams m where m.id = mock_id and (m.published or public.is_admin())));
drop policy if exists "mock sections write admin" on public.mock_sections;
create policy "mock sections write admin" on public.mock_sections for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "vocab readable when live" on public.vocabulary_items;
create policy "vocab readable when live" on public.vocabulary_items for select using (published or public.is_admin());
drop policy if exists "vocab write admin" on public.vocabulary_items;
create policy "vocab write admin" on public.vocabulary_items for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "grammar readable when live" on public.grammar_items;
create policy "grammar readable when live" on public.grammar_items for select using (published or public.is_admin());
drop policy if exists "grammar write admin" on public.grammar_items;
create policy "grammar write admin" on public.grammar_items for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "badges readable" on public.badges;
create policy "badges readable" on public.badges for select using (true);
drop policy if exists "badges write admin" on public.badges;
create policy "badges write admin" on public.badges for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin users readable by admins" on public.admin_users;
create policy "admin users readable by admins" on public.admin_users for select using (public.is_admin());
drop policy if exists "admin users write by admins" on public.admin_users;
create policy "admin users write by admins" on public.admin_users for all using (public.is_admin()) with check (public.is_admin());


-- ============ from 0002_auth_storage_seed_support.sql ============

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_profiles (user_id, display_name, locale)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', new.raw_user_meta_data ->> 'full_name'),
    coalesce(new.raw_user_meta_data ->> 'locale', 'en-CA')
  )
  on conflict (user_id) do nothing;

  insert into public.subscriptions (user_id, plan, status, entitlements)
  values (new.id, 'free', 'active', '{"mock_limit": true}'::jsonb)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.practice_questions
  add constraint practice_questions_seed_unique unique (skill, question_type, prompt);
alter table public.writing_prompts
  add constraint writing_prompts_seed_unique unique (task, prompt);
alter table public.speaking_prompts
  add constraint speaking_prompts_seed_unique unique (part, prompt);
alter table public.vocabulary_items
  add constraint vocabulary_items_term_unique unique (term);
alter table public.grammar_items
  add constraint grammar_items_title_unique unique (title);
alter table public.mock_exams
  add constraint mock_exams_title_unique unique (title);
alter table public.lesson_sections
  add constraint lesson_sections_order_unique unique (lesson_id, display_order);
alter table public.mock_sections
  add constraint mock_sections_order_unique unique (mock_id, display_order);

create index if not exists daily_tasks_user_date_idx on public.daily_tasks (user_id, task_date);
create index if not exists revision_items_due_idx on public.revision_items (user_id, due_at);
create index if not exists error_logs_user_skill_idx on public.error_logs (user_id, skill, resolved);
create index if not exists practice_attempts_user_created_idx on public.practice_attempts (user_id, created_at desc);
create index if not exists xp_events_user_created_idx on public.xp_events (user_id, created_at desc);

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'user_profiles',
    'onboarding_goals',
    'clb_targets',
    'lessons',
    'lesson_sections',
    'practice_questions',
    'diagnostic_attempts',
    'study_plans',
    'daily_tasks',
    'writing_prompts',
    'writing_attempts',
    'speaking_prompts',
    'speaking_attempts',
    'mock_exams',
    'mock_attempts',
    'vocabulary_items',
    'user_vocabulary_progress',
    'grammar_items',
    'revision_items',
    'error_logs',
    'subscriptions'
  ]
  loop
    execute format('drop trigger if exists set_%I_updated_at on public.%I', table_name, table_name);
    execute format(
      'create trigger set_%I_updated_at before update on public.%I for each row execute function public.set_updated_at()',
      table_name,
      table_name
    );
  end loop;
end;
$$;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'speaking-recordings',
  'speaking-recordings',
  false,
  52428800,
  array['audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/wav', 'audio/x-m4a']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "users can upload own speaking recordings" on storage.objects;
create policy "users can upload own speaking recordings"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'speaking-recordings'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "users can read own speaking recordings" on storage.objects;
create policy "users can read own speaking recordings"
on storage.objects for select to authenticated
using (
  bucket_id = 'speaking-recordings'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "users can delete own speaking recordings" on storage.objects;
create policy "users can delete own speaking recordings"
on storage.objects for delete to authenticated
using (
  bucket_id = 'speaking-recordings'
  and (storage.foldername(name))[1] = auth.uid()::text
);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'listening-audio',
  'listening-audio',
  false,
  104857600,
  array['audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/wav', 'audio/ogg']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'content-media',
  'content-media',
  false,
  52428800,
  array['image/png', 'image/jpeg', 'image/webp', 'application/pdf', 'text/vtt']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "authenticated learners can read listening audio" on storage.objects;
create policy "authenticated learners can read listening audio"
on storage.objects for select to authenticated
using (bucket_id = 'listening-audio');

drop policy if exists "admins can manage listening audio" on storage.objects;
create policy "admins can manage listening audio"
on storage.objects for all to authenticated
using (bucket_id = 'listening-audio' and public.is_admin())
with check (bucket_id = 'listening-audio' and public.is_admin());

drop policy if exists "authenticated learners can read content media" on storage.objects;
create policy "authenticated learners can read content media"
on storage.objects for select to authenticated
using (bucket_id = 'content-media');

drop policy if exists "admins can manage content media" on storage.objects;
create policy "admins can manage content media"
on storage.objects for all to authenticated
using (bucket_id = 'content-media' and public.is_admin())
with check (bucket_id = 'content-media' and public.is_admin());


-- ============ from 0003_onboarding_test_details.sql ============

-- Onboarding now captures test format, test location, and the IELTS overall
-- band behind the CLB target. All additions are optional so existing rows and
-- older app builds keep working.

alter table public.onboarding_goals
  add column if not exists test_format text
    check (test_format is null or test_format in ('computer', 'paper', 'unsure')),
  add column if not exists test_location text;

alter table public.clb_targets
  add column if not exists target_overall_band numeric(2,1)
    check (target_overall_band is null or target_overall_band between 4 and 9);

-- The wizard now supports goals below CLB 7 (overall bands from 5.0).
alter table public.clb_targets
  drop constraint if exists clb_targets_target_clb_check;

alter table public.clb_targets
  add constraint clb_targets_target_clb_check check (target_clb between 5 and 10);


-- ============ from 0004_learner_persistence.sql ============

-- Learner persistence completion: lesson progress tracking plus safety
-- indexes used by the Supabase-mode services. Additive and idempotent.

create table if not exists public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  status text not null default 'completed',
  completed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);

alter table public.lesson_progress enable row level security;

drop policy if exists "own lesson progress" on public.lesson_progress;
create policy "own lesson progress" on public.lesson_progress
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop trigger if exists set_lesson_progress_updated_at on public.lesson_progress;
create trigger set_lesson_progress_updated_at
  before update on public.lesson_progress
  for each row execute function public.set_updated_at();

-- One revision item per reference so wrong answers do not stack duplicates.
-- (No app code has written revision_items before this migration; the dedupe
-- below is a no-op on healthy databases and only clears exact duplicates.)
delete from public.revision_items a
  using public.revision_items b
  where a.user_id = b.user_id
    and a.ref_type = b.ref_type
    and a.ref_id = b.ref_id
    and a.id > b.id;

create unique index if not exists uq_revision_items_ref
  on public.revision_items (user_id, ref_type, ref_id);

create index if not exists idx_lesson_progress_user on public.lesson_progress (user_id, completed_at desc);
create index if not exists idx_daily_tasks_user_date on public.daily_tasks (user_id, task_date);
create index if not exists idx_practice_attempts_user_created on public.practice_attempts (user_id, created_at desc);
create index if not exists idx_writing_attempts_user_created on public.writing_attempts (user_id, created_at desc);
create index if not exists idx_speaking_attempts_user_created on public.speaking_attempts (user_id, created_at desc);
create index if not exists idx_mock_attempts_user_created on public.mock_attempts (user_id, created_at desc);
create index if not exists idx_revision_items_user_due on public.revision_items (user_id, due_at);
create index if not exists idx_xp_events_user_created on public.xp_events (user_id, created_at desc);
create index if not exists idx_error_logs_user_resolved on public.error_logs (user_id, resolved);


-- ============ from 0005_content_sources_and_classification.sql ============

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


-- ============ from 0006_rich_lesson_content.sql ============

-- Rich lesson content model: typed section kinds + structured payloads,
-- lesson difficulty/CLB metadata, saved lesson key points. Additive.
alter table public.lesson_sections
  add column if not exists kind text not null default 'explanation';
alter table public.lesson_sections
  add column if not exists data jsonb;

alter table public.lessons
  add column if not exists difficulty int not null default 2;
alter table public.lessons
  add column if not exists clb_focus text;

do $$ begin
  alter table public.lessons
    add constraint lessons_difficulty_range check (difficulty between 1 and 3);
exception when duplicate_object then null; end $$;

alter table public.revision_items
  add column if not exists title text;
alter table public.revision_items
  add column if not exists note text;
