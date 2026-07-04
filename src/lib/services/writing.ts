import { writingPrompts } from "@/lib/mock-data";
import { getAIProvider } from "@/lib/ai";
import type { WritingPrompt } from "@/types/domain";
import { getServiceContext, requireUser } from "./context";
import { isUuid } from "./content-refs";
import { awardXpEvent } from "./gamify";

function promptFromRow(row: Record<string, unknown>): WritingPrompt {
  return {
    id: String(row.id),
    task: row.task as WritingPrompt["task"],
    title: String(row.title ?? row.letter_type ?? "Writing prompt"),
    prompt: String(row.prompt),
    bullets: (row.bullets as string[]) ?? [],
    type: String(row.letter_type ?? row.essay_type ?? ""),
    published: Boolean(row.published),
  };
}

export async function getWritingPrompts(task?: "task1" | "task2") {
  const ctx = await getServiceContext();
  if (ctx.mode === "supabase" && ctx.supabase) {
    let query = ctx.supabase.from("writing_prompts").select("*").eq("published", true);
    if (task) query = query.eq("task", task);
    const { data } = await query;
    if (data?.length) return data.map(promptFromRow);
  }
  return task ? writingPrompts.filter((prompt) => prompt.task === task) : writingPrompts;
}

export async function submitWriting(input: { promptId: string; text: string; timeMs: number }) {
  const ctx = await getServiceContext();

  let promptTask: "task1" | "task2" = "task1";
  if (ctx.mode === "supabase" && ctx.supabase && isUuid(input.promptId)) {
    const { data } = await ctx.supabase
      .from("writing_prompts")
      .select("task")
      .eq("id", input.promptId)
      .maybeSingle();
    if (data?.task) promptTask = data.task as "task1" | "task2";
  } else {
    const bundled = writingPrompts.find((item) => item.id === input.promptId);
    if (bundled) promptTask = bundled.task;
  }

  const wordCount = input.text.trim().split(/\s+/).filter(Boolean).length;
  const estimate = await getAIProvider().estimateWriting({ task: promptTask, text: input.text });

  if (ctx.mode === "mock") {
    return {
      id: "writing-attempt-mock",
      userId: "mock-user",
      promptId: input.promptId,
      text: input.text,
      wordCount,
      timeMs: input.timeMs,
      estimate,
      saved: false,
    };
  }

  const { supabase, user } = requireUser(ctx);
  const { data, error } = await supabase
    .from("writing_attempts")
    .insert({
      user_id: user.id,
      prompt_id: isUuid(input.promptId) ? input.promptId : null,
      text: input.text,
      word_count: wordCount,
      time_ms: input.timeMs,
      estimate: { ...estimate, promptRef: input.promptId },
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);

  await awardXpEvent(supabase, user.id, "writing", data.id, 25, `Writing ${promptTask} attempt`);

  return {
    id: String(data.id),
    userId: user.id,
    promptId: input.promptId,
    text: input.text,
    wordCount,
    timeMs: input.timeMs,
    estimate,
    saved: true,
  };
}

export async function getWritingHistory() {
  const ctx = await getServiceContext();
  if (ctx.mode === "mock") return [];
  const { supabase, user } = requireUser(ctx);
  const { data } = await supabase
    .from("writing_attempts")
    .select("id, prompt_id, word_count, estimate, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);
  return data ?? [];
}
