import { errorLogs, mockExam } from "@/lib/mock-data";
import { clbForOverallBand, roundOverallBand } from "@/lib/scoring/clb";
import type { MockExam, Skill } from "@/types/domain";
import { getServiceContext, requireUser } from "./context";
import { isUuid } from "./content-refs";
import { awardXpEvent } from "./gamify";
import { getPracticeQuestions } from "./practice";
import { getSpeakingPrompts } from "./speaking";
import { getWritingPrompts } from "./writing";

function mockFromRow(row: Record<string, unknown>, sections: Record<string, unknown>[]): MockExam {
  return {
    id: String(row.id),
    title: String(row.title),
    type: (row.type as MockExam["type"]) ?? "mini",
    totalMinutes: Math.round(
      sections.reduce((sum, section) => sum + Number(section.time_limit_s ?? 0), 0) / 60,
    ),
    published: Boolean(row.published),
    sections: sections.map((section) => ({
      id: String(section.id),
      order: Number(section.display_order ?? 0),
      skill: section.skill as Skill,
      timeLimitS: Number(section.time_limit_s ?? 0),
      itemRefs: (section.item_refs as string[]) ?? [],
    })),
  };
}

export async function getMocks(): Promise<MockExam[]> {
  const ctx = await getServiceContext();
  if (ctx.mode === "supabase" && ctx.supabase) {
    const { data: rows } = await ctx.supabase
      .from("mock_exams")
      .select("*")
      .eq("published", true);
    if (rows?.length) {
      const { data: sections } = await ctx.supabase
        .from("mock_sections")
        .select("*")
        .in("mock_id", rows.map((row) => row.id))
        .order("display_order");
      return rows.map((row) =>
        mockFromRow(row, (sections ?? []).filter((s) => s.mock_id === row.id)),
      );
    }
  }
  return [mockExam];
}

export async function getMock(id: string): Promise<MockExam> {
  const mocks = await getMocks();
  return mocks.find((mock) => mock.id === id) ?? mocks[0];
}

export async function getMockRunner(id: string) {
  const [mock, practiceQuestions, writingPrompts, speakingPrompts] = await Promise.all([
    getMock(id),
    getPracticeQuestions(),
    getWritingPrompts(),
    getSpeakingPrompts(),
  ]);
  return { mock, practiceQuestions, writingPrompts, speakingPrompts, errorLogs };
}

function bandFromSectionAccuracy(correct: number, total: number) {
  if (total === 0) return 5.5;
  const ratio = correct / total;
  if (ratio >= 0.99) return 7;
  if (ratio >= 0.5) return 6;
  return 5;
}

export async function submitMockAttempt(mockId: string, answers: Record<string, string>) {
  const { mock, practiceQuestions, writingPrompts } = await getMockRunner(mockId);

  const skills: Record<Skill, number> = { listening: 5.5, reading: 5.5, writing: 5.5, speaking: 5.5 };
  const rawScores: Record<string, number> = {};
  const wrongRefs: { refId: string; skill: Skill; prompt: string }[] = [];

  for (const section of mock.sections ?? []) {
    if (section.skill === "listening" || section.skill === "reading") {
      let correct = 0;
      for (const refId of section.itemRefs) {
        const question = practiceQuestions.find((item) => item.id === refId);
        if (!question) continue;
        const expected = Array.isArray(question.answerKey.answer)
          ? question.answerKey.answer[0]
          : question.answerKey.answer;
        const given = (answers[refId] ?? "").trim().toLowerCase();
        if (given && given === String(expected ?? "").trim().toLowerCase()) {
          correct += 1;
        } else {
          wrongRefs.push({ refId, skill: section.skill, prompt: question.prompt });
        }
      }
      rawScores[section.skill] = correct;
      skills[section.skill] = bandFromSectionAccuracy(correct, section.itemRefs.length);
    }
    if (section.skill === "writing") {
      const refId = section.itemRefs[0];
      const text = answers[refId] ?? "";
      const words = text.trim().split(/\s+/).filter(Boolean).length;
      const prompt = writingPrompts.find((item) => item.id === refId);
      const target = prompt?.task === "task2" ? 250 : 150;
      skills.writing = words === 0 ? 5 : words < target * 0.7 ? 5.5 : words < target ? 6 : 6.5;
      rawScores.writing = words;
    }
    if (section.skill === "speaking") {
      const refId = section.itemRefs[0];
      const notes = (answers[refId] ?? "").trim();
      skills.speaking = notes.length === 0 ? 5 : notes.length < 80 ? 5.5 : 6;
      rawScores.speaking = notes.length;
    }
  }

  const overall = roundOverallBand(skills);
  const clb = clbForOverallBand(overall);
  const weakest = (Object.keys(skills) as Skill[]).reduce((a, b) =>
    skills[a] <= skills[b] ? a : b,
  );
  const recommendation = `${weakest.charAt(0).toUpperCase()}${weakest.slice(1)} is holding your overall back. Spend this week repairing ${weakest} errors, then retake the mini mock.`;

  const result = { overall, clb, skills, recommendation, isEstimate: true as const };

  const ctx = await getServiceContext();
  if (ctx.mode === "mock") return { ...result, saved: false };

  const { supabase, user } = requireUser(ctx);
  const { data: attempt, error } = await supabase
    .from("mock_attempts")
    .insert({
      user_id: user.id,
      mock_id: isUuid(mock.id) ? mock.id : null,
      status: "submitted",
      started_at: new Date().toISOString(),
      section_state: { completed: true },
      answers: { ...answers, mockRef: mock.id },
      raw_scores: rawScores,
      band_estimate: { overall, clb, ...skills },
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);

  if (wrongRefs.length) {
    await supabase.from("error_logs").insert(
      wrongRefs.map((wrong) => ({
        user_id: user.id,
        category: wrong.skill === "reading" ? "weak_paraphrase" : "distractor",
        skill: wrong.skill,
        ref_type: "question",
        ref_id: wrong.refId,
        note: wrong.prompt.slice(0, 200),
        resolved: false,
      })),
    );
  }

  await awardXpEvent(supabase, user.id, "mock", attempt.id, 80, "Completed mini mock");
  return { ...result, saved: true };
}

// Legacy fixed result kept for mock-mode intro rendering.
export async function submitMock() {
  return {
    overall: 6,
    clb: 7,
    skills: { listening: 6.5, reading: 6, writing: 5.5, speaking: 6 },
    recommendation:
      "Writing is holding your overall back. Spend this week on sentence control, then retake a half mock.",
  };
}
