export type Skill = "listening" | "reading" | "writing" | "speaking";
export type ModuleType = "general_training" | "academic" | "shared" | "unknown";
export type AccessScope = "public" | "admin_only";
export type ReviewStatus = "pending" | "approved" | "rejected";

// Attached to any content item. Original Clearband content defaults to
// general_training / shared and public. Academic content is never in the
// default path and never counts toward Express Entry readiness.
export interface ContentClassification {
  moduleType: ModuleType;
  expressEntryRelevant: boolean;
  canadaPathEligible: boolean;
  accessScope: AccessScope;
  reviewStatus: ReviewStatus;
  sourceName?: string;
}

export type GoalMode = "eligible" | "crs" | "unsure";
export type TestFormat = "computer" | "paper" | "unsure";
export type DailyBlock = "warmup" | "lesson" | "practice" | "review";
export type TaskStatus = "pending" | "done" | "skipped";
export type QuestionType =
  | "mcq"
  | "multi_select"
  | "tfng"
  | "ynng"
  | "matching"
  | "gap_fill"
  | "sentence_completion"
  | "short_answer"
  | "map_label";

export interface UserProfile {
  userId: string;
  displayName: string | null;
  locale: string;
  onboarded: boolean;
  dailyMinutes: number;
  consentAudio: boolean;
  consentSamples: boolean;
}

export interface CanadaGoal {
  userId: string;
  goalMode: GoalMode;
  testDate: string | null;
  testFormat?: TestFormat;
  testLocation?: string | null;
  confidence: number;
}

export interface CLBTarget {
  userId: string;
  targetClb: number;
  reading: number;
  writing: number;
  listening: number;
  speaking: number;
}

export interface Lesson {
  id: string;
  title: string;
  slug: string;
  module: string;
  skill: Skill;
  summary: string;
  estMinutes: number;
  order: number;
  published: boolean;
  moduleType?: ModuleType;
  sourceName?: string;
  /** 1 = foundation, 2 = core, 3 = band 7+ stretch */
  difficulty?: number;
  /** e.g. "CLB 7+", "CLB 7–9" — Canada Express Entry relevance */
  clbFocus?: string;
  sections?: LessonSection[];
}

/**
 * Section kinds drive the interactive lesson player. Plain teaching prose
 * uses `explanation`; interactive blocks (`quick_check`, `guided_practice`)
 * carry their payload in `data`.
 */
export type LessonSectionKind =
  | "intro"
  | "objectives"
  | "explanation"
  | "gt_relevance"
  | "example"
  | "mistake"
  | "strategy"
  | "checklist"
  | "guided_practice"
  | "quick_check"
  | "reflection"
  | "key_point"
  | "next_step";

export interface LessonSectionData {
  /** objectives / strategy / checklist bullets */
  items?: string[];
  /** example blocks: the sample language or extract being shown */
  sample?: string;
  /** caption or comment under a sample */
  note?: string;
  /** guided practice: the task the learner attempts first */
  task?: string;
  /** guided practice: revealed model approach (a framework, never a script) */
  modelAnswer?: string;
  /** quick check: answer options */
  options?: string[];
  /** quick check: the correct option (must match one entry in options) */
  answer?: string;
  /** quick check: feedback shown after answering */
  explanation?: string;
  /** key point: the one-line takeaway saved to the review queue */
  keyPoint?: string;
  /** next step: recommended follow-up action */
  nextHref?: string;
  nextLabel?: string;
}

export interface LessonSection {
  id: string;
  lessonId: string;
  order: number;
  kind: LessonSectionKind;
  heading: string;
  body: string;
  data?: LessonSectionData;
}

export interface PracticeQuestion {
  id: string;
  skill: Skill;
  questionType: QuestionType;
  topic: string;
  difficulty: number;
  prompt: string;
  payload: {
    passage?: string;
    transcript?: string;
    instructions?: string;
    options?: string[];
    wordLimit?: string;
    stem?: string;
  };
  answerKey: { answer: string | string[]; evidence?: string };
  explanation: string;
  published: boolean;
  moduleType?: ModuleType;
  sourceName?: string;
}

export interface PracticeAttempt {
  id: string;
  userId: string;
  questionId: string;
  response: unknown;
  isCorrect: boolean | null;
  score: number | null;
  timeMs: number;
  context: "drill" | "diagnostic" | "mock" | "revision";
  createdAt: string;
}

export interface WritingPrompt {
  id: string;
  task: "task1" | "task2";
  title: string;
  prompt: string;
  bullets: string[];
  type: string;
  published: boolean;
  moduleType?: ModuleType;
  sourceName?: string;
}

export interface WritingCriteria {
  taskAchievement: number;
  coherenceCohesion: number;
  lexicalResource: number;
  grammaticalRange: number;
}

export interface BandEstimate {
  low: number;
  high: number;
  isEstimate: true;
  disclaimer: string;
}

export interface AIFeedback {
  band: BandEstimate;
  criteria: Record<string, number>;
  strengths: string[];
  improvements: string[];
  nextPractice: string;
}

export interface WritingAttempt {
  id: string;
  userId: string;
  promptId: string;
  text: string;
  wordCount: number;
  timeMs: number;
  estimate?: AIFeedback | null;
}

export interface SpeakingPrompt {
  id: string;
  part: "p1" | "p2" | "p3";
  topic: string;
  prompt: string;
  cuePoints: string[];
  published: boolean;
  moduleType?: ModuleType;
  sourceName?: string;
}

export interface SpeakingAttempt {
  id: string;
  userId: string;
  promptId: string;
  audioPath: string;
  durationS: number;
  selfRating?: Record<string, number>;
  estimate?: AIFeedback | null;
}

export interface MockExam {
  id: string;
  title: string;
  type: "mini" | "half" | "full";
  totalMinutes: number;
  published: boolean;
  sections?: MockSection[];
}

export interface MockSection {
  id: string;
  order: number;
  skill: Skill;
  timeLimitS: number;
  itemRefs: string[];
}

export interface MockAttempt {
  id: string;
  userId: string;
  mockId: string;
  status: "in_progress" | "submitted" | "reviewed";
  answers: unknown;
  rawScores?: Partial<Record<Skill, number>>;
  bandEstimate?: Partial<Record<Skill, number>> & { overall: number };
}

export interface PlanWeek {
  weekNumber: number;
  focus: Skill[];
  notes: string;
}

export interface StudyPlan {
  id: string;
  userId: string;
  status: string;
  startDate: string;
  currentWeek: number;
  weeks: PlanWeek[];
}

export interface DailyTask {
  id: string;
  userId: string;
  planId: string;
  date: string;
  block: DailyBlock;
  title: string;
  skill: Skill;
  refType: string;
  refId: string;
  status: TaskStatus;
  estMinutes: number;
  xp: number;
}

export interface VocabularyItem {
  id: string;
  term: string;
  ipa: string;
  definition: string;
  example: string;
  topic: string;
  cefr: string;
  published: boolean;
}

export interface GrammarItem {
  id: string;
  title: string;
  rule: string;
  examples: string[];
  published: boolean;
}

export interface RevisionItem {
  id: string;
  userId: string;
  refType: "question" | "vocab" | "grammar" | "error" | "lesson";
  refId: string;
  title: string;
  /** Saved lesson key point text, shown in the review queue */
  note?: string;
  dueAt: string;
  ease: number;
  interval: number;
}

export interface XPEvent {
  id: string;
  userId: string;
  sourceType: string;
  sourceId: string;
  amount: number;
  reason: string;
}

export interface Badge {
  id: string;
  code: string;
  name: string;
  description: string;
  criterion: string;
  art: string;
}

export interface UserBadge {
  id: string;
  userId: string;
  badgeId: string;
  earnedAt: string;
}

export interface ErrorLog {
  id: string;
  userId: string;
  category:
    | "misread_question"
    | "distractor"
    | "spelling_format"
    | "word_limit"
    | "weak_paraphrase"
    | "tone_register"
    | "thin_support"
    | "grammar_type"
    | "pronunciation_clarity"
    | "fluency_breakdown";
  skill: Skill;
  refType: string;
  refId: string;
  note?: string;
  resolved: boolean;
}
