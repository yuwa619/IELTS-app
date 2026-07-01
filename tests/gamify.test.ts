import { describe, expect, it } from "vitest";
import { awardXp } from "@/lib/services/gamify";
import { gradeRevision } from "@/lib/services/revision";

describe("gamification and revision", () => {
  it("uses source id for idempotent XP event shape", () => {
    expect(awardXp("lesson", "lesson-1", 30)).toMatchObject({
      id: "lesson-lesson-1",
      amount: 30,
    });
  });

  it("schedules easier review farther into the future", async () => {
    const hard = await gradeRevision("revision-1", "hard");
    const easy = await gradeRevision("revision-1", "easy");
    expect(new Date(easy.nextDueAt).getTime()).toBeGreaterThan(new Date(hard.nextDueAt).getTime());
  });
});
