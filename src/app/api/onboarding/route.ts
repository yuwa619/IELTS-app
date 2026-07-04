import { targetForClb } from "@/lib/scoring/clb";
import { getDataMode } from "@/lib/services/data-mode";
import { saveOnboarding } from "@/lib/services/onboarding";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { fail, ok, validationError } from "@/lib/validation/api";
import { onboardingSchema } from "@/lib/validation/schemas";

export async function POST(request: Request) {
  const parsed = onboardingSchema.safeParse(await request.json());
  if (!parsed.success) return validationError(parsed.error);

  if (parsed.data.testDate) {
    const today = new Date().toISOString().slice(0, 10);
    if (parsed.data.testDate < today) {
      return fail("test_date_in_past", "Pick a test date that is today or later.", 400);
    }
  }

  if (getDataMode() === "mock") {
    return ok(await saveOnboarding(parsed.data));
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return fail("supabase_unavailable", "Supabase is configured incorrectly.", 500);
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return fail("unauthorized", "Sign in before saving onboarding.", 401);
  }

  const target = targetForClb(parsed.data.targetClb, user.id);

  // This route is the MVP's first live-write pattern:
  // validate input, branch mock vs Supabase mode, require auth in Supabase mode,
  // then write only rows scoped to auth.uid() so existing RLS remains the safety net.
  const writes = [
    supabase.from("user_profiles").upsert(
      {
        user_id: user.id,
        display_name: user.user_metadata?.name ?? user.email ?? null,
        locale: user.user_metadata?.locale ?? "en-CA",
        onboarded: true,
        daily_minutes: parsed.data.dailyMinutes,
      },
      { onConflict: "user_id" },
    ),
    supabase.from("onboarding_goals").upsert(
      {
        user_id: user.id,
        goal_mode: parsed.data.goalMode,
        test_date: parsed.data.testDate ?? null,
        test_format: parsed.data.testFormat ?? null,
        test_location: parsed.data.testLocation?.trim() || null,
        confidence: parsed.data.confidence,
      },
      { onConflict: "user_id" },
    ),
    supabase.from("clb_targets").upsert(
      {
        user_id: user.id,
        target_clb: parsed.data.targetClb,
        target_overall_band: parsed.data.targetOverallBand ?? null,
        listening: target.listening,
        reading: target.reading,
        writing: target.writing,
        speaking: target.speaking,
      },
      { onConflict: "user_id" },
    ),
  ];

  for (const write of writes) {
    const { error } = await write;
    if (error) return fail("supabase_write_failed", error.message, 500);
  }

  return ok({
    mode: "supabase",
    goal: {
      userId: user.id,
      goalMode: parsed.data.goalMode,
      testDate: parsed.data.testDate ?? null,
      testFormat: parsed.data.testFormat ?? "unsure",
      testLocation: parsed.data.testLocation?.trim() || null,
      confidence: parsed.data.confidence,
    },
    targets: { ...target, targetOverallBand: parsed.data.targetOverallBand ?? null },
  });
}
