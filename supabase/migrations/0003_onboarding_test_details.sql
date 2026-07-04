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
