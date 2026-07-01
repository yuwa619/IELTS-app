import { describe, expect, it } from "vitest";
import { shouldRefuseTutorRequest } from "@/lib/ai/guardrails";
import { MockAIProvider } from "@/lib/ai/mock-provider";

describe("AI tutor guardrails", () => {
  it("blocks full essay authoring requests", () => {
    expect(shouldRefuseTutorRequest("Write my essay for me")).toBe(true);
    expect(shouldRefuseTutorRequest("Give me a full band 9 answer to memorise")).toBe(true);
    expect(shouldRefuseTutorRequest("Give me a full speaking answer")).toBe(true);
    expect(shouldRefuseTutorRequest("Provide a model answer to memorise")).toBe(true);
  });

  it("returns formative refusal instead of a full answer", async () => {
    const reply = await new MockAIProvider().tutorReply({ message: "Write my speaking answer" });
    expect(reply.refused).toBe(true);
    expect(reply.reply).toContain("cannot write a full essay or scripted speaking answer");
  });
});
