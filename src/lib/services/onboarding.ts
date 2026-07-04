import { targetForClb } from "@/lib/scoring/clb";
import type { GoalMode, TestFormat } from "@/types/domain";

export async function saveOnboarding(input: {
  goalMode: GoalMode;
  targetClb: number;
  targetOverallBand?: number;
  testDate?: string | null;
  testFormat?: TestFormat;
  testLocation?: string;
  confidence: number;
  dailyMinutes: number;
}) {
  return {
    goal: {
      userId: "mock-user",
      goalMode: input.goalMode,
      testDate: input.testDate ?? null,
      testFormat: input.testFormat ?? "unsure",
      testLocation: input.testLocation?.trim() || null,
      confidence: input.confidence,
    },
    targets: {
      ...targetForClb(input.targetClb),
      targetOverallBand: input.targetOverallBand ?? null,
    },
  };
}
