import type {
  Badge,
  CanadaGoal,
  DailyTask,
  ErrorLog,
  GrammarItem,
  Lesson,
  MockExam,
  PracticeQuestion,
  RevisionItem,
  SpeakingPrompt,
  StudyPlan,
  UserProfile,
  VocabularyItem,
  WritingPrompt,
  XPEvent,
} from "@/types/domain";
import { targetForClb } from "@/lib/scoring/clb";
import {
  gtReadingQuestions,
  gtSpeakingPrompts,
  gtWritingPrompts,
  sharedListeningQuestions,
} from "./gt-content";
import { lessonLibrary } from "./lesson-library";

export const mockUser: UserProfile = {
  userId: "mock-user",
  displayName: "Amir",
  locale: "en-CA",
  onboarded: true,
  dailyMinutes: 30,
  consentAudio: false,
  consentSamples: true,
};

export const mockGoal: CanadaGoal = {
  userId: "mock-user",
  goalMode: "crs",
  testDate: "2026-08-06",
  confidence: 3,
};

export const mockTarget = targetForClb(9);

// Full interactive lesson library (28 original GT-focused lessons) lives in
// lesson-library-core.ts / lesson-library-productive.ts.
export const lessons: Lesson[] = lessonLibrary;

const vocabTerms = [
  ["liaise", "/liˈeɪz/", "to work together and share information to get something done", "I will liaise with the front desk and confirm your booking.", "workplace"],
  ["tenant", "/ˈtenənt/", "a person who rents a room, apartment, or building", "The tenant reported a leak in the hallway.", "housing"],
  ["allocate", "/ˈæləkeɪt/", "to officially give something for a purpose", "The council allocated funds for public transport.", "community"],
  ["commute", "/kəˈmjuːt/", "to travel regularly between home and work", "My commute is shorter when I take the train.", "workplace"],
  ["eligible", "/ˈelɪdʒəbl/", "allowed or qualified to do or receive something", "Applicants may be eligible after one year of skilled work.", "immigration"],
  ["subsidy", "/ˈsʌbsədi/", "money given to reduce the cost of something", "A childcare subsidy can help working parents.", "community"],
  ["maintenance", "/ˈmeɪntənəns/", "work that keeps a place or machine in good condition", "The lift is closed for maintenance.", "housing"],
  ["enrol", "/ɪnˈrəʊl/", "to officially join a course or programme", "Residents can enrol online.", "education"],
  ["refund", "/ˈriːfʌnd/", "money returned after a payment", "You must request a refund within ten days.", "services"],
  ["mandatory", "/ˈmændətəri/", "required by rule or law", "Safety training is mandatory for new staff.", "workplace"],
  ["venue", "/ˈvenjuː/", "the place where an event happens", "The venue is beside the library.", "travel"],
  ["reschedule", "/ˌriːˈʃedjuːl/", "to arrange a new time", "I need to reschedule my appointment.", "services"],
  ["shortage", "/ˈʃɔːtɪdʒ/", "not enough of something", "There is a shortage of parking spaces.", "community"],
  ["prioritise", "/praɪˈɒrətaɪz/", "to treat something as more important", "Prioritise accuracy before speed.", "study"],
  ["verify", "/ˈverɪfaɪ/", "to check that something is true", "Verify the address before you travel.", "services"],
  ["accessible", "/əkˈsesəbl/", "easy to reach, use, or understand", "The station is accessible by lift.", "community"],
  ["procedure", "/prəˈsiːdʒə/", "an official way of doing something", "Follow the procedure for reporting absence.", "workplace"],
  ["restriction", "/rɪˈstrɪkʃən/", "a rule that limits what is allowed", "There are restrictions on weekend parking.", "housing"],
  ["reliable", "/rɪˈlaɪəbl/", "able to be trusted or depended on", "Reliable transport helps people keep jobs.", "community"],
  ["evidence", "/ˈevɪdəns/", "facts that show something is true", "Use evidence from the passage only.", "study"],
] as const;

export const vocabularyItems: VocabularyItem[] = vocabTerms.map(([term, ipa, definition, example, topic], index) => ({
  id: `vocab-${index + 1}`,
  term,
  ipa,
  definition,
  example,
  topic,
  cefr: index % 3 === 0 ? "B2" : "C1",
  published: true,
}));

export const grammarItems: GrammarItem[] = [
  "Articles with institutions",
  "Past simple vs present perfect",
  "Conditionals for consequences",
  "Relative clauses for detail",
  "Passive voice in formal letters",
  "Subject-verb agreement",
  "Comma splices",
  "Linking contrast",
  "Prepositions of time",
  "Countable and uncountable nouns",
  "Modals for polite requests",
  "Complex sentences with although",
  "Cohesive referencing",
  "Parallel structure",
  "Noun phrase precision",
  "Tense consistency",
  "Punctuation in lists",
  "Avoiding sentence fragments",
  "Hedging in essays",
  "Formal register",
].map((title, index) => ({
  id: `grammar-${index + 1}`,
  title,
  rule: `Use ${title.toLowerCase()} to make meaning clearer and reduce avoidable grammar errors in timed answers.`,
  examples: ["The booking was changed because the room was unavailable.", "Although the service is useful, it should be reviewed annually."],
  published: true,
}));

export const practiceQuestions: PracticeQuestion[] = [
  ...Array.from({ length: 10 }, (_, index) => ({
    id: `listening-${index + 1}`,
    skill: "listening" as const,
    questionType: index % 2 === 0 ? ("gap_fill" as const) : ("mcq" as const),
    topic: "community booking",
    difficulty: 2 + (index % 3),
    prompt: index % 2 === 0 ? "Riverside Community Centre booking form" : "Why does the speaker change the appointment time?",
    payload: {
      instructions: "Write ONE WORD AND/OR A NUMBER for each answer.",
      transcript:
        "Staff: Riverside Community Centre. Caller: I would like to book pottery on Thursday evening. Staff: The instructor is Dana Okafor and the fee is 18 dollars.",
      stem: index % 2 === 0 ? "Activity: ______" : undefined,
      options: index % 2 ? ["The room is closed for cleaning.", "The instructor is unavailable.", "The caller has a work shift."] : undefined,
      wordLimit: "ONE WORD AND/OR A NUMBER",
    },
    answerKey: { answer: index % 2 === 0 ? "pottery" : "The instructor is unavailable." },
    explanation: "The speaker corrects the original time because the instructor is unavailable, not because the room is closed.",
    published: true,
    moduleType: "shared" as const,
    sourceName: "Clearband Original",
  })),
  ...Array.from({ length: 10 }, (_, index) => ({
    id: `reading-${index + 1}`,
    skill: "reading" as const,
    questionType: index % 3 === 0 ? ("tfng" as const) : ("short_answer" as const),
    topic: "housing notice",
    difficulty: 2 + (index % 3),
    prompt:
      index % 3 === 0
        ? "Residents can reserve more than two laundry slots in a single week."
        : "How long before the start time are unused laundry bookings released?",
    payload: {
      passage:
        "Residents of Maple Court may book the shared laundry room online up to 48 hours ahead. Bookings are limited to two one-hour slots per week, and unused slots are released 30 minutes after the start time. The building manager may cancel bookings during urgent maintenance.",
      instructions: index % 3 === 0 ? "Choose True, False, or Not Given." : "Write NO MORE THAN THREE WORDS AND/OR A NUMBER.",
      options: index % 3 === 0 ? ["True", "False", "Not Given"] : undefined,
      wordLimit: "NO MORE THAN THREE WORDS AND/OR A NUMBER",
    },
    answerKey: {
      answer: index % 3 === 0 ? "False" : "30 minutes",
      evidence: "Bookings are limited to two one-hour slots per week, and unused slots are released 30 minutes after the start time.",
    },
    explanation: "The answer is limited by the exact wording in the notice. Do not infer extra booking rights.",
    published: true,
    moduleType: "general_training" as const,
    sourceName: "Clearband Original",
  })),
  ...sharedListeningQuestions,
  ...gtReadingQuestions,
];

const writingPromptSeed: Array<[
  WritingPrompt["task"],
  string,
  string,
  string[],
  string,
]> = [
  ["task1", "Complaint to a property manager", "Your apartment heating has stopped working. Write to the building manager.", ["explain the problem", "say how it affects you", "ask for a specific repair time"], "complaint"],
  ["task1", "Request to a community centre", "You want to join an evening course but need schedule details.", ["say which course interests you", "ask about times and fees", "explain why evening classes suit you"], "request"],
  ["task1", "Apology to a neighbour", "You missed a meeting about shared parking.", ["apologise", "explain why you missed it", "suggest another time"], "apology"],
  ["task1", "Invitation to a colleague", "You are organising a small farewell event.", ["explain the occasion", "give the details", "ask them to bring one item"], "invitation"],
  ["task1", "Information letter to a school", "You need information about your child's after-school programme.", ["introduce your child", "ask about activities", "ask about pickup arrangements"], "information"],
  ["task2", "Public libraries and school technology", "Some people think governments should fund public libraries, while others say the money is better spent on technology in schools. Discuss both views and give your own opinion.", [], "discussion"],
  ["task2", "Working from home", "Many employers now allow staff to work from home several days a week. Do the advantages outweigh the disadvantages?", [], "advantages-disadvantages"],
  ["task2", "Public transport discounts", "Some cities give discounted public transport to new residents. Is this a good use of public money?", [], "opinion"],
  ["task2", "Adult retraining", "More adults need to retrain during their careers. What problems does this create, and what solutions are available?", [], "problem-solution"],
  ["task2", "Community volunteering", "Why do some people volunteer in their local community, and how can more people be encouraged to do so?", [], "direct-question"],
];

export const writingPrompts: WritingPrompt[] = writingPromptSeed.map(([task, title, prompt, bullets, type], index): WritingPrompt => ({
  id: `writing-${index + 1}`,
  task: task as "task1" | "task2",
  title,
  prompt,
  bullets,
  type,
  published: true,
  // GT Task 1 is always a letter; Task 2 essays are shared across IELTS versions.
  moduleType: task === "task1" ? ("general_training" as const) : ("shared" as const),
  sourceName: "Clearband Original",
})).concat(gtWritingPrompts);

const speakingPromptSeed: Array<[
  SpeakingPrompt["part"],
  string,
  string,
  string[],
]> = [
  ["p1", "work", "Do you prefer working alone or with other people?", ["give a reason", "use one example"]],
  ["p1", "housing", "What do you like about the area where you live?", ["specific place", "why it matters"]],
  ["p2", "skill", "Describe a skill you would like to learn.", ["what the skill is", "how you would learn it", "why you want it", "how it would help you in Canada"]],
  ["p2", "journey", "Describe a journey that took longer than expected.", ["where you went", "what delayed you", "how you felt", "what you learned"]],
  ["p2", "service", "Describe a helpful service you used recently.", ["what it was", "who provided it", "why it helped", "whether you would use it again"]],
  ["p3", "education", "How should adults choose between online and classroom learning?", ["compare benefits", "give balanced view"]],
  ["p3", "cities", "What can cities do to help newcomers settle quickly?", ["services", "transport", "community"]],
  ["p3", "work", "Why are communication skills important in modern workplaces?", ["teamwork", "customers", "remote work"]],
  ["p1", "health", "How do you usually keep a healthy routine?", ["frequency", "one challenge"]],
  ["p3", "technology", "Should public services rely more on mobile apps?", ["access", "privacy", "older users"]],
];

export const speakingPrompts: SpeakingPrompt[] = speakingPromptSeed.map(([part, topic, prompt, cuePoints], index): SpeakingPrompt => ({
  id: `speaking-${index + 1}`,
  part: part as "p1" | "p2" | "p3",
  topic,
  prompt,
  cuePoints,
  published: true,
  moduleType: "shared" as const,
  sourceName: "Clearband Original",
})).concat(gtSpeakingPrompts);

export const studyPlan: StudyPlan = {
  id: "plan-1",
  userId: "mock-user",
  status: "active",
  startDate: "2026-06-29",
  currentWeek: 2,
  weeks: [
    { weekNumber: 1, focus: ["reading", "writing"], notes: "Diagnostic repair: TFNG discipline and Task 1 tone." },
    { weekNumber: 2, focus: ["writing", "listening"], notes: "Letter completeness, form completion, and first mini mock." },
    { weekNumber: 3, focus: ["speaking", "reading"], notes: "Cue-card fluency and workplace passages." },
  ],
};

export const dailyTasks: DailyTask[] = [
  { id: "task-1", userId: "mock-user", planId: "plan-1", date: "2026-06-29", block: "warmup", title: "Warm-up · 8 retrieval cards", skill: "reading", refType: "revision", refId: "revision-1", status: "done", estMinutes: 4, xp: 20 },
  { id: "task-2", userId: "mock-user", planId: "plan-1", date: "2026-06-29", block: "lesson", title: "Guided lesson · GT letter tone", skill: "writing", refType: "lesson", refId: "lesson-2", status: "pending", estMinutes: 8, xp: 30 },
  { id: "task-3", userId: "mock-user", planId: "plan-1", date: "2026-06-29", block: "practice", title: "Focused practice · GT letter", skill: "writing", refType: "writing", refId: "writing-1", status: "pending", estMinutes: 10, xp: 30 },
  { id: "task-4", userId: "mock-user", planId: "plan-1", date: "2026-06-29", block: "review", title: "Review · 4 saved mistakes", skill: "reading", refType: "review", refId: "revision-2", status: "pending", estMinutes: 5, xp: 20 },
];

export const skillProgress = {
  listening: 6,
  reading: 5.5,
  writing: 5,
  speaking: 5.5,
};

export const mockExam: MockExam = {
  id: "mini-mock-1",
  title: "Canada readiness mini mock",
  type: "mini",
  totalMinutes: 28,
  published: true,
  sections: [
    { id: "mock-section-1", order: 1, skill: "listening", timeLimitS: 360, itemRefs: ["listening-1", "listening-2"] },
    { id: "mock-section-2", order: 2, skill: "reading", timeLimitS: 480, itemRefs: ["reading-1", "reading-2"] },
    { id: "mock-section-3", order: 3, skill: "writing", timeLimitS: 900, itemRefs: ["writing-1"] },
    { id: "mock-section-4", order: 4, skill: "speaking", timeLimitS: 240, itemRefs: ["speaking-3"] },
  ],
};

export const revisionItems: RevisionItem[] = [
  { id: "revision-1", userId: "mock-user", refType: "vocab", refId: "vocab-1", title: "liaise", dueAt: "2026-06-29", ease: 2.4, interval: 2 },
  { id: "revision-2", userId: "mock-user", refType: "error", refId: "error-1", title: "Weak paraphrase match", dueAt: "2026-06-29", ease: 2.1, interval: 1 },
  { id: "revision-3", userId: "mock-user", refType: "grammar", refId: "grammar-7", title: "Comma splices", dueAt: "2026-06-30", ease: 2.2, interval: 3 },
];

export const xpEvents: XPEvent[] = [
  { id: "xp-1", userId: "mock-user", sourceType: "lesson", sourceId: "lesson-1", amount: 30, reason: "Completed GT overview" },
  { id: "xp-2", userId: "mock-user", sourceType: "revision", sourceId: "revision-1", amount: 20, reason: "Reviewed due vocabulary" },
  { id: "xp-3", userId: "mock-user", sourceType: "mock", sourceId: "mini-mock-1", amount: 80, reason: "Completed mini mock analysis" },
];

export const badges: Badge[] = [
  { id: "badge-1", code: "first-plan", name: "Plan built", description: "Completed onboarding and diagnostic setup.", criterion: "Create first plan", art: "7" },
  { id: "badge-2", code: "review-first", name: "Error repaired", description: "Completed your first correction review.", criterion: "Review one due item", art: "R" },
  { id: "badge-3", code: "no-bullets-missed", name: "No missed bullets", description: "Task 1 response covered all required points.", criterion: "All Task 1 bullets covered", art: "W" },
  { id: "badge-4", code: "mini-mock", name: "Mini mock complete", description: "Completed the first serious timed check.", criterion: "Submit mini mock", art: "M" },
  { id: "badge-5", code: "clb-reading", name: "CLB 7 Reading", description: "Estimated Reading reached CLB 7.", criterion: "Reading band 6.0+", art: "R" },
  { id: "badge-6", code: "streak-7", name: "Seven-day routine", description: "Seven active study days.", criterion: "7-day streak", art: "7" },
  { id: "badge-7", code: "tone-control", name: "Tone control", description: "Improved Task 1 register errors.", criterion: "Resolve tone errors", art: "T" },
  { id: "badge-8", code: "evidence-reader", name: "Evidence reader", description: "Used passage evidence in review.", criterion: "Review five reading errors", art: "E" },
];

export const errorLogs: ErrorLog[] = [
  { id: "error-1", userId: "mock-user", category: "weak_paraphrase", skill: "reading", refType: "question", refId: "reading-3", note: "Matched a similar word instead of the exact meaning.", resolved: false },
  { id: "error-2", userId: "mock-user", category: "distractor", skill: "listening", refType: "question", refId: "listening-4", note: "Chose the first time mentioned before the speaker corrected it.", resolved: false },
  { id: "error-3", userId: "mock-user", category: "grammar_type", skill: "writing", refType: "attempt", refId: "writing-attempt-1", note: "Run-on sentences reduced clarity.", resolved: false },
];
