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

create policy "users can upload own speaking recordings"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'speaking-recordings'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "users can read own speaking recordings"
on storage.objects for select to authenticated
using (
  bucket_id = 'speaking-recordings'
  and (storage.foldername(name))[1] = auth.uid()::text
);

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

create policy "authenticated learners can read listening audio"
on storage.objects for select to authenticated
using (bucket_id = 'listening-audio');

create policy "admins can manage listening audio"
on storage.objects for all to authenticated
using (bucket_id = 'listening-audio' and public.is_admin())
with check (bucket_id = 'listening-audio' and public.is_admin());

create policy "authenticated learners can read content media"
on storage.objects for select to authenticated
using (bucket_id = 'content-media');

create policy "admins can manage content media"
on storage.objects for all to authenticated
using (bucket_id = 'content-media' and public.is_admin())
with check (bucket_id = 'content-media' and public.is_admin());
