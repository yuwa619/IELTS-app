create extension if not exists "pgcrypto";

create type goal_mode as enum ('eligible', 'crs', 'unsure');
create type skill as enum ('listening', 'reading', 'writing', 'speaking');
create type task_block as enum ('warmup', 'lesson', 'practice', 'review');
create type task_status as enum ('pending', 'done', 'skipped');
create type subscription_plan as enum ('free', 'premium');
create type admin_role as enum ('admin', 'editor');

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.user_profiles (
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

create table public.admin_users (
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

create table public.onboarding_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  goal_mode goal_mode not null,
  test_date date,
  confidence int not null check (confidence between 1 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id)
);

create table public.clb_targets (
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

create table public.lessons (
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

create table public.lesson_sections (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  display_order int not null,
  heading text not null,
  body text not null,
  media jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.practice_questions (
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

create table public.diagnostic_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'in_progress',
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  result jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.diagnostic_answers (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.diagnostic_attempts(id) on delete cascade,
  question_id uuid,
  skill skill not null,
  response jsonb not null default '{}'::jsonb,
  is_correct boolean,
  score numeric,
  created_at timestamptz not null default now()
);

create table public.study_plans (
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

create table public.daily_tasks (
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

create table public.practice_attempts (
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

create table public.writing_prompts (
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

create table public.writing_attempts (
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

create table public.speaking_prompts (
  id uuid primary key default gen_random_uuid(),
  part text not null check (part in ('p1', 'p2', 'p3')),
  topic text not null,
  prompt text not null,
  cue_points jsonb not null default '[]'::jsonb,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.speaking_attempts (
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

create table public.mock_exams (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  type text not null check (type in ('mini', 'half', 'full')),
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.mock_sections (
  id uuid primary key default gen_random_uuid(),
  mock_id uuid not null references public.mock_exams(id) on delete cascade,
  display_order int not null,
  skill skill not null,
  time_limit_s int not null,
  item_refs jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table public.mock_attempts (
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

create table public.vocabulary_items (
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

create table public.user_vocabulary_progress (
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

create table public.grammar_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  rule text not null,
  examples jsonb not null default '[]'::jsonb,
  drill_question_ids jsonb not null default '[]'::jsonb,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.revision_items (
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

create table public.error_logs (
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

create table public.xp_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source_type text not null,
  source_id text not null,
  amount int not null,
  reason text not null,
  created_at timestamptz not null default now(),
  unique(user_id, source_type, source_id)
);

create table public.badges (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text not null,
  criterion jsonb not null default '{}'::jsonb,
  art text,
  created_at timestamptz not null default now()
);

create table public.user_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  badge_id uuid not null references public.badges(id) on delete cascade,
  earned_at timestamptz not null default now(),
  unique(user_id, badge_id)
);

create table public.subscriptions (
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

create policy "own rows" on public.user_profiles for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own goals" on public.onboarding_goals for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own targets" on public.clb_targets for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own diagnostic attempts" on public.diagnostic_attempts for all using (user_id = auth.uid()) with check (user_id = auth.uid());
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
create policy "own plans" on public.study_plans for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own tasks" on public.daily_tasks for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own practice attempts" on public.practice_attempts for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own writing attempts" on public.writing_attempts for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own speaking attempts" on public.speaking_attempts for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own mock attempts" on public.mock_attempts for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own vocab progress" on public.user_vocabulary_progress for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own revision" on public.revision_items for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own errors" on public.error_logs for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own xp" on public.xp_events for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own user badges" on public.user_badges for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own subscription" on public.subscriptions for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "content readable when live" on public.lessons for select using (published or public.is_admin());
create policy "content write admin" on public.lessons for all using (public.is_admin()) with check (public.is_admin());
create policy "lesson sections readable" on public.lesson_sections for select using (exists(select 1 from public.lessons l where l.id = lesson_id and (l.published or public.is_admin())));
create policy "lesson sections admin" on public.lesson_sections for all using (public.is_admin()) with check (public.is_admin());

create policy "practice readable when live" on public.practice_questions for select using (published or public.is_admin());
create policy "practice write admin" on public.practice_questions for all using (public.is_admin()) with check (public.is_admin());
create policy "writing prompts readable when live" on public.writing_prompts for select using (published or public.is_admin());
create policy "writing prompts write admin" on public.writing_prompts for all using (public.is_admin()) with check (public.is_admin());
create policy "speaking prompts readable when live" on public.speaking_prompts for select using (published or public.is_admin());
create policy "speaking prompts write admin" on public.speaking_prompts for all using (public.is_admin()) with check (public.is_admin());
create policy "mock readable when live" on public.mock_exams for select using (published or public.is_admin());
create policy "mock write admin" on public.mock_exams for all using (public.is_admin()) with check (public.is_admin());
create policy "mock sections readable" on public.mock_sections for select using (exists(select 1 from public.mock_exams m where m.id = mock_id and (m.published or public.is_admin())));
create policy "mock sections write admin" on public.mock_sections for all using (public.is_admin()) with check (public.is_admin());
create policy "vocab readable when live" on public.vocabulary_items for select using (published or public.is_admin());
create policy "vocab write admin" on public.vocabulary_items for all using (public.is_admin()) with check (public.is_admin());
create policy "grammar readable when live" on public.grammar_items for select using (published or public.is_admin());
create policy "grammar write admin" on public.grammar_items for all using (public.is_admin()) with check (public.is_admin());
create policy "badges readable" on public.badges for select using (true);
create policy "badges write admin" on public.badges for all using (public.is_admin()) with check (public.is_admin());
create policy "admin users readable by admins" on public.admin_users for select using (public.is_admin());
create policy "admin users write by admins" on public.admin_users for all using (public.is_admin()) with check (public.is_admin());
