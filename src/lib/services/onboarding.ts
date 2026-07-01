import { targetForClb } from "@/lib/scoring/clb";
import type { GoalMode } from "@/types/domain";

export async function saveOnboarding(input: {
  goalMode: GoalMode;
  targetClb: number;
  testDate?: string | null;
  confidence: number;
  dailyMinutes: number;
}) {
  return {
    goal: { userId: "mock-user", goalMode: input.goalMode, testDate: input.testDate ?? null, confidence: input.confidence },
    targets: targetForClb(input.targetClb),
  };
}
