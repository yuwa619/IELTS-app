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
