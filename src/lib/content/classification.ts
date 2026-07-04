import type { ModuleType, Skill } from "@/types/domain";

export type ContentSkillTag =
  | "listening"
  | "reading"
  | "writing_task_1"
  | "writing_task_2"
  | "speaking"
  | "vocabulary"
  | "grammar"
  | "strategy";

export type ContentSourceType =
  | "lesson"
  | "practice_question"
  | "mock_test"
  | "transcript"
  | "answer_key"
  | "explanation"
  | "prompt";

export interface ClassifierInput {
  skillTag: ContentSkillTag;
  // Optional hints from the source material.
  isLetterTask?: boolean;
  isChartTask?: boolean;
  labelledAcademic?: boolean;
  labelledGeneralTraining?: boolean;
}

// The one rule that keeps Clearband a General Training app: only
// general_training and shared content is eligible for the Express Entry path.
export const CANADA_PATH_MODULES: ModuleType[] = ["general_training", "shared"];

export function isCanadaPathModule(moduleType: ModuleType): boolean {
  return CANADA_PATH_MODULES.includes(moduleType);
}

// Deterministic module classification for imported or authored content.
// Listening and Speaking are shared; Academic Reading and Academic Writing
// Task 1 (charts/graphs/maps/processes) are academic and excluded from the path.
export function classifyModuleType(input: ClassifierInput): ModuleType {
  if (input.labelledGeneralTraining) return "general_training";
  if (input.labelledAcademic) return "academic";

  switch (input.skillTag) {
    case "listening":
    case "speaking":
      return "shared";
    case "writing_task_1":
      // GT Task 1 is a letter; Academic Task 1 is a chart/graph/map/process.
      if (input.isChartTask) return "academic";
      if (input.isLetterTask) return "general_training";
      return "unknown";
    case "reading":
      // Without an explicit label we cannot tell GT from Academic reading.
      return "unknown";
    case "writing_task_2":
    case "vocabulary":
    case "grammar":
    case "strategy":
      return "shared";
    default:
      return "unknown";
  }
}

export function skillTagToSkill(tag: ContentSkillTag): Skill | null {
  if (tag === "listening") return "listening";
  if (tag === "reading") return "reading";
  if (tag === "speaking") return "speaking";
  if (tag === "writing_task_1" || tag === "writing_task_2") return "writing";
  return null;
}

// Content filter used across practice/lessons screens. Defaults to the GT path.
export type ContentFilter =
  | "general_training"
  | "shared"
  | "academic_optional"
  | "clearband_original"
  | "licensed_source";

export const DEFAULT_CONTENT_FILTERS: ContentFilter[] = [
  "general_training",
  "shared",
  "clearband_original",
  "licensed_source",
];

export const CONTENT_FILTER_LABELS: Record<ContentFilter, string> = {
  general_training: "General Training",
  shared: "Shared (Listening/Speaking)",
  academic_optional: "Academic (optional extra)",
  clearband_original: "Clearband original",
  licensed_source: "Licensed source",
};

// Which module_types a filter selection should surface. Academic only appears
// when the learner explicitly opts into "Academic (optional extra)".
export function moduleTypesForFilters(filters: ContentFilter[]): ModuleType[] {
  const modules = new Set<ModuleType>();
  if (filters.includes("general_training")) modules.add("general_training");
  if (filters.includes("shared")) modules.add("shared");
  if (filters.includes("academic_optional")) modules.add("academic");
  // clearband_original / licensed_source are source filters, not module filters;
  // if only those are set, still show the default GT path modules.
  if (modules.size === 0) {
    modules.add("general_training");
    modules.add("shared");
  }
  return [...modules];
}
