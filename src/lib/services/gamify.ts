import { badges as mockBadges, xpEvents } from "@/lib/mock-data";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getServiceContext, requireUser } from "./context";

function levelForXp(xp: number) {
  return Math.max(1, Math.floor(xp / 120) + 1);
}

function streakFromDays(days: string[]) {
  // Distinct active days, counting back from today with one repair day allowed.
  const set = new Set(days);
  let streak = 0;
  let misses = 0;
  const cursor = new Date();
  for (;;) {
    const iso = cursor.toISOString().slice(0, 10);
    if (set.has(iso)) {
      streak += 1;
    } else if (streak === 0 || misses < 1) {
      misses += 1;
      if (misses > 1) break;
    } else {
      break;
    }
    cursor.setDate(cursor.getDate() - 1);
    if (streak + misses > 400) break;
  }
  return streak;
}

export async function getGamifySummary() {
  const ctx = await getServiceContext();
  if (ctx.mode === "mock") {
    const xp = xpEvents.reduce((sum, event) => sum + event.amount, 0);
    return { xp, level: levelForXp(xp), streak: 12, badges: mockBadges, earnedBadgeIds: mockBadges.slice(0, 2).map((b) => b.id) };
  }

  const { supabase, user } = requireUser(ctx);
  const [events, catalogue, earned] = await Promise.all([
    supabase.from("xp_events").select("amount, created_at").eq("user_id", user.id),
    supabase.from("badges").select("*").order("code"),
    supabase.from("user_badges").select("badge_id").eq("user_id", user.id),
  ]);

  const xp = (events.data ?? []).reduce((sum, row) => sum + Number(row.amount), 0);
  const days = [...new Set((events.data ?? []).map((row) => String(row.created_at).slice(0, 10)))];

  return {
    xp,
    level: levelForXp(xp),
    streak: streakFromDays(days),
    badges: (catalogue.data ?? []).map((row) => ({
      id: String(row.id),
      code: String(row.code),
      name: String(row.name),
      description: String(row.description),
      criterion: row.criterion,
      art: String(row.art ?? ""),
    })),
    earnedBadgeIds: (earned.data ?? []).map((row) => String(row.badge_id)),
  };
}

// Idempotent XP award: unique(user_id, source_type, source_id) means a repeat
// completion is a no-op and returns awarded=false.
export async function awardXpEvent(
  supabase: SupabaseClient,
  userId: string,
  sourceType: string,
  sourceId: string,
  amount: number,
  reason: string,
) {
  const { error } = await supabase.from("xp_events").insert({
    user_id: userId,
    source_type: sourceType,
    source_id: sourceId,
    amount,
    reason,
  });
  if (error) {
    if (error.code === "23505") return { awarded: false, amount: 0 };
    throw new Error(error.message);
  }
  await evaluateBadges(supabase, userId);
  return { awarded: true, amount };
}

// Minimal badge rules evaluated from the xp ledger; awards are idempotent via
// unique(user_id, badge_id).
const badgeRules: { code: string; test: (counts: Map<string, number>, days: number) => boolean }[] = [
  { code: "first-plan", test: (counts) => (counts.get("plan") ?? 0) >= 1 },
  { code: "review-first", test: (counts) => (counts.get("revision") ?? 0) >= 1 },
  { code: "mini-mock", test: (counts) => (counts.get("mock") ?? 0) >= 1 },
  { code: "streak-7", test: (_counts, days) => days >= 7 },
];

async function evaluateBadges(supabase: SupabaseClient, userId: string) {
  const { data: events } = await supabase
    .from("xp_events")
    .select("source_type, created_at")
    .eq("user_id", userId);
  if (!events?.length) return;

  const counts = new Map<string, number>();
  for (const event of events) {
    counts.set(event.source_type, (counts.get(event.source_type) ?? 0) + 1);
  }
  const activeDays = new Set(events.map((event) => String(event.created_at).slice(0, 10))).size;

  const earnedCodes = badgeRules
    .filter((rule) => rule.test(counts, activeDays))
    .map((rule) => rule.code);
  if (!earnedCodes.length) return;

  const { data: badgeRows } = await supabase
    .from("badges")
    .select("id, code")
    .in("code", earnedCodes);
  for (const badge of badgeRows ?? []) {
    // upsert with ignoreDuplicates keeps awards single-shot
    await supabase
      .from("user_badges")
      .upsert(
        { user_id: userId, badge_id: badge.id },
        { onConflict: "user_id,badge_id", ignoreDuplicates: true },
      );
  }
}

export function awardXp(sourceType: string, sourceId: string, amount: number) {
  return {
    id: `${sourceType}-${sourceId}`,
    userId: "mock-user",
    sourceType,
    sourceId,
    amount,
    reason: "Mock MVP completion event",
  };
}
