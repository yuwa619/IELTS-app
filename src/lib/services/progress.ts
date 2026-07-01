import { badges, errorLogs, revisionItems, skillProgress, xpEvents } from "@/lib/mock-data";

export async function getProgress() {
  return {
    skills: skillProgress,
    target: { listening: 8, reading: 7, writing: 7, speaking: 7 },
    scoreHistory: [5.5, 5.5, 6, 6],
    weaknesses: errorLogs,
    revisionQueue: revisionItems,
    xp: xpEvents.reduce((sum, event) => sum + event.amount, 0),
    streak: 12,
    badges,
  };
}
