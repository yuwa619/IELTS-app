import type { CLBTarget, Skill } from "@/types/domain";

export const CLB_FACTS = [
  "CLB 7 = IELTS 6.0 in Listening, Reading, Writing and Speaking.",
  "CLB 9 = Listening 8.0, Reading 7.0, Writing 7.0, Speaking 7.0.",
  "CLB 10 = Listening 8.5, Reading 8.0, Writing 7.5, Speaking 7.5.",
  "IELTS General Training is used for Express Entry language proof.",
  "IELTS One Skill Retake is not accepted for Express Entry.",
];

export const CLB_TO_IELTS: Record<number, Record<Skill, number>> = {
  5: { listening: 5, reading: 4, writing: 5, speaking: 5 },
  6: { listening: 5.5, reading: 5, writing: 5.5, speaking: 5.5 },
  7: { listening: 6, reading: 6, writing: 6, speaking: 6 },
  8: { listening: 7.5, reading: 6.5, writing: 6.5, speaking: 6.5 },
  9: { listening: 8, reading: 7, writing: 7, speaking: 7 },
  10: { listening: 8.5, reading: 8, writing: 7.5, speaking: 7.5 },
};

export const MIN_OVERALL_BAND = 5;
export const MAX_OVERALL_BAND = 9;

// The onboarding slider works in IELTS overall bands; Express Entry planning
// works in CLB. Each half-band maps to the CLB level it realistically unlocks.
export function clbForOverallBand(band: number) {
  if (band >= 8) return 10;
  if (band >= 7) return 9;
  if (band >= 6.5) return 8;
  if (band >= 6) return 7;
  if (band >= 5.5) return 6;
  return 5;
}

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

export function hardestSkillNote(targetClb: number) {
  const map = CLB_TO_IELTS[targetClb] ?? CLB_TO_IELTS[9];
  const skills = Object.keys(map) as Skill[];
  const max = Math.max(...skills.map((skill) => map[skill]));
  const hardest = skills.filter((skill) => map[skill] === max);
  if (hardest.length === skills.length) {
    return `CLB ${targetClb} needs ${max.toFixed(1)} in every skill. Your plan trains all four evenly.`;
  }
  const names = hardest
    .map((skill) => skill.charAt(0).toUpperCase() + skill.slice(1))
    .join(" and ");
  return `CLB ${targetClb} needs ${names} ${max.toFixed(1)}, higher than the others. We will weight your plan accordingly.`;
}
