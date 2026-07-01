import { createClient } from "@supabase/supabase-js";
import {
  badges,
  grammarItems,
  lessons,
  mockExam,
  practiceQuestions,
  speakingPrompts,
  vocabularyItems,
  writingPrompts,
} from "../../src/lib/mock-data";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Copy .env.example to .env.local and add Supabase credentials.",
  );
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function assertOk<T>(label: string, promise: PromiseLike<{ data: T; error: unknown }>) {
  const { data, error } = await promise;
  if (error) {
    console.error(label, error);
    process.exit(1);
  }
  return data;
}

async function main() {
  const lessonRows = await assertOk(
    "seed lessons",
    supabase
      .from("lessons")
      .upsert(
        lessons.map((lesson) => ({
          title: lesson.title,
          slug: lesson.slug,
          module: lesson.module,
          skill: lesson.skill,
          summary: lesson.summary,
          est_minutes: lesson.estMinutes,
          display_order: lesson.order,
          published: true,
        })),
        { onConflict: "slug" },
      )
      .select("id, slug"),
  );

  const lessonIdBySlug = new Map((lessonRows ?? []).map((row) => [row.slug, row.id]));
  const sectionRows = lessons.flatMap((lesson) => {
    const lessonId = lessonIdBySlug.get(lesson.slug);
    if (!lessonId) return [];
    return (lesson.sections ?? []).map((section) => ({
      lesson_id: lessonId,
      display_order: section.order,
      heading: section.heading,
      body: section.body,
      media: null,
    }));
  });

  await assertOk(
    "seed lesson sections",
    supabase
      .from("lesson_sections")
      .upsert(sectionRows, { onConflict: "lesson_id,display_order" }),
  );

  await assertOk(
    "seed practice questions",
    supabase.from("practice_questions").upsert(
      practiceQuestions.map((question) => ({
        skill: question.skill,
        question_type: question.questionType,
        topic: question.topic,
        difficulty: question.difficulty,
        prompt: question.prompt,
        payload: question.payload,
        answer_key: question.answerKey,
        explanation: question.explanation,
        published: true,
      })),
      { onConflict: "skill,question_type,prompt" },
    ),
  );

  await assertOk(
    "seed writing prompts",
    supabase.from("writing_prompts").upsert(
      writingPrompts.map((prompt) => ({
        task: prompt.task,
        letter_type: prompt.task === "task1" ? prompt.type : null,
        essay_type: prompt.task === "task2" ? prompt.type : null,
        prompt: prompt.prompt,
        bullets: prompt.bullets,
        band_samples: [],
        published: true,
      })),
      { onConflict: "task,prompt" },
    ),
  );

  await assertOk(
    "seed speaking prompts",
    supabase.from("speaking_prompts").upsert(
      speakingPrompts.map((prompt) => ({
        part: prompt.part,
        topic: prompt.topic,
        prompt: prompt.prompt,
        cue_points: prompt.cuePoints,
        published: true,
      })),
      { onConflict: "part,prompt" },
    ),
  );

  await assertOk(
    "seed vocabulary",
    supabase.from("vocabulary_items").upsert(
      vocabularyItems.map((item) => ({
        term: item.term,
        definition: item.definition,
        example: item.example,
        topic: item.topic,
        cefr: item.cefr,
        published: true,
      })),
      { onConflict: "term" },
    ),
  );

  await assertOk(
    "seed grammar",
    supabase.from("grammar_items").upsert(
      grammarItems.map((item) => ({
        title: item.title,
        rule: item.rule,
        examples: item.examples,
        drill_question_ids: [],
        published: true,
      })),
      { onConflict: "title" },
    ),
  );

  const mockRows = await assertOk(
    "seed mock exam",
    supabase
      .from("mock_exams")
      .upsert(
        [{ title: mockExam.title, type: mockExam.type, published: true }],
        { onConflict: "title" },
      )
      .select("id, title"),
  );

  const mockId = mockRows?.[0]?.id;
  if (mockId && mockExam.sections?.length) {
    await assertOk(
      "seed mock sections",
      supabase.from("mock_sections").upsert(
        mockExam.sections.map((section) => ({
          mock_id: mockId,
          display_order: section.order,
          skill: section.skill,
          time_limit_s: section.timeLimitS,
          item_refs: section.itemRefs,
        })),
        { onConflict: "mock_id,display_order" },
      ),
    );
  }

  await assertOk(
    "seed badges",
    supabase.from("badges").upsert(
      badges.map((badge) => ({
        code: badge.code,
        name: badge.name,
        description: badge.description,
        criterion: { description: badge.criterion },
        art: badge.art,
      })),
      { onConflict: "code" },
    ),
  );

  console.log("Seeded Clearband original IELTS-style content.");
}

main();
