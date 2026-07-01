import { revisionItems } from "@/lib/mock-data";

export async function getDueRevision() {
  return revisionItems;
}

export async function gradeRevision(itemId: string, grade: "again" | "hard" | "good" | "easy") {
  const days = { again: 1, hard: 2, good: 4, easy: 7 }[grade];
  const nextDueAt = new Date(Date.now() + days * 86_400_000).toISOString();
  return { itemId, nextDueAt };
}
