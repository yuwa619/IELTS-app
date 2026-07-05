import type { Lesson } from "@/types/domain";
import { buildLesson, coreLessonDefs, type LessonDef } from "./lesson-library-core";
import { productiveLessonDefs } from "./lesson-library-productive";

// Curriculum order: foundations → listening → reading → Writing Task 1 →
// Writing Task 2 → speaking → revision habit. `display_order` (and the
// "Lesson n/total" eyebrow) follows this sequence.
const defById = new Map<string, LessonDef>(
  [...coreLessonDefs, ...productiveLessonDefs].map((def) => [def.id, def]),
);

const CURRICULUM_ORDER = [
  // Foundations
  "lesson-1",
  // Listening
  "lesson-7",
  "lesson-11",
  "lesson-8",
  "lesson-12",
  "lesson-13",
  // GT Reading
  "lesson-6",
  "lesson-5",
  "lesson-14",
  "lesson-15",
  "lesson-16",
  // Writing Task 1 (GT letters)
  "lesson-2",
  "lesson-3",
  "lesson-17",
  "lesson-18",
  "lesson-19",
  "lesson-20",
  // Writing Task 2 (essays)
  "lesson-4",
  "lesson-24",
  "lesson-21",
  "lesson-22",
  "lesson-23",
  // Speaking
  "lesson-25",
  "lesson-9",
  "lesson-26",
  "lesson-27",
  "lesson-28",
  // Revision habit
  "lesson-10",
] as const;

export const lessonLibrary: Lesson[] = CURRICULUM_ORDER.map((id, index) => {
  const def = defById.get(id);
  if (!def) throw new Error(`lesson-library: missing lesson def "${id}"`);
  return buildLesson(def, index + 1);
});

export type { LessonDef } from "./lesson-library-core";
