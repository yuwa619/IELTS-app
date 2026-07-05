import { describe, expect, it } from "vitest";
import { lessonLibrary } from "@/lib/mock-data/lesson-library";

// Automated content-quality gate: every lesson must be a full interactive
// module, not an outline. These rules mirror the Clearband lesson spec.
describe("lesson library content quality", () => {
  it("has the full 28-lesson GT curriculum", () => {
    expect(lessonLibrary.length).toBe(28);
  });

  it("has unique ids, slugs, and sequential display order", () => {
    const ids = new Set(lessonLibrary.map((lesson) => lesson.id));
    const slugs = new Set(lessonLibrary.map((lesson) => lesson.slug));
    expect(ids.size).toBe(lessonLibrary.length);
    expect(slugs.size).toBe(lessonLibrary.length);
    lessonLibrary.forEach((lesson, index) => expect(lesson.order).toBe(index + 1));
  });

  it("keeps the original seeded slugs stable so Supabase upserts update in place", () => {
    const slugs = new Set(lessonLibrary.map((lesson) => lesson.slug));
    for (const legacy of [
      "ielts-general-training-for-express-entry",
      "choosing-the-right-gt-letter-tone",
      "covering-all-three-bullet-points",
      "task-2-position-and-paragraph-control",
      "true-false-not-given-discipline",
      "scanning-workplace-notices",
      "listening-prediction-and-signposting",
      "form-completion-accuracy",
      "speaking-part-2-cue-map",
      "weekly-review-and-error-repair",
    ]) {
      expect(slugs.has(legacy), `missing legacy slug ${legacy}`).toBe(true);
    }
  });

  it("covers all requested skill areas", () => {
    const byModule = (module: string) =>
      lessonLibrary.filter((lesson) => lesson.module === module).length;
    expect(byModule("Listening")).toBeGreaterThanOrEqual(5);
    expect(byModule("Reading")).toBeGreaterThanOrEqual(5);
    expect(byModule("Writing Task 1")).toBeGreaterThanOrEqual(6);
    expect(byModule("Writing Task 2")).toBeGreaterThanOrEqual(5);
    expect(byModule("Speaking")).toBeGreaterThanOrEqual(5);
  });

  for (const lesson of lessonLibrary) {
    describe(lesson.title, () => {
      const sections = lesson.sections ?? [];
      const ofKind = (kind: string) => sections.filter((section) => section.kind === kind);

      it("meets the minimum interactive module spec", () => {
        expect(ofKind("intro").length).toBeGreaterThanOrEqual(1);
        expect(ofKind("objectives").length).toBeGreaterThanOrEqual(1);
        expect(ofKind("explanation").length).toBeGreaterThanOrEqual(1);
        expect(ofKind("gt_relevance").length).toBeGreaterThanOrEqual(1);
        expect(ofKind("example").length, "at least 2 examples").toBeGreaterThanOrEqual(2);
        expect(ofKind("mistake").length, "at least 1 common mistake").toBeGreaterThanOrEqual(1);
        expect(ofKind("strategy").length + ofKind("checklist").length).toBeGreaterThanOrEqual(1);
        expect(ofKind("guided_practice").length, "at least 1 practice task").toBeGreaterThanOrEqual(1);
        expect(ofKind("quick_check").length, "at least 2 quick checks").toBeGreaterThanOrEqual(2);
        expect(ofKind("key_point").length).toBe(1);
        expect(ofKind("next_step").length).toBe(1);
      });

      it("quick checks have valid options, answers, and explanations", () => {
        for (const check of ofKind("quick_check")) {
          expect(check.body.length, "question text in body").toBeGreaterThan(10);
          expect(check.data?.options?.length ?? 0).toBeGreaterThanOrEqual(2);
          expect(check.data?.answer).toBeTruthy();
          expect(check.data?.options).toContain(check.data?.answer);
          expect(check.data?.explanation?.length ?? 0).toBeGreaterThan(20);
        }
      });

      it("guided practice has a task and a model approach", () => {
        for (const practice of ofKind("guided_practice")) {
          expect(practice.data?.task?.length ?? 0).toBeGreaterThan(20);
          expect(practice.data?.modelAnswer?.length ?? 0).toBeGreaterThan(20);
        }
      });

      it("key point and next step are actionable", () => {
        expect(ofKind("key_point")[0]?.data?.keyPoint?.length ?? 0).toBeGreaterThan(30);
        const next = ofKind("next_step")[0];
        expect(next?.data?.nextHref).toMatch(/^\/(practice|review)/);
        expect(next?.data?.nextLabel?.length ?? 0).toBeGreaterThan(3);
      });

      it("sections are ordered and belong to the lesson", () => {
        sections.forEach((section, index) => {
          expect(section.order).toBe(index + 1);
          expect(section.lessonId).toBe(lesson.id);
        });
      });
    });
  }
});
