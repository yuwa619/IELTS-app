import { grammarItems, practiceQuestions, vocabularyItems } from "@/lib/mock-data";
import type { PracticeQuestion } from "@/types/domain";
import { getServiceContext, requireUser } from "./context";
import { isUuid } from "./content-refs";
import { awardXpEvent } from "./gamify";

function questionFromRow(row: Record<string, unknown>): PracticeQuestion {
  return {
    id: String(row.id),
    skill: row.skill as PracticeQuestion["skill"],
    questionType: row.question_type as PracticeQuestion["questionType"],
    topic: String(row.topic ?? ""),
    difficulty: Number(row.difficulty ?? 2),
    prompt: String(row.prompt),
    payload: (row.payload as PracticeQuestion["payload"]) ?? {},
    answerKey: (row.answer_key as PracticeQuestion["answerKey"]) ?? { answer: "" },
    explanation: String(row.explanation ?? ""),
    published: Boolean(row.published),
  };
}

export async function getPracticeQuestions(skill?: "listening" | "reading") {
  const ctx = await getServiceContext();
  if (ctx.mode === "supabase" && ctx.supabase) {
    let query = ctx.supabase.from("practice_questions").select("*").eq("published", true);
    if (skill) query = query.eq("skill", skill);
    const { data } = await query;
    if (data?.length) return data.map(questionFromRow);
  }
  return skill
    ? practiceQuestions.filter((question) => question.skill === skill)
    : practiceQuestions;
}

export async function getVocabulary() {
  const ctx = await getServiceContext();
  if (ctx.mode === "supabase" && ctx.supabase) {
    const { data } = await ctx.supabase
      .from("vocabulary_items")
      .select("*")
      .eq("published", true);
    if (data?.length) {
      return data.map((row) => ({
        id: String(row.id),
        term: String(row.term),
        ipa: String(row.ipa ?? ""),
        definition: String(row.definition),
        example: String(row.example ?? ""),
        topic: String(row.topic ?? ""),
        cefr: String(row.cefr ?? "B2"),
        published: true,
      }));
    }
  }
  return vocabularyItems;
}

export async function getGrammar() {
  const ctx = await getServiceContext();
  if (ctx.mode === "supabase" && ctx.supabase) {
    const { data } = await ctx.supabase.from("grammar_items").select("*").eq("published", true);
    if (data?.length) {
      return data.map((row) => ({
        id: String(row.id),
        title: String(row.title),
        rule: String(row.rule),
        examples: (row.examples as string[]) ?? [],
        published: true,
      }));
    }
  }
  return grammarItems;
}

const vocabGradeRules: Record<string, { days: number; easeDelta: number }> = {
  again: { days: 1, easeDelta: -0.2 },
  hard: { days: 2, easeDelta: -0.05 },
  good: { days: 4, easeDelta: 0 },
  easy: { days: 7, easeDelta: 0.1 },
};

export async function gradeVocabulary(
  itemId: string,
  grade: "again" | "hard" | "good" | "easy",
) {
  const rule = vocabGradeRules[grade];
  const ctx = await getServiceContext();
  if (ctx.mode === "mock") {
    return { itemId, nextDueAt: new Date(Date.now() + rule.days * 86_400_000).toISOString(), saved: false };
  }

  const { supabase, user } = requireUser(ctx);
  if (!isUuid(itemId)) {
    // Bundled fallback deck: progress rows need seeded uuid items; still
    // award daily XP so effort is not lost.
    const today = new Date().toISOString().slice(0, 10);
    await awardXpEvent(supabase, user.id, "vocab", `${itemId}:${today}`, 5, "Graded vocabulary card");
    return {
      itemId,
      nextDueAt: new Date(Date.now() + rule.days * 86_400_000).toISOString(),
      saved: false,
    };
  }
  const { data: existing } = await supabase
    .from("user_vocabulary_progress")
    .select("ease, interval")
    .eq("user_id", user.id)
    .eq("item_id", itemId)
    .maybeSingle();

  const ease = Math.min(3, Math.max(1.3, Number(existing?.ease ?? 2.3) + rule.easeDelta));
  const interval =
    grade === "again"
      ? 1
      : Math.max(rule.days, Math.round(Number(existing?.interval ?? 1) * ease));
  const nextDueAt = new Date(Date.now() + interval * 86_400_000).toISOString();

  const { error } = await supabase.from("user_vocabulary_progress").upsert(
    {
      user_id: user.id,
      item_id: itemId,
      status: grade === "again" ? "learning" : "reviewing",
      ease,
      interval,
      due_at: nextDueAt,
    },
    { onConflict: "user_id,item_id" },
  );
  if (error) throw new Error(error.message);

  const today = new Date().toISOString().slice(0, 10);
  await awardXpEvent(
    supabase,
    user.id,
    "vocab",
    `${itemId}:${today}`,
    grade === "again" ? 5 : 10,
    "Graded vocabulary card",
  );
  return { itemId, nextDueAt, saved: true };
}

async function findQuestion(questionId: string): Promise<PracticeQuestion | null> {
  const ctx = await getServiceContext();
  if (ctx.mode === "supabase" && ctx.supabase && isUuid(questionId)) {
    const { data } = await ctx.supabase
      .from("practice_questions")
      .select("*")
      .eq("id", questionId)
      .maybeSingle();
    if (data) return questionFromRow(data);
  }
  return practiceQuestions.find((item) => item.id === questionId) ?? null;
}

function grade(question: PracticeQuestion, response: string) {
  const expected = Array.isArray(question.answerKey.answer)
    ? question.answerKey.answer[0]
    : question.answerKey.answer;
  return {
    isCorrect:
      response.trim().toLowerCase() === String(expected ?? "").trim().toLowerCase(),
    expected,
    explanation: question.explanation || "Review the explanation and try again.",
  };
}

const errorCategoryBySkill: Record<string, string> = {
  reading: "weak_paraphrase",
  listening: "distractor",
  writing: "grammar_type",
  speaking: "fluency_breakdown",
};

export async function gradePractice(questionId: string, response: string, timeMs = 0) {
  const question = await findQuestion(questionId);
  if (!question) {
    return { isCorrect: false, expected: null, explanation: "Question not found.", saved: false };
  }
  const result = grade(question, response);

  const ctx = await getServiceContext();
  if (ctx.mode === "mock") return { ...result, saved: false };

  const { supabase, user } = requireUser(ctx);
  const { error } = await supabase.from("practice_attempts").insert({
    user_id: user.id,
    question_id: isUuid(questionId) ? questionId : null,
    response: { answer: response, questionRef: questionId, skill: question.skill },
    is_correct: result.isCorrect,
    score: result.isCorrect ? 1 : 0,
    time_ms: timeMs,
    context: "drill",
  });
  if (error) throw new Error(error.message);

  if (!result.isCorrect) {
    await Promise.all([
      supabase.from("error_logs").insert({
        user_id: user.id,
        category: errorCategoryBySkill[question.skill] ?? "misread_question",
        skill: question.skill,
        ref_type: "question",
        ref_id: questionId,
        note: question.prompt.slice(0, 200),
        resolved: false,
      }),
      supabase.from("revision_items").upsert(
        {
          user_id: user.id,
          ref_type: "question",
          ref_id: questionId,
          ease: 2.3,
          interval: 1,
          due_at: new Date(Date.now() + 86_400_000).toISOString(),
          last_grade: "again",
        },
        { onConflict: "user_id,ref_type,ref_id", ignoreDuplicates: true },
      ),
    ]);
  }

  const today = new Date().toISOString().slice(0, 10);
  await awardXpEvent(
    supabase,
    user.id,
    "practice",
    `${questionId}:${today}`,
    result.isCorrect ? 10 : 5,
    `Practice ${question.skill} question`,
  );

  return { ...result, saved: true };
}
