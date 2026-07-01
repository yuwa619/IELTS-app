export type Skill = "listening" | "reading" | "writing" | "speaking";
export type GoalMode = "eligible" | "crs" | "unsure";
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
  sections?: LessonSection[];
}

export interface LessonSection {
  id: string;
  lessonId: string;
  order: number;
  heading: string;
  body: string;
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
  refType: "question" | "vocab" | "grammar" | "error";
  refId: string;
  title: string;
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
