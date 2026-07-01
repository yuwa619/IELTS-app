import { badges, xpEvents } from "@/lib/mock-data";

export async function getGamifySummary() {
  const xp = xpEvents.reduce((sum, event) => sum + event.amount, 0);
  return {
    xp,
    level: Math.max(1, Math.floor(xp / 120) + 1),
    streak: 12,
    badges,
  };
}

export function awardXp(sourceType: string, sourceId: string, amount: number) {
  return {
    id: `${sourceType}-${sourceId}`,
    userId: "mock-user",
    sourceType,
    sourceId,
    amount,
    reason: "Mock MVP completion event",
  };
}
