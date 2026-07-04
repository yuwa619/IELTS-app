import { lessons } from "@/lib/mock-data";
import type { Lesson } from "@/types/domain";
import { getServiceContext, requireUser } from "./context";
import { isUuid } from "./content-refs";
import { awardXpEvent } from "./gamify";

function lessonFromRow(row: Record<string, unknown>, sections?: Record<string, unknown>[]): Lesson {
  return {
    id: String(row.id),
    title: String(row.title),
    slug: String(row.slug),
    module: String(row.module),
    skill: row.skill as Lesson["skill"],
    summary: String(row.summary ?? ""),
    estMinutes: Number(row.est_minutes ?? 8),
    order: Number(row.display_order ?? 0),
    published: Boolean(row.published),
    moduleType: (row.module_type as Lesson["moduleType"]) ?? "general_training",
    sourceName: (row.source_name as string) ?? undefined,
    sections: sections?.map((section) => ({
      id: String(section.id),
      lessonId: String(section.lesson_id ?? row.id),
      order: Number(section.display_order ?? 0),
      heading: String(section.heading ?? ""),
      body: String(section.body ?? ""),
    })),
  };
}

export async function getLessons(): Promise<(Lesson & { completed?: boolean })[]> {
  const ctx = await getServiceContext();
  if (ctx.mode === "mock") return lessons;

  const { supabase, user } = requireUser(ctx);
  const [{ data: rows }, { data: progress }] = await Promise.all([
    supabase
      .from("lessons")
      .select("*")
      .eq("published", true)
      .in("module_type", ["general_training", "shared"])
      .order("display_order"),
    supabase.from("lesson_progress").select("lesson_id").eq("user_id", user.id),
  ]);
  if (!rows?.length) return lessons; // content not seeded yet

  const done = new Set((progress ?? []).map((row) => String(row.lesson_id)));
  return rows.map((row) => ({ ...lessonFromRow(row), completed: done.has(String(row.id)) }));
}

export async function getLesson(idOrSlug: string): Promise<Lesson & { completed?: boolean }> {
  const ctx = await getServiceContext();
  if (ctx.mode === "mock") {
    return lessons.find((lesson) => lesson.id === idOrSlug || lesson.slug === idOrSlug) ?? lessons[0];
  }

  const { supabase, user } = requireUser(ctx);
  const column = isUuid(idOrSlug) ? "id" : "slug";
  const { data: row } = await supabase
    .from("lessons")
    .select("*")
    .eq(column, idOrSlug)
    .eq("published", true)
    .maybeSingle();
  if (!row) {
    return lessons.find((lesson) => lesson.id === idOrSlug || lesson.slug === idOrSlug) ?? lessons[0];
  }

  const [{ data: sections }, { data: progress }] = await Promise.all([
    supabase.from("lesson_sections").select("*").eq("lesson_id", row.id).order("display_order"),
    supabase
      .from("lesson_progress")
      .select("id")
      .eq("user_id", user.id)
      .eq("lesson_id", row.id)
      .maybeSingle(),
  ]);
  return { ...lessonFromRow(row, sections ?? []), completed: Boolean(progress) };
}

export async function completeLesson(lessonId: string) {
  const ctx = await getServiceContext();
  if (ctx.mode === "mock") return { lessonId, completed: true, xpAwarded: 30 };

  const { supabase, user } = requireUser(ctx);
  if (isUuid(lessonId)) {
    const { error } = await supabase.from("lesson_progress").upsert(
      { user_id: user.id, lesson_id: lessonId, status: "completed" },
      { onConflict: "user_id,lesson_id", ignoreDuplicates: true },
    );
    if (error) throw new Error(error.message);
  }
  // Bundled fallback content skips lesson_progress (uuid FK) but still gets
  // idempotent XP so completion survives.
  const award = await awardXpEvent(supabase, user.id, "lesson", lessonId, 30, "Completed lesson");
  return { lessonId, completed: true, xpAwarded: award.awarded ? award.amount : 0 };
}
