import { speakingPrompts } from "@/lib/mock-data";
import { getAIProvider } from "@/lib/ai";

export async function getSpeakingPrompts() {
  return speakingPrompts;
}

export async function submitSpeaking(input: { promptId: string; path?: string; durationS: number; selfRating?: Record<string, number> }) {
  const estimate = await getAIProvider().estimateSpeaking({ durationS: input.durationS, selfRating: input.selfRating });
  return {
    id: "speaking-attempt-mock",
    userId: "mock-user",
    promptId: input.promptId,
    audioPath: input.path ?? "mock-local-recording.webm",
    durationS: input.durationS,
    selfRating: input.selfRating,
    estimate,
  };
}
