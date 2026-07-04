import { getServiceContext } from "@/lib/services/context";
import { getDataModeLabel } from "@/lib/supabase/env";
import { ok } from "@/lib/validation/api";

export const dynamic = "force-dynamic";

// Safe status endpoint: reports data mode + session + row presence, never
// secrets, tokens, or row contents.
export async function GET() {
  const ctx = await getServiceContext();

  if (ctx.mode === "mock") {
    return ok({
      mode: "mock",
      label: getDataModeLabel(),
      session: "n/a (mock mode)",
      profileLoaded: true,
      onboardingLoaded: true,
    });
  }

  if (!ctx.supabase || !ctx.user) {
    return ok({
      mode: "supabase",
      label: getDataModeLabel(),
      session: "signed out",
      profileLoaded: false,
      onboardingLoaded: false,
    });
  }

  const [profile, goal, plan, lastXp] = await Promise.all([
    ctx.supabase.from("user_profiles").select("onboarded").eq("user_id", ctx.user.id).maybeSingle(),
    ctx.supabase.from("onboarding_goals").select("user_id").eq("user_id", ctx.user.id).maybeSingle(),
    ctx.supabase.from("study_plans").select("id").eq("user_id", ctx.user.id).eq("status", "active").maybeSingle(),
    ctx.supabase
      .from("xp_events")
      .select("created_at")
      .eq("user_id", ctx.user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  return ok({
    mode: "supabase",
    label: getDataModeLabel(),
    session: "signed in",
    profileLoaded: Boolean(profile.data),
    onboarded: Boolean(profile.data?.onboarded),
    onboardingLoaded: Boolean(goal.data),
    planLoaded: Boolean(plan.data),
    lastWriteAt: lastXp.data?.created_at ?? null,
  });
}
