import { revisionItems } from "@/lib/mock-data";
import type { RevisionItem } from "@/types/domain";
import { getServiceContext, requireUser, ServiceError } from "./context";
import { awardXpEvent } from "./gamify";

const gradeToInterval: Record<string, { days: number; easeDelta: number }> = {
  again: { days: 1, easeDelta: -0.2 },
  hard: { days: 2, easeDelta: -0.05 },
  good: { days: 4, easeDelta: 0 },
  easy: { days: 7, easeDelta: 0.1 },
};

function itemFromRow(row: Record<string, unknown>): RevisionItem {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    refType: row.ref_type as RevisionItem["refType"],
    refId: String(row.ref_id),
    title: (row.title as string) || `Review ${String(row.ref_type)} item`,
    note: (row.note as string) ?? undefined,
    dueAt: String(row.due_at),
    ease: Number(row.ease ?? 2.3),
    interval: Number(row.interval ?? 1),
  };
}

/**
 * "Save key point" from a lesson: upserts one revision item per
 * (user, lesson) via the uq_revision_items_ref unique index, due
 * immediately so it appears in the next review session.
 */
export async function saveLessonKeyPoint(lessonId: string, title: string, note: string) {
  const ctx = await getServiceContext();
  if (ctx.mode === "mock") {
    return { saved: true, refId: lessonId };
  }

  const { supabase, user } = requireUser(ctx);
  const { error } = await supabase.from("revision_items").upsert(
    {
      user_id: user.id,
      ref_type: "lesson",
      ref_id: lessonId,
      title,
      note,
      due_at: new Date().toISOString(),
    },
    { onConflict: "user_id,ref_type,ref_id" },
  );
  if (error) throw new Error(error.message);
  return { saved: true, refId: lessonId };
}

export async function getDueRevision(): Promise<RevisionItem[]> {
  const ctx = await getServiceContext();
  if (ctx.mode === "mock") return revisionItems;

  const { supabase, user } = requireUser(ctx);
  const { data } = await supabase
    .from("revision_items")
    .select("*")
    .eq("user_id", user.id)
    .lte("due_at", new Date().toISOString())
    .order("due_at")
    .limit(30);
  return (data ?? []).map(itemFromRow);
}

export async function gradeRevision(
  itemId: string,
  grade: "again" | "hard" | "good" | "easy",
) {
  const rule = gradeToInterval[grade];
  const ctx = await getServiceContext();
  if (ctx.mode === "mock") {
    return { itemId, nextDueAt: new Date(Date.now() + rule.days * 86_400_000).toISOString() };
  }

  const { supabase, user } = requireUser(ctx);
  const { data: item } = await supabase
    .from("revision_items")
    .select("*")
    .eq("id", itemId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!item) throw new ServiceError("revision_not_found", "Revision item not found.", 404);

  // SM-2-lite: interval grows with ease on good/easy, resets on again.
  const ease = Math.min(3, Math.max(1.3, Number(item.ease ?? 2.3) + rule.easeDelta));
  const interval =
    grade === "again"
      ? 1
      : Math.max(rule.days, Math.round(Number(item.interval ?? 1) * ease));
  const nextDueAt = new Date(Date.now() + interval * 86_400_000).toISOString();

  const { error } = await supabase
    .from("revision_items")
    .update({ ease, interval, due_at: nextDueAt, last_grade: grade })
    .eq("id", itemId)
    .eq("user_id", user.id);
  if (error) throw new Error(error.message);

  const today = new Date().toISOString().slice(0, 10);
  await awardXpEvent(
    supabase,
    user.id,
    "revision",
    `${itemId}:${today}`,
    grade === "again" ? 5 : 15,
    "Graded revision item",
  );

  return { itemId, nextDueAt };
}
