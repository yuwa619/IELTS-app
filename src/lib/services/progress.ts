import { badges, errorLogs, revisionItems, skillProgress, xpEvents } from "@/lib/mock-data";
import type { Skill } from "@/types/domain";
import { getServiceContext, requireUser } from "./context";
import { getGamifySummary } from "./gamify";
import { getTarget } from "./profile";

// Rough accuracy→estimated-band mapping for drill practice. Clearly formative:
// real bands come from mocks; this powers the progress meters only.
function bandFromAccuracy(accuracy: number | null) {
  if (accuracy === null) return null;
  if (accuracy >= 0.85) return 7.5;
  if (accuracy >= 0.7) return 6.5;
  if (accuracy >= 0.55) return 6;
  if (accuracy >= 0.4) return 5.5;
  return 5;
}

export async function getProgress() {
  const ctx = await getServiceContext();
  if (ctx.mode === "mock") {
    return {
      skills: skillProgress,
      target: { listening: 8, reading: 7, writing: 7, speaking: 7 },
      scoreHistory: [5.5, 5.5, 6, 6],
      weaknesses: errorLogs,
      revisionQueue: revisionItems,
      xp: xpEvents.reduce((sum, event) => sum + event.amount, 0),
      streak: 12,
      badges,
      earnedBadgeIds: badges.slice(0, 2).map((badge) => badge.id),
    };
  }

  const { supabase, user } = requireUser(ctx);
  const [attempts, mocks, errors, due, gamify, target] = await Promise.all([
    supabase
      .from("practice_attempts")
      .select("is_correct, response")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(400),
    supabase
      .from("mock_attempts")
      .select("band_estimate, created_at")
      .eq("user_id", user.id)
      .order("created_at"),
    supabase
      .from("error_logs")
      .select("*")
      .eq("user_id", user.id)
      .eq("resolved", false)
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("revision_items")
      .select("id, ref_type, ref_id, due_at, ease, interval")
      .eq("user_id", user.id)
      .lte("due_at", new Date().toISOString())
      .limit(20),
    getGamifySummary(),
    getTarget(),
  ]);

  const bySkill: Record<Skill, { total: number; correct: number }> = {
    listening: { total: 0, correct: 0 },
    reading: { total: 0, correct: 0 },
    writing: { total: 0, correct: 0 },
    speaking: { total: 0, correct: 0 },
  };
  for (const attempt of attempts.data ?? []) {
    const skill = (attempt.response as { skill?: Skill })?.skill;
    if (!skill || !(skill in bySkill)) continue;
    bySkill[skill].total += 1;
    if (attempt.is_correct) bySkill[skill].correct += 1;
  }

  const skills = Object.fromEntries(
    (Object.keys(bySkill) as Skill[]).map((skill) => {
      const { total, correct } = bySkill[skill];
      return [skill, bandFromAccuracy(total >= 3 ? correct / total : null) ?? 0];
    }),
  ) as Record<Skill, number>;

  const scoreHistory = (mocks.data ?? [])
    .map((row) => Number((row.band_estimate as { overall?: number })?.overall))
    .filter((value) => Number.isFinite(value) && value > 0);

  return {
    skills,
    target: {
      listening: target.listening,
      reading: target.reading,
      writing: target.writing,
      speaking: target.speaking,
    },
    scoreHistory,
    weaknesses: (errors.data ?? []).map((row) => ({
      id: String(row.id),
      userId: user.id,
      category: String(row.category),
      skill: row.skill as Skill,
      refType: String(row.ref_type),
      refId: String(row.ref_id),
      note: (row.note as string) ?? undefined,
      resolved: Boolean(row.resolved),
    })),
    revisionQueue: (due.data ?? []).map((row) => ({
      id: String(row.id),
      userId: user.id,
      refType: row.ref_type as "question" | "vocab" | "grammar" | "error",
      refId: String(row.ref_id),
      title: `Review ${String(row.ref_type)} item`,
      dueAt: String(row.due_at),
      ease: Number(row.ease ?? 2.3),
      interval: Number(row.interval ?? 1),
    })),
    xp: gamify.xp,
    streak: gamify.streak,
    badges: gamify.badges,
    earnedBadgeIds: gamify.earnedBadgeIds,
  };
}
