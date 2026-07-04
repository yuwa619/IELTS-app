import { mockGoal, mockTarget, mockUser } from "@/lib/mock-data";
import { targetForClb } from "@/lib/scoring/clb";
import type { CanadaGoal, CLBTarget, UserProfile } from "@/types/domain";
import { getServiceContext, requireUser } from "./context";

function profileFromRow(row: Record<string, unknown>): UserProfile {
  return {
    userId: String(row.user_id),
    displayName: (row.display_name as string | null) ?? null,
    locale: String(row.locale ?? "en-CA"),
    onboarded: Boolean(row.onboarded),
    dailyMinutes: Number(row.daily_minutes ?? 30),
    consentAudio: Boolean(row.consent_audio),
    consentSamples: Boolean(row.consent_samples),
  };
}

export async function getProfile(): Promise<UserProfile> {
  const ctx = await getServiceContext();
  if (ctx.mode === "mock") return mockUser;

  const { supabase, user } = requireUser(ctx);
  const { data } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!data) {
    return {
      userId: user.id,
      displayName: user.email ?? null,
      locale: "en-CA",
      onboarded: false,
      dailyMinutes: 30,
      consentAudio: false,
      consentSamples: false,
    };
  }
  return profileFromRow(data);
}

export async function updateProfile(patch: {
  displayName?: string;
  dailyMinutes?: number;
  consentAudio?: boolean;
  consentSamples?: boolean;
}): Promise<UserProfile> {
  const ctx = await getServiceContext();
  if (ctx.mode === "mock") return { ...mockUser, ...patch };

  const { supabase, user } = requireUser(ctx);
  const { data, error } = await supabase
    .from("user_profiles")
    .upsert(
      {
        user_id: user.id,
        ...(patch.displayName !== undefined ? { display_name: patch.displayName } : {}),
        ...(patch.dailyMinutes !== undefined ? { daily_minutes: patch.dailyMinutes } : {}),
        ...(patch.consentAudio !== undefined ? { consent_audio: patch.consentAudio } : {}),
        ...(patch.consentSamples !== undefined ? { consent_samples: patch.consentSamples } : {}),
      },
      { onConflict: "user_id" },
    )
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return profileFromRow(data);
}

export async function getGoal(): Promise<CanadaGoal> {
  const ctx = await getServiceContext();
  if (ctx.mode === "mock") return mockGoal;

  const { supabase, user } = requireUser(ctx);
  const { data } = await supabase
    .from("onboarding_goals")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  return {
    userId: user.id,
    goalMode: (data?.goal_mode as CanadaGoal["goalMode"]) ?? "unsure",
    testDate: (data?.test_date as string | null) ?? null,
    testFormat: (data?.test_format as CanadaGoal["testFormat"]) ?? "unsure",
    testLocation: (data?.test_location as string | null) ?? null,
    confidence: Number(data?.confidence ?? 3),
  };
}

export async function getTarget(): Promise<CLBTarget> {
  const ctx = await getServiceContext();
  if (ctx.mode === "mock") return mockTarget;

  const { supabase, user } = requireUser(ctx);
  const { data } = await supabase
    .from("clb_targets")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!data) return targetForClb(9, user.id);
  return {
    userId: user.id,
    targetClb: Number(data.target_clb),
    listening: Number(data.listening),
    reading: Number(data.reading),
    writing: Number(data.writing),
    speaking: Number(data.speaking),
  };
}
