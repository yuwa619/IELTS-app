import { practiceQuestions, skillProgress, speakingPrompts, writingPrompts } from "@/lib/mock-data";

export async function getDiagnosticSet() {
  return {
    listening: practiceQuestions.filter((q) => q.skill === "listening").slice(0, 2),
    reading: practiceQuestions.filter((q) => q.skill === "reading").slice(0, 2),
    writing: writingPrompts.find((prompt) => prompt.task === "task1"),
    speaking: speakingPrompts.find((prompt) => prompt.part === "p2"),
  };
}

export async function getDiagnosticResult() {
  return {
    startingBand: 5.5,
    clb: 6,
    targetClb: 9,
    skills: skillProgress,
    weakest: "writing",
  };
}
