import { describe, expect, it } from "vitest";
import { submitWriting } from "@/lib/services/writing";

describe("writing feedback task handling", () => {
  it("uses the Task 2 word target for Task 2 prompts", async () => {
    const attempt = await submitWriting({
      promptId: "writing-6",
      text: Array.from({ length: 180 }, () => "library").join(" "),
      timeMs: 1000,
    });

    expect(attempt.estimate?.band.low).toBe(5.5);
    expect(attempt.estimate?.band.disclaimer).toBe(
      "This is an estimated practice score, not an official IELTS score.",
    );
  });
});
