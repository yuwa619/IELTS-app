import type { PracticeQuestion, SpeakingPrompt, WritingPrompt } from "@/types/domain";

// Additional original, IELTS General Training-style content authored for
// Clearband. All passages, questions, prompts and explanations are original.
// Reading = GT (workplace/social register); Listening = shared.

const SRC = "Clearband Original";

// --- General Training Reading: distinct original passages -------------------
const tenancyPassage =
  "Maple Court Tenancy Notes. Tenants must give 30 days' written notice before " +
  "moving out. The security deposit is returned within 21 days of the final " +
  "inspection, provided there is no damage beyond normal wear. Minor repairs " +
  "under 100 dollars are the tenant's responsibility; larger repairs must be " +
  "reported to the building manager, who will arrange a contractor. Quiet hours " +
  "are from 10 pm to 7 am on weekdays.";

const newsletterPassage =
  "Brookfield Community Newsletter. The autumn swim programme opens for " +
  "registration on 1 September. Members pay 45 dollars for eight sessions; " +
  "non-members pay 60 dollars. Places are limited to twelve per class and are " +
  "filled in the order applications are received. A parent or guardian must " +
  "stay on site for swimmers under the age of nine. Refunds are available up " +
  "to one week before the first session.";

const jobAdPassage =
  "Part-time Warehouse Assistant. We are seeking a reliable assistant to join " +
  "our evening team. Shifts run from 4 pm to 8 pm, Monday to Thursday. " +
  "Applicants must be able to lift boxes up to 15 kilograms and hold a valid " +
  "forklift certificate, or be willing to train within the first month. " +
  "Previous warehouse experience is preferred but not essential. Uniform and " +
  "safety boots are provided.";

export const gtReadingQuestions: PracticeQuestion[] = [
  {
    id: "gt-reading-1",
    skill: "reading",
    questionType: "tfng",
    topic: "tenancy",
    difficulty: 3,
    prompt: "Tenants must pay for repairs that cost more than 100 dollars.",
    payload: {
      passage: tenancyPassage,
      instructions: "Choose True, False, or Not Given.",
      options: ["True", "False", "Not Given"],
    },
    answerKey: {
      answer: "False",
      evidence: "Minor repairs under 100 dollars are the tenant's responsibility; larger repairs must be reported to the building manager.",
    },
    explanation:
      "Repairs over 100 dollars are the manager's responsibility, not the tenant's, so the statement is False rather than Not Given.",
    published: true,
    moduleType: "general_training",
    sourceName: SRC,
  },
  {
    id: "gt-reading-2",
    skill: "reading",
    questionType: "short_answer",
    topic: "tenancy",
    difficulty: 2,
    prompt: "How many days of written notice must a tenant give before moving out?",
    payload: {
      passage: tenancyPassage,
      instructions: "Write NO MORE THAN TWO WORDS AND/OR A NUMBER.",
      wordLimit: "NO MORE THAN TWO WORDS AND/OR A NUMBER",
    },
    answerKey: { answer: "30 days", evidence: "Tenants must give 30 days' written notice before moving out." },
    explanation: "The passage states 30 days' written notice, so the exact figure is the answer.",
    published: true,
    moduleType: "general_training",
    sourceName: SRC,
  },
  {
    id: "gt-reading-3",
    skill: "reading",
    questionType: "tfng",
    topic: "community",
    difficulty: 3,
    prompt: "Non-members and members pay the same price for the swim programme.",
    payload: {
      passage: newsletterPassage,
      instructions: "Choose True, False, or Not Given.",
      options: ["True", "False", "Not Given"],
    },
    answerKey: {
      answer: "False",
      evidence: "Members pay 45 dollars for eight sessions; non-members pay 60 dollars.",
    },
    explanation: "The two prices differ (45 vs 60 dollars), so the statement is False.",
    published: true,
    moduleType: "general_training",
    sourceName: SRC,
  },
  {
    id: "gt-reading-4",
    skill: "reading",
    questionType: "short_answer",
    topic: "community",
    difficulty: 2,
    prompt: "Up to when can a swimmer get a refund?",
    payload: {
      passage: newsletterPassage,
      instructions: "Write NO MORE THAN THREE WORDS.",
      wordLimit: "NO MORE THAN THREE WORDS",
    },
    answerKey: {
      answer: "one week before",
      evidence: "Refunds are available up to one week before the first session.",
    },
    explanation: "The refund window closes one week before the first session.",
    published: true,
    moduleType: "general_training",
    sourceName: SRC,
  },
  {
    id: "gt-reading-5",
    skill: "reading",
    questionType: "tfng",
    topic: "employment",
    difficulty: 3,
    prompt: "Applicants without a forklift certificate can never be considered.",
    payload: {
      passage: jobAdPassage,
      instructions: "Choose True, False, or Not Given.",
      options: ["True", "False", "Not Given"],
    },
    answerKey: {
      answer: "False",
      evidence: "hold a valid forklift certificate, or be willing to train within the first month.",
    },
    explanation:
      "Applicants may instead be willing to train within the first month, so lacking the certificate is not an absolute barrier.",
    published: true,
    moduleType: "general_training",
    sourceName: SRC,
  },
  {
    id: "gt-reading-6",
    skill: "reading",
    questionType: "mcq",
    topic: "employment",
    difficulty: 3,
    prompt: "What are the working hours for this role?",
    payload: {
      passage: jobAdPassage,
      instructions: "Choose the correct option.",
      options: ["4 pm to 8 pm, Monday to Thursday", "9 am to 5 pm, Monday to Friday", "Weekends only", "4 pm to 8 pm, every day"],
    },
    answerKey: {
      answer: "4 pm to 8 pm, Monday to Thursday",
      evidence: "Shifts run from 4 pm to 8 pm, Monday to Thursday.",
    },
    explanation: "The advert states evening shifts, 4 pm to 8 pm, Monday to Thursday.",
    published: true,
    moduleType: "general_training",
    sourceName: SRC,
  },
];

// --- Shared Listening: distinct original scenarios --------------------------
const libraryTranscript =
  "Librarian: Welcome to Brookfield Library. To join, you'll need one piece of " +
  "photo ID and proof of address, such as a utility bill. Membership is free " +
  "for residents. You can borrow up to eight items for three weeks, and you can " +
  "renew online twice unless another member has reserved the item.";

const inductionTranscript =
  "Supervisor: On your first day, please arrive at 8:45 so we can complete your " +
  "induction before the shift. Bring your bank details for payroll and wear " +
  "closed shoes. Lockers are available; bring your own padlock. The first break " +
  "is at 10:30 and lasts fifteen minutes.";

export const sharedListeningQuestions: PracticeQuestion[] = [
  {
    id: "gt-listening-1",
    skill: "listening",
    questionType: "short_answer",
    topic: "library",
    difficulty: 2,
    prompt: "How many items can a member borrow at one time?",
    payload: {
      transcript: libraryTranscript,
      instructions: "Write ONE NUMBER.",
      wordLimit: "ONE NUMBER",
    },
    answerKey: { answer: "8" },
    explanation: "The librarian says you can borrow up to eight items.",
    published: true,
    moduleType: "shared",
    sourceName: SRC,
  },
  {
    id: "gt-listening-2",
    skill: "listening",
    questionType: "mcq",
    topic: "library",
    difficulty: 3,
    prompt: "When can a member NOT renew an item online?",
    payload: {
      transcript: libraryTranscript,
      instructions: "Choose the correct option.",
      options: ["When another member has reserved it", "After one week", "If they have photo ID", "On weekends"],
    },
    answerKey: { answer: "When another member has reserved it" },
    explanation: "Renewal is blocked when another member has reserved the item.",
    published: true,
    moduleType: "shared",
    sourceName: SRC,
  },
  {
    id: "gt-listening-3",
    skill: "listening",
    questionType: "short_answer",
    topic: "workplace",
    difficulty: 2,
    prompt: "What time should the new employee arrive on the first day?",
    payload: {
      transcript: inductionTranscript,
      instructions: "Write THE TIME.",
      wordLimit: "ONE TIME",
    },
    answerKey: { answer: "8:45" },
    explanation: "The supervisor asks the employee to arrive at 8:45 for induction.",
    published: true,
    moduleType: "shared",
    sourceName: SRC,
  },
  {
    id: "gt-listening-4",
    skill: "listening",
    questionType: "short_answer",
    topic: "workplace",
    difficulty: 2,
    prompt: "What must the employee bring for their locker?",
    payload: {
      transcript: inductionTranscript,
      instructions: "Write NO MORE THAN TWO WORDS.",
      wordLimit: "NO MORE THAN TWO WORDS",
    },
    answerKey: { answer: "padlock", evidence: "Lockers are available; bring your own padlock." },
    explanation: "Lockers need the employee's own padlock.",
    published: true,
    moduleType: "shared",
    sourceName: SRC,
  },
];

// --- More GT Writing prompts (Task 1 letters + Task 2 essays) ---------------
export const gtWritingPrompts: WritingPrompt[] = [
  {
    id: "gt-writing-1",
    task: "task1",
    title: "Letter to a landlord about a deposit",
    prompt: "You moved out of a rented flat six weeks ago but have not received your deposit. Write a letter to your former landlord.",
    bullets: ["remind them when you moved out", "explain the problem", "say what you want them to do and by when"],
    type: "complaint",
    published: true,
    moduleType: "general_training",
    sourceName: SRC,
  },
  {
    id: "gt-writing-2",
    task: "task1",
    title: "Letter requesting time off work",
    prompt: "You need to take a week off work for a family reason. Write a letter to your manager.",
    bullets: ["explain why you need the time", "say which dates you need", "suggest how your work could be covered"],
    type: "request",
    published: true,
    moduleType: "general_training",
    sourceName: SRC,
  },
  {
    id: "gt-writing-3",
    task: "task2",
    title: "Remote work and cities",
    prompt: "As more people work from home, some towns outside big cities are growing quickly. Do the benefits of this trend outweigh the problems?",
    bullets: [],
    type: "advantages-disadvantages",
    published: true,
    moduleType: "shared",
    sourceName: SRC,
  },
  {
    id: "gt-writing-4",
    task: "task2",
    title: "Learning a new language as an adult",
    prompt: "Some people believe adults should be encouraged to learn the main language of a country before they arrive. To what extent do you agree or disagree?",
    bullets: [],
    type: "opinion",
    published: true,
    moduleType: "shared",
    sourceName: SRC,
  },
];

// --- More shared Speaking prompts -------------------------------------------
export const gtSpeakingPrompts: SpeakingPrompt[] = [
  {
    id: "gt-speaking-1",
    part: "p1",
    topic: "daily life",
    prompt: "How do you usually travel around your town or city?",
    cuePoints: ["how often", "why that way"],
    published: true,
    moduleType: "shared",
    sourceName: SRC,
  },
  {
    id: "gt-speaking-2",
    part: "p2",
    topic: "workplace",
    prompt: "Describe a time you helped a colleague or classmate.",
    cuePoints: ["who they were", "what you did", "how it turned out", "how you felt afterwards"],
    published: true,
    moduleType: "shared",
    sourceName: SRC,
  },
  {
    id: "gt-speaking-3",
    part: "p3",
    topic: "community",
    prompt: "Should employers do more to help new arrivals settle into a workplace?",
    cuePoints: ["training", "language support", "mentoring"],
    published: true,
    moduleType: "shared",
    sourceName: SRC,
  },
];
