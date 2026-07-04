import { dailyTasks, studyPlan } from "@/lib/mock-data";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { DailyBlock, DailyTask, Skill, StudyPlan, TaskStatus } from "@/types/domain";
import { getServiceContext, requireUser, ServiceError } from "./context";
import { awardXpEvent } from "./gamify";

function todayIso() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 10);
}

const weekFocusRotation: { focus: Skill[]; notes: string }[] = [
  { focus: ["reading", "writing"], notes: "TFNG discipline and Task 1 tone." },
  { focus: ["writing", "listening"], notes: "Letter completeness, form completion, first mini mock." },
  { focus: ["speaking", "reading"], notes: "Cue-card fluency and workplace passages." },
  { focus: ["listening", "writing"], notes: "Signposting, spelling accuracy, Task 2 structure." },
];

export async function generateStudyPlan(): Promise<StudyPlan> {
  const ctx = await getServiceContext();
  if (ctx.mode === "mock") return studyPlan;

  const { supabase, user } = requireUser(ctx);
  const existing = await supabase
    .from("study_plans")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();
  if (existing.data) return planFromRow(existing.data);

  const { data: goal } = await supabase
    .from("onboarding_goals")
    .select("test_date")
    .eq("user_id", user.id)
    .maybeSingle();

  const start = new Date(`${todayIso()}T00:00:00Z`);
  const testDate = goal?.test_date ? new Date(`${goal.test_date}T00:00:00Z`) : null;
  const weeksToTest = testDate
    ? Math.max(2, Math.min(12, Math.ceil((testDate.getTime() - start.getTime()) / (7 * 86400000))))
    : 8;

  const weeks = Array.from({ length: weeksToTest }, (_, index) => ({
    weekNumber: index + 1,
    ...weekFocusRotation[index % weekFocusRotation.length],
  }));

  const { data, error } = await supabase
    .from("study_plans")
    .insert({
      user_id: user.id,
      status: "active",
      start_date: todayIso(),
      weeks,
      current_week: 1,
      generated_by: "rule-based",
    })
    .select("*")
    .single();
  if (error) throw new ServiceError("plan_generate_failed", error.message);

  await awardXpEvent(supabase, user.id, "plan", data.id, 20, "Generated study plan");
  return planFromRow(data);
}

function planFromRow(row: Record<string, unknown>): StudyPlan {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    status: String(row.status),
    startDate: String(row.start_date),
    currentWeek: Number(row.current_week ?? 1),
    weeks: (row.weeks as StudyPlan["weeks"]) ?? [],
  };
}

export async function getStudyPlan(): Promise<StudyPlan | null> {
  const ctx = await getServiceContext();
  if (ctx.mode === "mock") return studyPlan;

  const { supabase, user } = requireUser(ctx);
  const { data } = await supabase
    .from("study_plans")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();
  return data ? planFromRow(data) : null;
}

const taskBlueprint: {
  block: DailyBlock;
  refType: string;
  title: string;
  skill: Skill;
  estMinutes: number;
  xp: number;
}[] = [
  { block: "warmup", refType: "revision", title: "Warm-up · review due items", skill: "reading", estMinutes: 4, xp: 20 },
  { block: "lesson", refType: "lesson", title: "Guided lesson", skill: "writing", estMinutes: 8, xp: 30 },
  { block: "practice", refType: "practice", title: "Focused practice", skill: "writing", estMinutes: 10, xp: 30 },
  { block: "review", refType: "review", title: "Review saved mistakes", skill: "reading", estMinutes: 5, xp: 20 },
];

function taskFromRow(row: Record<string, unknown>): DailyTask {
  const blueprint =
    taskBlueprint.find((item) => item.block === row.block) ?? taskBlueprint[0];
  return {
    id: String(row.id),
    userId: String(row.user_id),
    planId: String(row.plan_id ?? ""),
    date: String(row.task_date),
    block: row.block as DailyBlock,
    title: blueprint.title,
    skill: blueprint.skill,
    refType: String(row.ref_type),
    refId: String(row.ref_id),
    status: row.status as TaskStatus,
    estMinutes: blueprint.estMinutes,
    xp: Number(row.xp ?? 0),
  };
}

export async function getTodayTasks(): Promise<DailyTask[]> {
  const ctx = await getServiceContext();
  if (ctx.mode === "mock") return dailyTasks;

  const { supabase, user } = requireUser(ctx);
  const date = todayIso();
  const { data: existing } = await supabase
    .from("daily_tasks")
    .select("*")
    .eq("user_id", user.id)
    .eq("task_date", date)
    .order("created_at");
  if (existing?.length) return existing.map(taskFromRow);

  // First visit today: generate the four blocks from the active plan.
  const plan = await generateStudyPlan();

  // Pick the next uncompleted published lesson for the lesson block.
  const [{ data: lessonRows }, { data: doneRows }] = await Promise.all([
    supabase.from("lessons").select("id").eq("published", true).order("display_order"),
    supabase.from("lesson_progress").select("lesson_id").eq("user_id", user.id),
  ]);
  const doneIds = new Set((doneRows ?? []).map((row) => String(row.lesson_id)));
  const nextLesson = (lessonRows ?? []).find((row) => !doneIds.has(String(row.id)));

  const rows = taskBlueprint.map((blueprint) => ({
    user_id: user.id,
    plan_id: plan.id,
    task_date: date,
    block: blueprint.block,
    ref_type: blueprint.refType,
    ref_id:
      blueprint.block === "lesson" && nextLesson ? String(nextLesson.id) : blueprint.refType,
    status: "pending",
    xp: blueprint.xp,
  }));

  const { data: inserted, error } = await supabase
    .from("daily_tasks")
    .insert(rows)
    .select("*");
  if (error) throw new ServiceError("tasks_generate_failed", error.message);
  return (inserted ?? []).map(taskFromRow);
}

export async function completeTask(taskId: string) {
  const ctx = await getServiceContext();
  if (ctx.mode === "mock") {
    const task = dailyTasks.find((item) => item.id === taskId);
    return { taskId, status: "done" as const, xpAwarded: task?.xp ?? 0 };
  }

  const { supabase, user } = requireUser(ctx);
  const { data: task, error } = await supabase
    .from("daily_tasks")
    .update({ status: "done" })
    .eq("id", taskId)
    .eq("user_id", user.id)
    .select("*")
    .single();
  if (error || !task) {
    throw new ServiceError("task_not_found", "Task not found for this account.", 404);
  }

  const award = await awardXpEvent(
    supabase as SupabaseClient,
    user.id,
    "task",
    taskId,
    Number(task.xp ?? 0),
    `Completed ${task.block} block`,
  );
  return { taskId, status: "done" as const, xpAwarded: award.awarded ? award.amount : 0 };
}
