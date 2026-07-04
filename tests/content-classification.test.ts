import { afterEach, describe, expect, it, vi } from "vitest";
import {
  classifyModuleType,
  isCanadaPathModule,
  moduleTypesForFilters,
} from "@/lib/content/classification";
import { evaluateImportGate, importManifestSchema } from "@/lib/content/import-schema";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("module classifier", () => {
  it("treats Listening and Speaking as shared", () => {
    expect(classifyModuleType({ skillTag: "listening" })).toBe("shared");
    expect(classifyModuleType({ skillTag: "speaking" })).toBe("shared");
  });

  it("classifies GT letters vs Academic charts for Writing Task 1", () => {
    expect(classifyModuleType({ skillTag: "writing_task_1", isLetterTask: true })).toBe(
      "general_training",
    );
    expect(classifyModuleType({ skillTag: "writing_task_1", isChartTask: true })).toBe(
      "academic",
    );
  });

  it("keeps Academic and General Training on the correct side of the Canada path", () => {
    expect(isCanadaPathModule("general_training")).toBe(true);
    expect(isCanadaPathModule("shared")).toBe(true);
    expect(isCanadaPathModule("academic")).toBe(false);
    expect(isCanadaPathModule("unknown")).toBe(false);
  });

  it("only surfaces Academic when explicitly opted in", () => {
    expect(moduleTypesForFilters(["general_training", "shared"])).not.toContain("academic");
    expect(moduleTypesForFilters(["academic_optional"])).toContain("academic");
    // Source-only filters still default to the GT path.
    expect(moduleTypesForFilters(["clearband_original"])).toEqual(
      expect.arrayContaining(["general_training", "shared"]),
    );
  });
});

describe("licensed import gate", () => {
  it("refuses a batch with no written licence and no approved items", () => {
    const manifest = importManifestSchema.parse({
      source: { name: "Example", is_licensed: false, personal_use_only: true },
      batch: { name: "Empty" },
      items: [],
    });
    const gate = evaluateImportGate(manifest);
    expect(gate.ok).toBe(false);
    expect(gate.reasons.join(" ")).toMatch(/written_licence_reference/);
  });

  it("only approves items that are licensed, approved, and flagged for import", () => {
    const manifest = importManifestSchema.parse({
      source: {
        name: "Licensed Example",
        is_licensed: true,
        personal_use_only: true,
        written_licence_reference: "Agreement #123",
      },
      batch: { name: "Batch 1" },
      items: [
        {
          external_ref: "ok-1",
          module_type: "general_training",
          skill: "reading",
          source_type: "practice_question",
          prompt: "Licensed approved item",
          licence_status: "licensed",
          review_status: "approved",
          approved_for_import: true,
        },
        {
          external_ref: "pending-1",
          module_type: "general_training",
          skill: "reading",
          source_type: "practice_question",
          prompt: "Not yet approved",
          licence_status: "licensed",
          review_status: "pending",
          approved_for_import: false,
        },
      ],
    });
    const gate = evaluateImportGate(manifest);
    expect(gate.ok).toBe(true);
    expect(gate.approvedItems).toHaveLength(1);
    expect(gate.approvedItems[0].external_ref).toBe("ok-1");
  });
});

describe("GT-default content services (mock mode)", () => {
  it("Writing Task 1 returns only GT letters, never academic", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "");
    const { getWritingPrompts } = await import("@/lib/services/writing");
    const task1 = await getWritingPrompts("task1");
    expect(task1.length).toBeGreaterThan(0);
    expect(task1.every((p) => p.task === "task1")).toBe(true);
    expect(task1.every((p) => (p.moduleType ?? "general_training") !== "academic")).toBe(true);
  });

  it("Reading practice defaults to General Training content", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "");
    const { getPracticeQuestions } = await import("@/lib/services/practice");
    const reading = await getPracticeQuestions("reading");
    expect(reading.length).toBeGreaterThan(0);
    expect(reading.every((q) => q.skill === "reading")).toBe(true);
    expect(reading.every((q) => (q.moduleType ?? "general_training") !== "academic")).toBe(true);
  });

  it("Listening and Speaking content is shared and present", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "");
    const { getPracticeQuestions, getVocabulary } = await import("@/lib/services/practice");
    const { getSpeakingPrompts } = await import("@/lib/services/speaking");
    const listening = await getPracticeQuestions("listening");
    const speaking = await getSpeakingPrompts();
    expect(listening.every((q) => q.moduleType === "shared")).toBe(true);
    expect(speaking.every((p) => p.moduleType === "shared")).toBe(true);
    expect((await getVocabulary()).length).toBeGreaterThan(0);
  });

  it("expanded original GT content bank carries source metadata", async () => {
    const { practiceQuestions, writingPrompts } = await import("@/lib/mock-data");
    const gtReading = practiceQuestions.filter(
      (q) => q.skill === "reading" && q.moduleType === "general_training",
    );
    expect(gtReading.length).toBeGreaterThanOrEqual(6);
    expect(gtReading.every((q) => q.sourceName === "Clearband Original")).toBe(true);
    const letters = writingPrompts.filter((p) => p.task === "task1");
    expect(letters.every((p) => p.moduleType === "general_training")).toBe(true);
  });
});
