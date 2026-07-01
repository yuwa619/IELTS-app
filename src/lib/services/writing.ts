import { writingPrompts } from "@/lib/mock-data";
import { getAIProvider } from "@/lib/ai";

export async function getWritingPrompts(task?: "task1" | "task2") {
  return task ? writingPrompts.filter((prompt) => prompt.task === task) : writingPrompts;
}

export async function submitWriting(input: { promptId: string; text: string; timeMs: number }) {
  const prompt = writingPrompts.find((item) => item.id === input.promptId) ?? writingPrompts[0];
  const estimate = await getAIProvider().estimateWriting({ task: prompt.task, text: input.text });
  return {
    id: "writing-attempt-mock",
    userId: "mock-user",
    promptId: input.promptId,
    text: input.text,
    wordCount: input.text.trim().split(/\s+/).filter(Boolean).length,
    timeMs: input.timeMs,
    estimate,
  };
}
