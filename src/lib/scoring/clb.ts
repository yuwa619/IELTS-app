import type { CLBTarget, Skill } from "@/types/domain";

export const CLB_FACTS = [
  "CLB 7 = IELTS 6.0 in Listening, Reading, Writing and Speaking.",
  "CLB 9 = Listening 8.0, Reading 7.0, Writing 7.0, Speaking 7.0.",
  "CLB 10 = Listening 8.5, Reading 8.0, Writing 7.5, Speaking 7.5.",
  "IELTS General Training is used for Express Entry language proof.",
  "IELTS One Skill Retake is not accepted for Express Entry.",
];

export const CLB_TO_IELTS: Record<number, Record<Skill, number>> = {
  7: { listening: 6, reading: 6, writing: 6, speaking: 6 },
  8: { listening: 7.5, reading: 6.5, writing: 6.5, speaking: 6.5 },
  9: { listening: 8, reading: 7, writing: 7, speaking: 7 },
  10: { listening: 8.5, reading: 8, writing: 7.5, speaking: 7.5 },
};

export function targetForClb(targetClb: number, userId = "mock-user"): CLBTarget {
  const map = CLB_TO_IELTS[targetClb] ?? CLB_TO_IELTS[9];
  return {
    userId,
    targetClb,
    ...map,
  };
}

export function roundOverallBand(scores: Record<Skill, number>) {
  const average =
    (scores.listening + scores.reading + scores.writing + scores.speaking) / 4;
  return Math.round(average * 2) / 2;
}

export function clbLabel(targetClb: number) {
  if (targetClb === 7) return "CLB 7 · eligible";
  if (targetClb === 9) return "CLB 9 · CRS-competitive";
  if (targetClb === 10) return "CLB 10 · maximum language target";
  return `CLB ${targetClb}`;
}
