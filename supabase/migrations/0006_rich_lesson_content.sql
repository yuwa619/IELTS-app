-- Rich lesson content model: typed section kinds with structured payloads,
-- lesson difficulty/CLB metadata, and saved lesson key points in the
-- revision queue. Fully additive and idempotent — no data is dropped.

-- 1. Lesson sections gain a kind + structured data payload ------------------
-- kind drives the lesson player UI (explanation, example, mistake, strategy,
-- checklist, guided_practice, quick_check, reflection, key_point, next_step,
-- intro, objectives, gt_relevance). Existing rows default to 'explanation'
-- so nothing breaks for already-seeded content.
alter table public.lesson_sections
  add column if not exists kind text not null default 'explanation';

alter table public.lesson_sections
  add column if not exists data jsonb;

-- 2. Lesson metadata for the lesson browser ---------------------------------
alter table public.lessons
  add column if not exists difficulty int not null default 2;

alter table public.lessons
  add column if not exists clb_focus text;

do $$ begin
  alter table public.lessons
    add constraint lessons_difficulty_range check (difficulty between 1 and 3);
exception when duplicate_object then null; end $$;

-- 3. Revision items can carry a saved note (lesson key points) --------------
-- "Save key point" upserts one row per (user, 'lesson', lesson_id) via the
-- existing uq_revision_items_ref unique index from migration 0004.
alter table public.revision_items
  add column if not exists title text;

alter table public.revision_items
  add column if not exists note text;
