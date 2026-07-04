import { speakingPrompts } from "@/lib/mock-data";
import { getAIProvider } from "@/lib/ai";
import type { SpeakingPrompt } from "@/types/domain";
import { getServiceContext, requireUser } from "./context";
import { isUuid } from "./content-refs";
import { awardXpEvent } from "./gamify";

function promptFromRow(row: Record<string, unknown>): SpeakingPrompt {
  return {
    id: String(row.id),
    part: row.part as SpeakingPrompt["part"],
    topic: String(row.topic ?? ""),
    prompt: String(row.prompt),
    cuePoints: (row.cue_points as string[]) ?? [],
    published: Boolean(row.published),
    moduleType: (row.module_type as SpeakingPrompt["moduleType"]) ?? "shared",
    sourceName: (row.source_name as string) ?? undefined,
  };
}

export async function getSpeakingPrompts() {
  const ctx = await getServiceContext();
  if (ctx.mode === "supabase" && ctx.supabase) {
    const { data } = await ctx.supabase
      .from("speaking_prompts")
      .select("*")
      .eq("published", true);
    if (data?.length) return data.map(promptFromRow);
  }
  return speakingPrompts;
}

export async function submitSpeaking(input: {
  promptId: string;
  path?: string;
  durationS: number;
  selfRating?: Record<string, number>;
}) {
  const estimate = await getAIProvider().estimateSpeaking({
    durationS: input.durationS,
    selfRating: input.selfRating,
  });

  const ctx = await getServiceContext();
  if (ctx.mode === "mock") {
    return {
      id: "speaking-attempt-mock",
      userId: "mock-user",
      promptId: input.promptId,
      audioPath: input.path ?? "mock-local-recording.webm",
      durationS: input.durationS,
      selfRating: input.selfRating,
      estimate,
      saved: false,
    };
  }

  const { supabase, user } = requireUser(ctx);
  const { data, error } = await supabase
    .from("speaking_attempts")
    .insert({
      user_id: user.id,
      prompt_id: isUuid(input.promptId) ? input.promptId : null,
      audio_path: input.path ?? null,
      duration_s: Math.round(input.durationS),
      self_rating: input.selfRating ?? null,
      estimate: { ...estimate, promptRef: input.promptId },
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);

  await awardXpEvent(supabase, user.id, "speaking", data.id, 25, "Speaking practice attempt");

  return {
    id: String(data.id),
    userId: user.id,
    promptId: input.promptId,
    audioPath: input.path ?? null,
    durationS: input.durationS,
    selfRating: input.selfRating,
    estimate,
    saved: true,
  };
}
