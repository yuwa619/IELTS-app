import type {
  Lesson,
  LessonSection,
  LessonSectionData,
  LessonSectionKind,
  ModuleType,
  Skill,
} from "@/types/domain";

// Original Clearband lesson content. Every lesson is a full interactive
// module: intro → objectives → teaching → GT relevance → 2 examples →
// common mistake → strategy → guided practice → 2 quick checks → key point
// → next step. All content is original and IELTS General Training-style.

export interface LessonSectionDef {
  kind: LessonSectionKind;
  heading: string;
  body?: string;
  data?: LessonSectionData;
}

export interface LessonDef {
  id: string;
  title: string;
  /** Stable slug — existing seeded lessons keep their original slug so
   * Supabase upserts update in place instead of duplicating rows. */
  slug: string;
  module: string;
  skill: Skill;
  summary: string;
  estMinutes?: number;
  difficulty?: 1 | 2 | 3;
  clbFocus?: string;
  moduleType?: ModuleType;
  sections: LessonSectionDef[];
}

export function buildLesson(def: LessonDef, order: number): Lesson {
  const sections: LessonSection[] = def.sections.map((section, index) => ({
    id: `${def.id}-s${index + 1}`,
    lessonId: def.id,
    order: index + 1,
    kind: section.kind,
    heading: section.heading,
    body: section.body ?? "",
    data: section.data,
  }));
  return {
    id: def.id,
    title: def.title,
    slug: def.slug,
    module: def.module,
    skill: def.skill,
    summary: def.summary,
    estMinutes: def.estMinutes ?? 12,
    order,
    published: true,
    moduleType:
      def.moduleType ??
      (def.skill === "listening" || def.skill === "speaking" ? "shared" : "general_training"),
    sourceName: "Clearband Original",
    difficulty: def.difficulty ?? 2,
    clbFocus: def.clbFocus ?? "CLB 7+",
    sections,
  };
}

const PRACTICE = {
  listening: "/practice/listening",
  reading: "/practice/reading",
  task1: "/practice/writing/task-1",
  task2: "/practice/writing/task-2",
  speaking: "/practice/speaking",
  review: "/review",
} as const;

// ---------------------------------------------------------------------------
// Foundations
// ---------------------------------------------------------------------------

const overview: LessonDef = {
  id: "lesson-1",
  title: "IELTS General Training for Express Entry",
  slug: "ielts-general-training-for-express-entry",
  module: "Foundations",
  skill: "reading",
  summary: "Understand the GT format, timing, and how CLB targets change your plan.",
  difficulty: 1,
  clbFocus: "CLB 7–10",
  sections: [
    {
      kind: "intro",
      heading: "Why this lesson matters",
      body: "Canada accepts IELTS General Training — not Academic — for Express Entry, and your band scores convert directly into CLB levels that decide your eligibility and your CRS points. Before you study a single strategy, you need to know exactly what the test asks of you and what score actually moves your application forward.",
    },
    {
      kind: "objectives",
      heading: "You will learn",
      data: {
        items: [
          "The four GT sections, their timing, and how each is scored",
          "The difference between a minimum score (CLB 7) and a competitive score (CLB 9)",
          "How to set a per-skill target instead of one overall band",
        ],
      },
    },
    {
      kind: "explanation",
      heading: "The test at a glance",
      body: "IELTS GT has four sections. Listening: 4 parts, 40 questions, about 30 minutes. Reading: 3 sections of increasing difficulty, 40 questions, 60 minutes, drawn from everyday and workplace texts. Writing: Task 1 is a letter (about 20 minutes) and Task 2 is an essay (about 40 minutes) — Task 2 counts double. Speaking: a face-to-face interview in 3 parts, 11–14 minutes. Listening and Reading are marked out of 40 raw and converted to bands; Writing and Speaking are scored against four criteria each.",
    },
    {
      kind: "gt_relevance",
      heading: "The Canada connection",
      body: "For the Federal Skilled Worker stream, the minimum is CLB 7 — IELTS 6.0 in every skill. But CRS points jump sharply at CLB 9: Reading 7.0, Writing 7.0, Listening 8.0, Speaking 7.0. Notice Listening needs the highest band. If your profile allows it, plan for CLB 9, not the minimum.",
    },
    {
      kind: "example",
      heading: "Example: two candidates, same overall band",
      body: "Priya and Daniel both scored overall 7.0 — but their per-skill profiles differ.",
      data: {
        sample:
          "Priya: L 8.0 · R 7.0 · W 7.0 · S 7.0 → CLB 9 across the board.\nDaniel: L 7.5 · R 7.5 · W 7.0 · S 6.5 → Speaking drags him to CLB 8 territory.",
        note: "Daniel's overall looks fine, but Express Entry reads each skill separately. His CRS points are far lower than Priya's.",
      },
    },
    {
      kind: "example",
      heading: "Example: reading a score requirement correctly",
      body: "A job-bank posting says “CLB 7 required”. What does that mean in IELTS GT bands?",
      data: {
        sample: "CLB 7 = Listening 6.0 · Reading 6.0 · Writing 6.0 · Speaking 6.0 — in all four skills, on one test sitting.",
        note: "One Skill Retake is not accepted for Express Entry, so every skill has to land on the same test day.",
      },
    },
    {
      kind: "mistake",
      heading: "Common mistake",
      body: "Studying for “overall 7” instead of per-skill targets. Learners polish their strongest skill for comfort while the weakest one quietly caps their CLB. Your CLB level is set by your lowest skill — train to raise the floor, not the ceiling.",
    },
    {
      kind: "strategy",
      heading: "Set your plan in four moves",
      data: {
        items: [
          "Decide your goal mode: eligibility (CLB 7) or competitive CRS (CLB 9)",
          "Write down the four per-skill bands that goal requires",
          "Compare each band with your diagnostic result to find your gap skill",
          "Give your weakest skill the first practice block of every study day",
        ],
      },
    },
    {
      kind: "guided_practice",
      heading: "Try it: map your own target",
      body: "Use your onboarding goal to work through the mapping yourself before revealing the model.",
      data: {
        task: "Your goal is CLB 9. Write the four IELTS GT bands you need, then mark which skill is usually hardest to raise.",
        modelAnswer:
          "CLB 9 = Reading 7.0, Writing 7.0, Listening 8.0, Speaking 7.0. Listening carries the highest requirement (8.0), so most CLB 9 plans need Listening practice on more days than any other skill — check your own diagnostic before assuming, though.",
      },
    },
    {
      kind: "quick_check",
      heading: "Quick check 1",
      data: {
        options: ["IELTS Academic", "IELTS General Training", "Either module"],
        answer: "IELTS General Training",
        explanation: "Express Entry accepts IELTS General Training only. Academic scores cannot be used, however high they are.",
      },
      body: "Which IELTS module does Canada accept for Express Entry?",
    },
    {
      kind: "quick_check",
      heading: "Quick check 2",
      data: {
        options: ["Listening 7.0", "Listening 7.5", "Listening 8.0"],
        answer: "Listening 8.0",
        explanation: "CLB 9 requires Listening 8.0 — higher than the 7.0 needed in Reading, Writing, and Speaking. Plan your listening time accordingly.",
      },
      body: "What Listening band does CLB 9 require?",
    },
    {
      kind: "key_point",
      heading: "Remember this",
      data: {
        keyPoint: "Express Entry reads each skill separately: your CLB is set by your weakest band, so train per-skill targets — CLB 9 means L 8.0 and 7.0 elsewhere.",
      },
    },
    {
      kind: "next_step",
      heading: "Next step",
      body: "Lock in your per-skill targets, then start with a reading drill to baseline your speed on GT texts.",
      data: { nextHref: PRACTICE.reading, nextLabel: "Start GT Reading practice" },
    },
  ],
};

// ---------------------------------------------------------------------------
// Listening (shared module) — 5 lessons
// ---------------------------------------------------------------------------

const listeningPrediction: LessonDef = {
  id: "lesson-7",
  title: "Listening prediction and signposting",
  slug: "listening-prediction-and-signposting",
  module: "Listening",
  skill: "listening",
  summary: "Predict answer type before the audio starts and track speaker corrections.",
  difficulty: 2,
  sections: [
    {
      kind: "intro",
      heading: "Why this lesson matters",
      body: "In IELTS Listening you hear the recording once. Candidates who read the questions cold lose the first answers while they are still working out what to listen for. Prediction turns the silent seconds before each part into marks: you decide what kind of word is missing before the speaker says it.",
    },
    {
      kind: "objectives",
      heading: "You will learn",
      data: {
        items: [
          "How to predict the answer type (number, name, day, place) from the question form",
          "How speakers signal that an answer is coming — and that an answer has changed",
          "A pre-listening routine you can run in under 30 seconds",
        ],
      },
    },
    {
      kind: "explanation",
      heading: "Prediction: decide the shape of the answer",
      body: "Every gap tells you something before the audio starts. “Departure time: ____” must be a clock time. “Contact: Ms ____” must be a surname, probably spelled out. “Cost per session: $____” must be a number, and a distractor price will almost certainly appear first. Signposting is the second half: speakers flag answers with phrases like “what you'll need is…”, and flag corrections with “actually”, “sorry, that should be…”, or “rather than”. The corrected version is the answer; the first version is the trap.",
    },
    {
      kind: "gt_relevance",
      heading: "In the GT exam",
      body: "Parts 1 and 2 are everyday contexts — bookings, memberships, community notices — exactly where predictable details (dates, prices, postcodes) live. At CLB 9 you need Listening 8.0, roughly 35 of 40 correct, so you cannot give away the easy Part 1 marks to slow reading.",
    },
    {
      kind: "example",
      heading: "Example: predicting a form answer",
      body: "The question sheet shows a booking form.",
      data: {
        sample: "Class starts: ____  →  predict a day or date.\nAudio: “We did have a Tuesday group, but the new intake begins on Thursday.”",
        note: "Prediction primes you for a day; signposting (“but… begins on”) tells you Thursday is the answer and Tuesday is the distractor.",
      },
    },
    {
      kind: "example",
      heading: "Example: hearing a correction",
      body: "A caller books a repair visit.",
      data: {
        sample: "“Let's say ten o'clock — actually, sorry, the engineer isn't free until half past ten.”",
        note: "“Actually, sorry” cancels the first time. The answer is 10:30. If you wrote 10:00 the moment you heard it, you fell for the setup.",
      },
    },
    {
      kind: "mistake",
      heading: "Common mistake",
      body: "Writing the first plausible answer you hear and moving on. Part 1 nearly always mentions a wrong option first — an old price, a cancelled day, a misspelled name — then corrects it. Hold your pencil until the sentence finishes.",
    },
    {
      kind: "strategy",
      heading: "The 30-second pre-listen routine",
      data: {
        items: [
          "Read the next set of questions during the instructions audio",
          "Mark each gap with a type code: N (number), D (date/day), £ ($ amount), Sp (likely spelling)",
          "Underline the word before and after each gap — that is your landing zone",
          "While listening, wait for the sentence to end before you commit the answer",
        ],
      },
    },
    {
      kind: "guided_practice",
      heading: "Try it: type-code a form",
      body: "Predict before you reveal.",
      data: {
        task: "Type-code these gaps: 1) Membership number: ____  2) Nearest station: ____  3) First session: ____  4) Instructor's surname: ____",
        modelAnswer:
          "1) N — digits, listen for grouped numbers read in pairs. 2) Place name — may be spelled if unusual. 3) D — a day or date; expect one rejected option first. 4) Sp — surnames are usually spelled letter by letter; write as you hear, then check it looks like a name.",
      },
    },
    {
      kind: "quick_check",
      heading: "Quick check 1",
      body: "You hear: “The workshop is on the 14th — no, hang on, the 14th is a holiday, so it's the 15th.” What do you write?",
      data: {
        options: ["14th", "15th", "Both dates"],
        answer: "15th",
        explanation: "“No, hang on” cancels the 14th. Corrections replace, they don't add — one gap, one answer, and it's the corrected one.",
      },
    },
    {
      kind: "quick_check",
      heading: "Quick check 2",
      body: "The gap reads “Cost: $____ per month”. What should you predict?",
      data: {
        options: ["A spelled-out name", "A number, with a likely wrong price first", "A day of the week"],
        answer: "A number, with a likely wrong price first",
        explanation: "A currency gap means a number — and prices are classic correction bait: an old rate or non-member rate is usually mentioned before the one you need.",
      },
    },
    {
      kind: "key_point",
      heading: "Remember this",
      data: {
        keyPoint: "Type-code every gap before the audio (number / date / spelling), and never commit an answer until the sentence ends — the first option you hear is often corrected.",
      },
    },
    {
      kind: "next_step",
      heading: "Next step",
      body: "Run a listening drill and apply the type-code routine to every question before pressing play.",
      data: { nextHref: PRACTICE.listening, nextLabel: "Start Listening practice" },
    },
  ],
};

const listeningDistractors: LessonDef = {
  id: "lesson-11",
  title: "Distractors and speaker corrections",
  slug: "listening-distractors-and-corrections",
  module: "Listening",
  skill: "listening",
  summary: "Recognise the four distractor patterns IELTS uses and stop losing marks to them.",
  difficulty: 2,
  sections: [
    {
      kind: "intro",
      heading: "Why this lesson matters",
      body: "Most lost Listening marks are not vocabulary failures — they are distractor hits. IELTS builds wrong answers into the audio deliberately, and they follow a small number of repeatable patterns. Once you can name the pattern, you can hear it coming.",
    },
    {
      kind: "objectives",
      heading: "You will learn",
      data: {
        items: [
          "The four distractor patterns: correction, negation, option-rejection, and wrong-speaker",
          "The signal phrases that introduce each pattern",
          "How to log distractor hits so they stop repeating",
        ],
      },
    },
    {
      kind: "explanation",
      heading: "The four patterns",
      body: "Correction: a detail is stated then amended (“the 3rd — sorry, the 3rd is fully booked, the 10th”). Negation: a detail is mentioned then ruled out (“you won't need your passport, just a utility bill”). Option-rejection: several options are discussed and all but one dismissed (“the red one's out of stock, the blue is over budget, so we'll take the grey”). Wrong-speaker: in two-person recordings, one speaker suggests something the other overrules — the answer belongs to the speaker with authority to decide.",
    },
    {
      kind: "gt_relevance",
      heading: "In the GT exam",
      body: "Parts 1 and 3 lean heavily on correction and option-rejection. To reach Listening 8.0 for CLB 9 you can only afford about five errors in the whole test — two careless distractor hits in Part 1 already burns nearly half that budget.",
    },
    {
      kind: "example",
      heading: "Example: option-rejection",
      body: "Question: “Which room is the workshop in?”",
      data: {
        sample: "“The main hall's being repainted, and the annexe only takes twelve people, so we've booked the library room.”",
        note: "Three rooms are named. Two are rejected with reasons. Only the library room survives the sentence — that is the answer.",
      },
    },
    {
      kind: "example",
      heading: "Example: wrong-speaker",
      body: "Question: “What day will they meet?”",
      data: {
        sample: "A: “Could we do Friday?” B: “I'm away Friday — Monday works.” A: “Monday it is.”",
        note: "Friday is proposed and declined. The agreed answer, confirmed by both speakers, is Monday. Agreement phrases (“it is”, “that's settled”) mark the real answer.",
      },
    },
    {
      kind: "mistake",
      heading: "Common mistake",
      body: "Treating the loudest or first detail as the answer. Distractors are usually spoken more clearly and earlier than the correct detail — that is exactly why they work. The answer tends to arrive after a hedge, a rejection, or an agreement phrase.",
    },
    {
      kind: "strategy",
      heading: "Distractor defence",
      data: {
        items: [
          "Expect one trap per question in Parts 1 and 3 — assume the first candidate answer is bait",
          "Listen for cancel-words: actually, sorry, but, rather, instead, won't need",
          "In dialogues, track who confirms — the answer is what both speakers settle on",
          "After each drill, label every error with its pattern (correction / negation / rejection / wrong-speaker)",
        ],
      },
    },
    {
      kind: "guided_practice",
      heading: "Try it: name the pattern",
      body: "Identify the distractor pattern before revealing.",
      data: {
        task: "“You can pay by card at the desk — although actually the card machine's down this week, so bring cash.” Question: How should you pay? Name the pattern and the answer.",
        modelAnswer: "Pattern: correction (signalled by “although actually”). The card option is cancelled mid-sentence; the answer is cash. Card is the distractor even though it was stated first and more confidently.",
      },
    },
    {
      kind: "quick_check",
      heading: "Quick check 1",
      body: "“You won't need form B unless you're renewing — for a first application it's just form A.” A first-time applicant needs which form?",
      data: {
        options: ["Form A", "Form B", "Both forms"],
        answer: "Form A",
        explanation: "Negation pattern: form B is ruled out for first-timers. “Just form A” is the surviving detail.",
      },
    },
    {
      kind: "quick_check",
      heading: "Quick check 2",
      body: "In a dialogue, which answer should you trust?",
      data: {
        options: ["The first option mentioned", "The option said most loudly", "The option both speakers finally agree on"],
        answer: "The option both speakers finally agree on",
        explanation: "Wrong-speaker distractors rely on you grabbing an early suggestion. Wait for confirmation language before writing.",
      },
    },
    {
      kind: "key_point",
      heading: "Remember this",
      data: {
        keyPoint: "Distractors follow four patterns — correction, negation, option-rejection, wrong-speaker. Assume the first plausible answer is bait and wait for the cancel-word or the agreement.",
      },
    },
    {
      kind: "next_step",
      heading: "Next step",
      body: "Do a listening set and label every wrong answer with its distractor pattern in your error log.",
      data: { nextHref: PRACTICE.listening, nextLabel: "Start Listening practice" },
    },
  ],
};

const listeningNumbers: LessonDef = {
  id: "lesson-8",
  title: "Numbers, dates and spelling accuracy",
  slug: "form-completion-accuracy",
  module: "Listening",
  skill: "listening",
  summary: "Stop losing marks to number formats, date conventions, and spelled-out names.",
  difficulty: 1,
  sections: [
    {
      kind: "intro",
      heading: "Why this lesson matters",
      body: "A correct answer written incorrectly scores zero. In Listening, spelling and number-format errors are marked as wrong answers — no partial credit. These are the most fixable marks in the entire test, because they depend on habits, not language level.",
    },
    {
      kind: "objectives",
      heading: "You will learn",
      data: {
        items: [
          "How IELTS reads out phone numbers, prices, and reference codes",
          "Date formats that are accepted — and the word-limit trap around them",
          "A reliable routine for spelled-out names and postcodes",
        ],
      },
    },
    {
      kind: "explanation",
      heading: "How details are dictated",
      body: "Phone numbers are read digit by digit, with “double” for repeats: “double four” = 44, and “oh” often replaces zero. Prices include the unit: write $250 or 250 dollars, matching the gap's format — if the gap already shows “$____”, write only the number. Dates: 14 March, March 14, and 14th March are all accepted, but if the instruction says ONE WORD AND/OR A NUMBER, “14 March” fails the limit — “March 14” does too; only formats within the limit count, so check the instruction first. Names and postcodes are spelled aloud; the only letters that commonly trip candidates are the vowel pairs A/E and I/Y and the pair G/J.",
    },
    {
      kind: "gt_relevance",
      heading: "In the GT exam",
      body: "Part 1 is a transactional conversation — bookings, applications, orders — and typically contains 6–8 detail answers. At the CLB 9 level (Listening 8.0) these are marks you must bank at 100%, because Parts 3 and 4 are where difficulty legitimately rises.",
    },
    {
      kind: "example",
      heading: "Example: phone number dictation",
      body: "Listen for grouping words.",
      data: {
        sample: "“It's oh seven seven, double eight, four two one, five.” → 0778 8421 5…",
        note: "“Double eight” is 88, not “two eights” written out. Write digits as you hear them; regroup after the sentence ends.",
      },
    },
    {
      kind: "example",
      heading: "Example: spelled surname",
      body: "The speaker spells, you transcribe.",
      data: {
        sample: "“It's Guajardo — G-U-A-J-A-R-D-O.”",
        note: "Never guess from sound. If a name is unusual, IELTS always spells it — the spelled version overrides whatever you thought you heard.",
      },
    },
    {
      kind: "mistake",
      heading: "Common mistake",
      body: "Transferring answers carelessly: writing “tuseday”, doubling a letter that was single, or exceeding the word limit with “on the 14th of March”. The audio gave you the mark; the transfer threw it away. Spelling counts, capitalisation is forgiving, word limits are absolute.",
    },
    {
      kind: "strategy",
      heading: "Detail-accuracy routine",
      data: {
        items: [
          "Before each part, note the word limit and circle it",
          "Write numbers as digits, never words — digits can't be misspelled",
          "During spelling, write letters vertically in the margin, then join them",
          "In the check minute, re-read every answer against the word limit and for doubled letters",
        ],
      },
    },
    {
      kind: "guided_practice",
      heading: "Try it: take dictation",
      body: "Read this aloud to yourself at speaking pace, writing as you go.",
      data: {
        task: "“The reference is C-H, double R, one nine, oh two.” Write the reference code.",
        modelAnswer: "CHRR1902. “Double R” becomes RR, “oh” is zero. If you wrote CHR19O2 (letter O), note the habit: after “one nine”, the speaker is in number mode — “oh” is 0.",
      },
    },
    {
      kind: "quick_check",
      heading: "Quick check 1",
      body: "The instruction says NO MORE THAN TWO WORDS AND/OR A NUMBER. The audio says the course starts “on the first of July”. What do you write?",
      data: {
        options: ["the first of July", "1 July", "first of July"],
        answer: "1 July",
        explanation: "“1 July” is one number + one word — inside the limit. The other options are three or more words and score zero even though they're “correct”.",
      },
    },
    {
      kind: "quick_check",
      heading: "Quick check 2",
      body: "You hear “my number ends double six, three”. What are the final digits?",
      data: {
        options: ["663", "6663", "266 3"],
        answer: "663",
        explanation: "“Double six” = 66, then 3. Doubling words multiply the digit once — 663.",
      },
    },
    {
      kind: "key_point",
      heading: "Remember this",
      data: {
        keyPoint: "Detail answers are all-or-nothing: digits not words, spell exactly what is dictated, and re-check every answer against the word limit before moving on.",
      },
    },
    {
      kind: "next_step",
      heading: "Next step",
      body: "Drill a Part 1-style listening set and aim for zero format errors, not just correct content.",
      data: { nextHref: PRACTICE.listening, nextLabel: "Start Listening practice" },
    },
  ],
};

const listeningMcq: LessonDef = {
  id: "lesson-12",
  title: "Multiple choice listening strategy",
  slug: "listening-multiple-choice-strategy",
  module: "Listening",
  skill: "listening",
  summary: "Handle paraphrased options and three-way traps in Parts 2 and 3.",
  difficulty: 3,
  sections: [
    {
      kind: "intro",
      heading: "Why this lesson matters",
      body: "Multiple choice is the hardest Listening format because all three options are usually mentioned in the audio. The question is never “which option do you hear?” — it is “which option matches what the speaker actually meant?” That requires reading ahead and listening for meaning, not word-matching.",
    },
    {
      kind: "objectives",
      heading: "You will learn",
      data: {
        items: [
          "Why word-matching fails in listening MCQ — and what to track instead",
          "How to pre-read stems and options under time pressure",
          "How to recover when you miss a question without losing the next one",
        ],
      },
    },
    {
      kind: "explanation",
      heading: "Meaning-matching, not word-matching",
      body: "IELTS writes MCQ options using words from the audio attached to the wrong meaning, and paraphrases the correct answer so it shares almost no words with the recording. If option A says “the course is too expensive” the audio might say “it's not cheap, but honestly it's the time commitment that puts people off” — the answer is about time, not money, even though cost vocabulary appeared. Your anchor is the stem: keep the question's exact focus (why / how / what decided) in mind and judge each option against what the speaker concludes, not what they mention.",
    },
    {
      kind: "gt_relevance",
      heading: "In the GT exam",
      body: "Part 2 (a monologue about a facility or event) and Part 3 (a discussion) carry most MCQ items. Band 8 listening — the CLB 9 requirement — usually comes down to these questions, because Part 1 and matching items are more mechanical.",
    },
    {
      kind: "example",
      heading: "Example: all options mentioned",
      body: "Question: Why did the club move venue? A) rising rent B) noise complaints C) more space needed.",
      data: {
        sample: "“The rent did go up, and yes, a neighbour once complained — but frankly we'd outgrown the hall; we simply couldn't fit everyone in.”",
        note: "All three options appear. “But frankly” dismisses A and B as background; “couldn't fit everyone” paraphrases C. Answer: C.",
      },
    },
    {
      kind: "example",
      heading: "Example: paraphrase distance",
      body: "Option: “Booking in advance is essential.”",
      data: {
        sample: "Audio: “Turning up on the day is a gamble — places go weeks before.”",
        note: "No shared words at all. “Places go weeks before” = you must book ahead. High-band answers hide behind full paraphrase; train yourself to hear equivalence.",
      },
    },
    {
      kind: "mistake",
      heading: "Common mistake",
      body: "Choosing the option whose words you heard most recently, and then missing the next question while second-guessing. In MCQ sequences the audio moves fast: a missed question costs one mark, but dwelling on it costs two or three.",
    },
    {
      kind: "strategy",
      heading: "MCQ under pressure",
      data: {
        items: [
          "In the preview time, underline the focus word of each stem (why / when / who decided)",
          "Cross out options as the speaker dismisses them — elimination is faster than selection",
          "Treat shared vocabulary as a warning sign, not a confirmation",
          "If you miss one, guess immediately, mark it, and jump to the next stem — never chase the audio backwards",
        ],
      },
    },
    {
      kind: "guided_practice",
      heading: "Try it: judge the conclusion",
      body: "Read the exchange, then decide.",
      data: {
        task: "Q: What does the manager say about the new roster? A) It saves money B) Staff prefer it C) It needs more testing. Audio: “It's cheaper on paper, and the team seem happy enough — but I'd want another month's trial before we commit.” Which option, and why?",
        modelAnswer: "C. Options A and B are conceded (“cheaper on paper”, “seem happy enough”) but the speaker's conclusion — signalled by “but I'd want” — is that it needs more testing. In MCQ, the answer lives after the ‘but'.",
      },
    },
    {
      kind: "quick_check",
      heading: "Quick check 1",
      body: "An option shares three exact words with the audio. What does that suggest?",
      data: {
        options: ["It is probably correct", "It is probably a trap", "Word overlap means nothing either way"],
        answer: "It is probably a trap",
        explanation: "IELTS attaches audio vocabulary to wrong options and paraphrases correct ones. Exact overlap should raise suspicion, not confidence.",
      },
    },
    {
      kind: "quick_check",
      heading: "Quick check 2",
      body: "You realise you missed question 24 and the speaker has moved on. What do you do?",
      data: {
        options: ["Keep thinking about 24 until you remember", "Guess 24 now and focus on 25", "Leave 24 blank and decide at the end"],
        answer: "Guess 24 now and focus on 25",
        explanation: "A guess keeps a 33% chance and protects question 25. Chasing a lost answer is how one dropped mark becomes three. (Never leave blanks — there's no penalty for guessing.)",
      },
    },
    {
      kind: "key_point",
      heading: "Remember this",
      data: {
        keyPoint: "In listening MCQ every option gets mentioned — the answer is the speaker's conclusion, usually after a ‘but'. Shared words are bait; paraphrase is proof.",
      },
    },
    {
      kind: "next_step",
      heading: "Next step",
      body: "Practise a listening set and note how often the correct MCQ answer follows a contrast word.",
      data: { nextHref: PRACTICE.listening, nextLabel: "Start Listening practice" },
    },
  ],
};

const listeningMaps: LessonDef = {
  id: "lesson-13",
  title: "Map and diagram labelling",
  slug: "listening-map-diagram-labelling",
  module: "Listening",
  skill: "listening",
  summary: "Follow spoken directions on a map without losing your place.",
  difficulty: 2,
  sections: [
    {
      kind: "intro",
      heading: "Why this lesson matters",
      body: "Map questions panic candidates because they demand two skills at once: listening and spatial tracking. But map audio is the most predictable in the whole test — it always moves through the labels in order, from a stated starting point, using a small fixed set of direction phrases.",
    },
    {
      kind: "objectives",
      heading: "You will learn",
      data: {
        items: [
          "The direction vocabulary IELTS actually uses (and what each phrase means on paper)",
          "How to orient yourself before the audio starts",
          "How to recover your position if you get lost mid-description",
        ],
      },
    },
    {
      kind: "explanation",
      heading: "The direction toolkit",
      body: "Learn these as physical movements on the page: “as you enter / from the entrance” fixes your starting point; “go straight along / follow the path” means keep direction; “turn left/right” rotates from the direction you are moving, not from how the map is printed; “just past / immediately before” places the label relative to a landmark; “opposite / across from” means facing; “in the corner / at the far end” uses the map's edges. The speaker labels items in the same order as the question numbers — that ordering is your safety net.",
    },
    {
      kind: "gt_relevance",
      heading: "In the GT exam",
      body: "Maps appear in Part 2 — a guide describing a community centre, market, or worksite. These are bankable marks for CLB targets because the language is simple; only the tracking is hard, and tracking is trainable.",
    },
    {
      kind: "example",
      heading: "Example: relative direction",
      body: "You are walking “up” the printed map.",
      data: {
        sample: "“Follow the main corridor and turn right just after the lifts.”",
        note: "“Right” is right relative to your direction of travel. If you were moving down the printed page, that turn goes to the printed left. Move a finger, not your eyes.",
      },
    },
    {
      kind: "example",
      heading: "Example: landmark anchoring",
      body: "Labels are placed off landmarks, not coordinates.",
      data: {
        sample: "“The first-aid room is directly opposite the café, next to the stairs.”",
        note: "Two anchors: opposite the café AND beside the stairs. If only one fits a location, keep listening — IELTS gives redundant anchors precisely so you can confirm.",
      },
    },
    {
      kind: "mistake",
      heading: "Common mistake",
      body: "Reading the map like a picture instead of walking it. Candidates who keep their finger off the page lose position at the first turn, then miss three labels while searching. The finger is not optional technique — it is the technique.",
    },
    {
      kind: "strategy",
      heading: "Map routine",
      data: {
        items: [
          "In preview time: find the entrance, note compass or arrow markers, read all existing labels aloud in your head",
          "Predict the path: numbered gaps usually trace one walkable route",
          "Track with your finger from the stated start; move only on movement verbs",
          "Lost? Skip to the next label's anchor landmark and rejoin — the order of questions matches the order of audio",
        ],
      },
    },
    {
      kind: "guided_practice",
      heading: "Try it: walk the description",
      body: "Sketch a square room with a door at the bottom, then place the label.",
      data: {
        task: "“As you come in, walk straight ahead to the noticeboard on the back wall, then turn left; the storage cupboard is in the far corner, just past the window.” Where is the cupboard?",
        modelAnswer: "Back-left corner of the room (from the entrance), beyond the window on the left wall. Entering at the bottom, ‘straight ahead' reaches the top wall; turning left faces the left wall; ‘far corner just past the window' = top-left corner.",
      },
    },
    {
      kind: "quick_check",
      heading: "Quick check 1",
      body: "The speaker says “turn right” while you are moving down the printed map. Which printed direction do you go?",
      data: {
        options: ["Printed right", "Printed left", "Printed up"],
        answer: "Printed left",
        explanation: "Directions are relative to travel. Moving down the page, your right hand points to the printed left. This single idea fixes most map errors.",
      },
    },
    {
      kind: "quick_check",
      heading: "Quick check 2",
      body: "You lose your place after label 16. What is the best recovery?",
      data: {
        options: ["Restart tracing from the entrance", "Listen for label 17's landmark and rejoin there", "Abandon the map questions"],
        answer: "Listen for label 17's landmark and rejoin there",
        explanation: "Audio follows question order, so the next label is your rejoin point. Restarting from the entrance guarantees you stay behind the speaker.",
      },
    },
    {
      kind: "key_point",
      heading: "Remember this",
      data: {
        keyPoint: "Walk the map with your finger from the stated entrance; turns are relative to travel direction, and if you get lost, rejoin at the next question's landmark.",
      },
    },
    {
      kind: "next_step",
      heading: "Next step",
      body: "Do a listening drill; for any map-style item, practise the finger-tracking routine deliberately.",
      data: { nextHref: PRACTICE.listening, nextLabel: "Start Listening practice" },
    },
  ],
};

// ---------------------------------------------------------------------------
// Reading (General Training) — 5 lessons
// ---------------------------------------------------------------------------

const readingSkimScan: LessonDef = {
  id: "lesson-6",
  title: "Skimming and scanning GT texts",
  slug: "scanning-workplace-notices",
  module: "Reading",
  skill: "reading",
  summary: "Read notices, ads and workplace documents the way the test rewards — fast and targeted.",
  difficulty: 1,
  sections: [
    {
      kind: "intro",
      heading: "Why this lesson matters",
      body: "GT Reading gives you 40 questions in 60 minutes with no transfer time. Reading every word is a failing strategy by design. The test rewards two distinct speeds: skimming (building a fast map of what's where) and scanning (jumping straight to a detail). Knowing which speed each question wants is half of your Reading band.",
    },
    {
      kind: "objectives",
      heading: "You will learn",
      data: {
        items: [
          "The difference between skimming for structure and scanning for detail",
          "Which GT question types want which speed",
          "How to use formatting — headings, bold, bullets — as a free index",
        ],
      },
    },
    {
      kind: "explanation",
      heading: "Two speeds, one rule",
      body: "Skimming answers “what is this text about and where is each topic?” — you read the title, first lines of paragraphs, and any bold or bulleted structure, spending 30–45 seconds building a mental map. Scanning answers “where is this exact detail?” — you take a keyword from the question (a name, number, day, or a rare word unlikely to be paraphrased) and sweep the text for it and its synonyms. The rule: skim once per text, scan once per question. Section 1 texts (ads, notices, timetables) barely need skimming — their formatting is the map; go straight to scanning.",
    },
    {
      kind: "gt_relevance",
      heading: "In the GT exam",
      body: "Section 1 uses everyday texts (ads, notices), Section 2 workplace documents (contracts, policies, training notes), Section 3 one longer general-interest article. GT band thresholds are stricter than Academic — roughly 30/40 for Band 6 and 35/40 for Band 7 — so speed on the easy sections funds the time Section 3 needs.",
    },
    {
      kind: "example",
      heading: "Example: scanning a notice",
      body: "Question: “What is the latest date for a refund request?”",
      data: {
        sample: "Scan target: “refund” + any date format. The notice reads: “Refunds are available up to one week before the first session.”",
        note: "You never needed to read the swimming schedule, the prices, or the age rules. One keyword, one sweep, one mark — about 20 seconds.",
      },
    },
    {
      kind: "example",
      heading: "Example: skimming a policy",
      body: "A staff policy has five paragraphs; the question set asks about responsibilities.",
      data: {
        sample: "First-line skim: ¶1 “This policy applies to…”, ¶2 “Employees are expected to…”, ¶3 “Managers must…”, ¶4 “In case of an incident…”, ¶5 “Review and updates…”",
        note: "Thirty seconds of skimming tells you employee questions live in ¶2 and manager questions in ¶3. Each question now starts from the right paragraph, not from the top.",
      },
    },
    {
      kind: "mistake",
      heading: "Common mistake",
      body: "Scanning for the question's exact words. IELTS paraphrases: the question says “cost”, the text says “fee”; the question says “weekly”, the text says “every seven days”. Scan for the idea and its likely synonyms — exact-word scanning finds distractors more often than answers.",
    },
    {
      kind: "strategy",
      heading: "The 60-minute budget",
      data: {
        items: [
          "Section 1: ~15 minutes — scan-first, formatting is your index",
          "Section 2: ~18 minutes — skim each text (30s), then scan per question",
          "Section 3: ~25 minutes — proper skim, then question-by-question",
          "Leave 2 minutes to check word limits and spelling on the answer sheet",
        ],
      },
    },
    {
      kind: "guided_practice",
      heading: "Try it: choose your scan target",
      body: "Pick the best scan keyword before revealing.",
      data: {
        task: "Question: “Employees who work more than six hours are entitled to how long a break?” Which scan target do you choose: (a) employees, (b) six hours, (c) break — and why?",
        modelAnswer: "(b) “six hours” — numbers survive paraphrase, while “employees” appears everywhere and “break” may become “rest period”. Scan for the digit 6 / word “six”, then read that sentence fully. Answer will sit beside the number.",
      },
    },
    {
      kind: "quick_check",
      heading: "Quick check 1",
      body: "For a bus timetable with three questions, what's the right first move?",
      data: {
        options: ["Read the whole timetable carefully", "Skim it for 60 seconds, then answer", "Go straight to scanning for each question's detail"],
        answer: "Go straight to scanning for each question's detail",
        explanation: "Formatted texts are pre-indexed by their own layout. Skimming a timetable wastes the seconds it was designed to save.",
      },
    },
    {
      kind: "quick_check",
      heading: "Quick check 2",
      body: "The question asks about “salary”. Which scan behaviour is correct?",
      data: {
        options: ["Look only for the word ‘salary'", "Look for ‘salary' and likely synonyms like ‘pay' or ‘wage'", "Read every sentence until money is mentioned"],
        answer: "Look for ‘salary' and likely synonyms like ‘pay' or ‘wage'",
        explanation: "GT paraphrases everyday vocabulary constantly. Scanning a synonym set keeps speed without missing the reworded answer.",
      },
    },
    {
      kind: "key_point",
      heading: "Remember this",
      data: {
        keyPoint: "Skim once per text, scan once per question — and scan for the idea (numbers + synonyms), never just the question's exact words.",
      },
    },
    {
      kind: "next_step",
      heading: "Next step",
      body: "Run a timed GT reading drill and hold yourself to the 15/18/25-minute section budget.",
      data: { nextHref: PRACTICE.reading, nextLabel: "Start GT Reading practice" },
    },
  ],
};

const readingTfng: LessonDef = {
  id: "lesson-5",
  title: "True, False, Not Given discipline",
  slug: "true-false-not-given-discipline",
  module: "Reading",
  skill: "reading",
  summary: "Separate stated facts from plausible—but unstated—ideas.",
  difficulty: 2,
  sections: [
    {
      kind: "intro",
      heading: "Why this lesson matters",
      body: "TFNG is the question type where good readers lose the most marks — because it punishes exactly what good readers do: inferring. The test is not asking what is probably true in the real world. It is asking what this text states. That shift in discipline is worth a full band to many candidates.",
    },
    {
      kind: "objectives",
      heading: "You will learn",
      data: {
        items: [
          "The precise definitions of True, False, and Not Given",
          "The evidence test that separates False from Not Given",
          "The qualifier words (all, only, must) that flip answers",
        ],
      },
    },
    {
      kind: "explanation",
      heading: "The evidence test",
      body: "True: the text states the same idea, usually paraphrased. False: the text states the opposite — you can point to a sentence that contradicts the statement. Not Given: the text is silent; no sentence confirms or contradicts it. The working method is to find the text's sentence on the same topic and ask one question: does this sentence make the statement impossible? If yes → False. If it makes it certain → True. If the topic sentence exists but doesn't decide the matter — or there is no topic sentence at all — → Not Given. Never ask “is this likely?”; likelihood is the trap.",
    },
    {
      kind: "gt_relevance",
      heading: "In the GT exam",
      body: "TFNG clusters in Sections 2 and 3 — policies, guides, and the long Section 3 article. Six to eight marks typically ride on it. At GT's stricter conversion (35/40 for Band 7), fixing a TFNG leak is often the single fastest route to a CLB 9 reading score.",
    },
    {
      kind: "example",
      heading: "Example: False, not Not Given",
      body: "Statement: “Tenants pay for repairs over $100.”",
      data: {
        sample: "Text: “Minor repairs under $100 are the tenant's responsibility; larger repairs must be reported to the building manager, who will arrange a contractor.”",
        note: "The text assigns large repairs to the manager — it contradicts the statement. That's False. Candidates answer Not Given because the text never says “tenants do not pay”, but contradiction-by-assignment is still contradiction.",
      },
    },
    {
      kind: "example",
      heading: "Example: Not Given, not True",
      body: "Statement: “The swim programme is popular with local families.”",
      data: {
        sample: "Text: “Places are limited to twelve per class and are filled in the order applications are received.”",
        note: "Limited places suggest demand — but suggest is not state. No sentence measures popularity or mentions families' opinions. Real-world plausibility pulls you to True; the evidence test says Not Given.",
      },
    },
    {
      kind: "mistake",
      heading: "Common mistake",
      body: "Ignoring qualifiers. “The centre is open on weekends” (text: open Saturday only) is False — “weekends” claims both days. Words like all, always, only, must, and free change what a statement claims, so match the strength of the claim, not just the topic.",
    },
    {
      kind: "strategy",
      heading: "TFNG working method",
      data: {
        items: [
          "Underline the statement's claim words — especially quantities and qualifiers",
          "Scan for the text's sentence on that topic (it may be paraphrased)",
          "Apply the evidence test: contradicts → False; confirms → True; silent or undecided → Not Given",
          "Found no topic sentence after two sweeps? Answer Not Given and move on — that IS the answer, not a failure to find it",
        ],
      },
    },
    {
      kind: "guided_practice",
      heading: "Try it: run the evidence test",
      body: "Work the statement before revealing.",
      data: {
        task: "Text: “Uniform and safety boots are provided.” Statement: “Employees must pay for their own safety boots.” True, False, or Not Given — and which sentence decides it?",
        modelAnswer: "False. “Safety boots are provided” makes “employees must pay for boots” impossible — direct contradiction. If the statement had said “Employees must pay for their own gloves”, the text is silent on gloves → Not Given.",
      },
    },
    {
      kind: "quick_check",
      heading: "Quick check 1",
      body: "The text says nothing about parking. Statement: “Free parking is available on site.” Your answer?",
      data: {
        options: ["True", "False", "Not Given"],
        answer: "Not Given",
        explanation: "Silence is Not Given — even if a venue like this would probably have parking. No sentence, no verdict.",
      },
    },
    {
      kind: "quick_check",
      heading: "Quick check 2",
      body: "Statement: “All staff receive annual training.” Text: “Customer-facing staff attend a yearly refresher.” Your answer?",
      data: {
        options: ["True", "False", "Not Given"],
        answer: "Not Given",
        explanation: "The text confirms training for one group only. It neither confirms nor denies training for ALL staff — the qualifier is the whole question. (It doesn't contradict it either, so not False.)",
      },
    },
    {
      kind: "key_point",
      heading: "Remember this",
      data: {
        keyPoint: "TFNG asks what the text states, not what is likely: contradiction → False, confirmation → True, silence or an undecided qualifier → Not Given.",
      },
    },
    {
      kind: "next_step",
      heading: "Next step",
      body: "Do a reading set and, for every TFNG answer, note the exact sentence that decided it.",
      data: { nextHref: PRACTICE.reading, nextLabel: "Start GT Reading practice" },
    },
  ],
};

const readingMatching: LessonDef = {
  id: "lesson-14",
  title: "Matching information to paragraphs",
  slug: "reading-matching-information",
  module: "Reading",
  skill: "reading",
  summary: "Locate which section contains an idea when the words have all been changed.",
  difficulty: 3,
  sections: [
    {
      kind: "intro",
      heading: "Why this lesson matters",
      body: "Matching-information questions (“Which section mentions…?”) are pure paraphrase hunts: the question describes an idea in completely different words from the text, and answers come in no particular order. Without a method, candidates re-read the whole text for every question. With one, each match takes under a minute.",
    },
    {
      kind: "objectives",
      heading: "You will learn",
      data: {
        items: [
          "How to convert each question into a searchable idea, not a keyword",
          "Why answer order is random — and how that changes your tactics",
          "How to use elimination when two paragraphs both look possible",
        ],
      },
    },
    {
      kind: "explanation",
      heading: "Hunt ideas, not words",
      body: "First compress each question into a 2–3 word idea tag: “Which section mentions a change of schedule?” → tag: time changed. “…a cost that some people don't pay?” → tag: exemption. Then skim-map the text once, writing your own 2–3 word summary beside each paragraph. Now matching is tag-to-tag, not sentence-to-paragraph. Because answers are unordered and paragraphs can be reused (the instructions say if so), never assume the next answer lies after the previous one — that assumption silently wrecks whole sets.",
    },
    {
      kind: "gt_relevance",
      heading: "In the GT exam",
      body: "Section 2 workplace texts and Section 3 articles carry these. They are the slowest question type per mark, so do them after the quick wins in the same set — banking fast marks first protects your total when time gets tight.",
    },
    {
      kind: "example",
      heading: "Example: full paraphrase",
      body: "Question tag: “equipment provided free”.",
      data: {
        sample: "Text (Section C): “Uniform and safety boots are provided.”",
        note: "The question might read “Which section mentions items supplied at no cost to the worker?” — no shared vocabulary with the text at all. Your paragraph note “what you get” is what makes the link findable.",
      },
    },
    {
      kind: "example",
      heading: "Example: two candidates, one answer",
      body: "Tag: “a deadline for getting money back”.",
      data: {
        sample: "¶B mentions prices and payment dates. ¶D says “refunds are available up to one week before the first session.”",
        note: "¶B talks about money but not about getting it back. The deciding noun is refund — deadline + money-returned only co-occur in ¶D. When two paragraphs compete, the answer is where BOTH halves of the idea appear.",
      },
    },
    {
      kind: "mistake",
      heading: "Common mistake",
      body: "Matching on a single shared word. A paragraph that mentions “training” will attract every training-related question, but the question asks about a specific angle — who pays for training, when it happens, who must attend. Match the full idea or you are donating marks to the distractor paragraph.",
    },
    {
      kind: "strategy",
      heading: "Matching method",
      data: {
        items: [
          "Tag every question with a 2–3 word idea before touching the text",
          "Skim once; write a margin note per paragraph in your own words",
          "Match easy tags first; cross off used questions (paragraphs may repeat — check the rubric)",
          "For a tie between paragraphs, require both halves of the idea in the same place",
        ],
      },
    },
    {
      kind: "guided_practice",
      heading: "Try it: tag and match",
      body: "Compress, then match.",
      data: {
        task: "Question: “Which section mentions what to do if equipment stops working?” Write the idea tag, then say what you'd look for in the margins of a staff manual with sections on Safety, Repairs, Pay, and Leave.",
        modelAnswer: "Tag: broken equipment procedure. Margin match: the Repairs section. In the text expect paraphrases like “report any fault to your supervisor” — no words shared with the question except perhaps ‘equipment', which alone proves nothing.",
      },
    },
    {
      kind: "quick_check",
      heading: "Quick check 1",
      body: "In matching-information questions, the answers appear in text order. True or false?",
      data: {
        options: ["True — they follow the text", "False — they are in random order"],
        answer: "False — they are in random order",
        explanation: "Unlike most reading types, matching answers are unordered. Question 27's answer may sit in the first paragraph and 28's in the last.",
      },
    },
    {
      kind: "quick_check",
      heading: "Quick check 2",
      body: "A question tag matches two paragraphs on topic. How do you decide?",
      data: {
        options: ["Choose the earlier paragraph", "Choose where both parts of the idea appear together", "Choose the longer paragraph"],
        answer: "Choose where both parts of the idea appear together",
        explanation: "Distractor paragraphs share the topic but only half the idea. The scoring paragraph contains the topic AND the specific angle the question describes.",
      },
    },
    {
      kind: "key_point",
      heading: "Remember this",
      data: {
        keyPoint: "Compress each question to an idea tag, note each paragraph in your own words, and match tag-to-tag — answers are unordered and single shared words are bait.",
      },
    },
    {
      kind: "next_step",
      heading: "Next step",
      body: "Practise a reading set; write margin notes even when the question type doesn't strictly need them.",
      data: { nextHref: PRACTICE.reading, nextLabel: "Start GT Reading practice" },
    },
  ],
};

const readingShortAnswer: LessonDef = {
  id: "lesson-15",
  title: "Short answer and completion questions",
  slug: "reading-short-answer-questions",
  module: "Reading",
  skill: "reading",
  summary: "Answer inside the word limit with words lifted exactly from the text.",
  difficulty: 1,
  sections: [
    {
      kind: "intro",
      heading: "Why this lesson matters",
      body: "Short-answer and sentence-completion questions are the most mechanical marks in GT Reading — the answer is sitting in the text, unchanged. Candidates lose them anyway: too many words, changed word forms, or copied spelling errors. This lesson makes those losses structurally impossible.",
    },
    {
      kind: "objectives",
      heading: "You will learn",
      data: {
        items: [
          "How word limits work, including the AND/OR A NUMBER clause",
          "Why you must copy words exactly — never rephrase",
          "How grammar in the stem predicts the answer's word class",
        ],
      },
    },
    {
      kind: "explanation",
      heading: "Lift, don't write",
      body: "These questions test location, not composition. The instruction — NO MORE THAN TWO WORDS AND/OR A NUMBER, ONE WORD ONLY — is a hard scoring rule: a three-word answer to a two-word limit scores zero even when the content is right. Hyphenated words count as one; “a” and “the” count as words, and you can almost always drop them. Copy the text's exact form: if the text says “registration”, writing “register” is wrong — you are not being asked to compose. The stem's grammar narrows the search: a gap after “the” needs a noun phrase; after “must” needs a base verb; a question starting “How long…” needs a duration.",
    },
    {
      kind: "gt_relevance",
      heading: "In the GT exam",
      body: "Section 1 leans on these heavily — notices and ads full of concrete details. They should run at under a minute each; the time saved belongs to Section 3. For CLB 9 (Band 7 ≈ 35/40), these near-free marks must convert at 100%.",
    },
    {
      kind: "example",
      heading: "Example: the limit decides the form",
      body: "Instruction: NO MORE THAN TWO WORDS.",
      data: {
        sample: "Q: “What must applicants hold or be willing to obtain?” Text: “…must hold a valid forklift certificate, or be willing to train within the first month.”",
        note: "“Forklift certificate” — two words, lifted exactly. “A valid forklift certificate” is four words and scores zero. Trim articles and adjectives until you're inside the limit while the core noun survives.",
      },
    },
    {
      kind: "example",
      heading: "Example: grammar predicts the answer",
      body: "Completion: “Swimmers under nine must be accompanied by a ____.”",
      data: {
        sample: "Text: “A parent or guardian must stay on site for swimmers under the age of nine.”",
        note: "The gap follows “a”, so a singular noun is required. “Parent or guardian” fits a THREE-word limit; under a ONE-word limit, “parent” or “guardian” alone would be accepted — the limit tells you how much to lift.",
      },
    },
    {
      kind: "mistake",
      heading: "Common mistake",
      body: "Rephrasing to sound natural — writing “certified for forklifts” when the text says “forklift certificate” — or fixing/introducing spelling changes. The marker compares your words with the text's words. Any transformation is risk with zero reward.",
    },
    {
      kind: "strategy",
      heading: "Completion routine",
      data: {
        items: [
          "Circle the word limit before reading a single question",
          "Predict the word class from the stem's grammar (noun / verb / number)",
          "Scan to the sentence, lift the exact words, count them on your fingers",
          "Re-read the completed sentence — it must be grammatical AND inside the limit",
        ],
      },
    },
    {
      kind: "guided_practice",
      heading: "Try it: lift within the limit",
      body: "Apply the routine.",
      data: {
        task: "Instruction: ONE WORD AND/OR A NUMBER. Text: “Shifts run from 4 pm to 8 pm, Monday to Thursday.” Q: “At what time do shifts finish?”",
        modelAnswer: "“8 pm” — one number plus its unit as written. Writing “eight pm” (two words) risks the limit; writing “20:00” changes the text's form. Lift what's printed: 8 pm.",
      },
    },
    {
      kind: "quick_check",
      heading: "Quick check 1",
      body: "Limit: NO MORE THAN TWO WORDS. The text answer is “a valid forklift certificate”. What do you write?",
      data: {
        options: ["a valid forklift certificate", "valid forklift certificate", "forklift certificate"],
        answer: "forklift certificate",
        explanation: "Drop the article and the adjective to reach two words while keeping the core noun phrase. Over-limit answers score zero regardless of accuracy.",
      },
    },
    {
      kind: "quick_check",
      heading: "Quick check 2",
      body: "The text says “registration”. The completed sentence would read more naturally with “registering”. What do you write?",
      data: {
        options: ["registering", "registration", "Either is fine"],
        answer: "registration",
        explanation: "Copy the text's exact form. Completion questions are location tests — changing the word form turns a right answer into a wrong one.",
      },
    },
    {
      kind: "key_point",
      heading: "Remember this",
      data: {
        keyPoint: "Circle the word limit first, lift the text's exact words, count them — never rephrase, never exceed the limit, never change word forms.",
      },
    },
    {
      kind: "next_step",
      heading: "Next step",
      body: "Run a GT reading drill and treat every completion answer as a copy-check exercise.",
      data: { nextHref: PRACTICE.reading, nextLabel: "Start GT Reading practice" },
    },
  ],
};

const readingTime: LessonDef = {
  id: "lesson-16",
  title: "Time management for GT Reading",
  slug: "reading-time-management",
  module: "Reading",
  skill: "reading",
  summary: "Distribute 60 minutes across three sections so Section 3 never sinks your band.",
  difficulty: 2,
  sections: [
    {
      kind: "intro",
      heading: "Why this lesson matters",
      body: "GT Reading's difficulty is uneven by design: Section 1 is quick, Section 3 is slow. Candidates who give each section equal time finish Section 1 with minutes to spare and Section 3 half-done. A deliberate time budget — enforced, not just intended — converts directly into raw marks.",
    },
    {
      kind: "objectives",
      heading: "You will learn",
      data: {
        items: [
          "A section-by-section minute budget that matches GT's difficulty curve",
          "The two-pass method for questions that resist",
          "Why the answer sheet needs its own time slot (there is no transfer time)",
        ],
      },
    },
    {
      kind: "explanation",
      heading: "Budget by difficulty, not by length",
      body: "A working budget: Section 1 ≈ 15 minutes, Section 2 ≈ 18, Section 3 ≈ 25, checking ≈ 2. Within each section run two passes: first pass answers everything that yields within ~60 seconds and marks the rest; second pass returns to marked items with the time saved. The killer discipline is the hard stop — when Section 1's 15 minutes end, you move, even mid-question. One brutal truth drives all of this: every question is worth exactly one mark. The gnarly matching item you wrestled for four minutes pays the same as the scan-and-lift you skipped to fight it.",
    },
    {
      kind: "gt_relevance",
      heading: "In the GT exam",
      body: "Unlike Listening, Reading has no extra transfer time — answers go straight onto the sheet (or screen). GT's conversion is unforgiving at the top: Band 7 needs ~35/40. That means you can only leave about five questions to luck, so unanswered questions are unaffordable — guess everything you skip.",
    },
    {
      kind: "example",
      heading: "Example: the four-minute trap",
      body: "A candidate's post-test review.",
      data: {
        sample: "Q18 (matching): 4 min spent, wrong anyway. Q32–34 (short answer, never reached): 3 easy marks lost. Net cost of ‘not giving up' on Q18: 4 marks.",
        note: "The test punishes stubbornness more than ignorance. A marked-and-returned Q18 might have fallen on the second pass in 40 seconds, after Q32–34 were banked.",
      },
    },
    {
      kind: "example",
      heading: "Example: the two-pass rhythm",
      body: "Section 2, 18 minutes, two texts.",
      data: {
        sample: "Pass 1 (13 min): 11 of 13 questions answered, 2 marked. Pass 2 (5 min): both marked items retried with fresh eyes — one solved, one guessed.",
        note: "Fresh eyes on the second pass genuinely re-solve items: you now know the text's layout, so the search space has shrunk.",
      },
    },
    {
      kind: "mistake",
      heading: "Common mistake",
      body: "Leaving blanks “to come back to” and never coming back — or spending the final minute deciding instead of transferring. There is no negative marking: a blank is a guaranteed zero, a guess is a free lottery ticket. Fill everything, then improve.",
    },
    {
      kind: "strategy",
      heading: "The enforcement kit",
      data: {
        items: [
          "Write your three checkpoint times on the rough sheet before starting (e.g. 15 / 33 / 58)",
          "60-second rule: no first-pass question gets more than a minute",
          "Mark skipped items visibly; guess them the moment a section's time expires",
          "Reserve the last 2 minutes for word-limit and spelling checks only",
        ],
      },
    },
    {
      kind: "guided_practice",
      heading: "Try it: triage a section",
      body: "Make the budget call.",
      data: {
        task: "You're 12 minutes into Section 2's 18. Remaining: one matching set (4 questions, slow) and one TFNG set (5 questions, usually faster for you). Which do you attack first, and what happens at minute 18?",
        modelAnswer: "TFNG first — higher marks-per-minute for your profile banks 5 likely marks. Then start matching, and at minute 18 stop mid-set, guess the rest, and move to Section 3. Five banked + two guessed beats four wrestled + five abandoned.",
      },
    },
    {
      kind: "quick_check",
      heading: "Quick check 1",
      body: "A hard question has taken 90 seconds with no progress. Best move?",
      data: {
        options: ["Push on — you've invested time already", "Mark it, guess if needed, and return on the second pass", "Skip it and leave it blank"],
        answer: "Mark it, guess if needed, and return on the second pass",
        explanation: "Sunk time is not a reason to spend more. Marked questions get solved on pass two surprisingly often — and a guess protects the mark if time runs out.",
      },
    },
    {
      kind: "quick_check",
      heading: "Quick check 2",
      body: "How much extra time does GT Reading give for transferring answers?",
      data: {
        options: ["10 minutes, like Listening", "5 minutes", "None"],
        answer: "None",
        explanation: "Zero transfer time — unlike paper Listening. Answers must land on the sheet as you go, which is why the final 2-minute check is part of the budget.",
      },
    },
    {
      kind: "key_point",
      heading: "Remember this",
      data: {
        keyPoint: "Budget 15/18/25 + 2 check minutes, hard-stop each section, run two passes, and never leave a blank — every question pays the same one mark.",
      },
    },
    {
      kind: "next_step",
      heading: "Next step",
      body: "Do a timed reading drill with checkpoint times written down before you start.",
      data: { nextHref: PRACTICE.reading, nextLabel: "Start timed Reading practice" },
    },
  ],
};

// ---------------------------------------------------------------------------
// Revision habit
// ---------------------------------------------------------------------------

const weeklyReview: LessonDef = {
  id: "lesson-10",
  title: "Weekly review and error repair",
  slug: "weekly-review-and-error-repair",
  module: "Revision",
  skill: "reading",
  summary: "Turn mistakes into a spaced, targeted review queue.",
  difficulty: 1,
  clbFocus: "CLB 7–10",
  moduleType: "shared",
  sections: [
    {
      kind: "intro",
      heading: "Why this lesson matters",
      body: "Practice without review is just measurement — you find out what you got wrong and then keep it. Score movement comes from the loop after the drill: classify the error, fix the cause, and re-test it days later. That loop is what your review queue automates; this lesson teaches you to feed it well.",
    },
    {
      kind: "objectives",
      heading: "You will learn",
      data: {
        items: [
          "The error taxonomy that turns ‘I got it wrong' into ‘here's what to fix'",
          "How spaced retrieval makes fixes permanent",
          "A 20-minute weekly review you can actually sustain",
        ],
      },
    },
    {
      kind: "explanation",
      heading: "Name the error, fix the cause",
      body: "Every wrong answer has a cause with a name: misread the question, fell for a distractor, spelling/format error, word-limit violation, weak paraphrase recognition, wrong tone in a letter, thin support in an essay, or a repeat grammar issue. The name matters because each cause has a different repair — a spelling error needs a dictation habit; a distractor hit needs the wait-for-the-correction rule; thin support needs the ‘one idea, one example' drill. Spacing does the rest: reviewing a fix after 1, 4, then 7+ days interrupts forgetting at exactly the moments it happens, which is why your queue reschedules items you grade as hard and retires ones you grade as easy.",
    },
    {
      kind: "gt_relevance",
      heading: "In the GT exam",
      body: "Band movement between 6.5 and 7.5 is mostly error-pattern removal, not new knowledge. Two repaired patterns — say, TFNG qualifier misses and Part 1 spelling slips — can be worth more than a month of unfocused drilling toward your CLB 9 target.",
    },
    {
      kind: "example",
      heading: "Example: classifying a week",
      body: "One learner's error log, Sunday review.",
      data: {
        sample: "Listening: 4 errors — 3 tagged ‘distractor', 1 ‘spelling'. Reading: 3 errors — all ‘weak paraphrase'. Writing: examiner note — ‘bullet 3 underdeveloped'.",
        note: "The week's diagnosis writes itself: distractor defence in Listening, synonym-set scanning in Reading, bullet-coverage planning in Writing. Three named targets replace ‘study more'.",
      },
    },
    {
      kind: "example",
      heading: "Example: a repair that sticks",
      body: "A repeated spelling loss, repaired with spacing.",
      data: {
        sample: "Day 0: ‘accommodation' misspelled in a drill → saved to queue. Day 1: recalled correctly. Day 4: recalled. Day 8: recalled. Day 20: used correctly in a timed letter.",
        note: "Four retrievals over three weeks, about 90 seconds of total effort. Cramming the same word ten times on day 0 would have cost more and held less.",
      },
    },
    {
      kind: "mistake",
      heading: "Common mistake",
      body: "Reviewing by re-reading — looking over old answers and nodding. Recognition feels like knowledge but doesn't survive exam pressure. Review must be retrieval: cover the answer, produce it from memory, then check. If you didn't generate it, you didn't review it.",
    },
    {
      kind: "strategy",
      heading: "The 20-minute weekly review",
      data: {
        items: [
          "Clear your due review queue first (retrieval, not re-reading)",
          "Tally the week's error log by category — find the top two patterns",
          "Write one repair rule for each pattern in your own words",
          "Schedule next week's first practice block against pattern #1",
        ],
      },
    },
    {
      kind: "guided_practice",
      heading: "Try it: diagnose a log",
      body: "Read the log, name the priority.",
      data: {
        task: "This week's errors: 2× ‘word limit' (reading), 5× ‘fell for distractor' (listening), 1× ‘tone' (writing). What is your top repair target and what is the repair?",
        modelAnswer: "Distractors, 5 hits — the dominant pattern. Repair rule: ‘never write during the first mention; wait for the correction or agreement.' Next week's first listening block drills exactly that, and the two word-limit errors get a circle-the-limit habit check.",
      },
    },
    {
      kind: "quick_check",
      heading: "Quick check 1",
      body: "Which of these is actual review?",
      data: {
        options: ["Re-reading your corrected answers", "Covering the answer and producing it from memory", "Re-watching a strategy lesson"],
        answer: "Covering the answer and producing it from memory",
        explanation: "Only retrieval strengthens recall under pressure. Re-reading and re-watching build familiarity, which evaporates in exam conditions.",
      },
    },
    {
      kind: "quick_check",
      heading: "Quick check 2",
      body: "You grade a queue item “again” (failed to recall). What should happen to it?",
      data: {
        options: ["It comes back sooner", "It comes back later", "It leaves the queue"],
        answer: "It comes back sooner",
        explanation: "Failed retrieval means the memory needs earlier reinforcement — the interval resets short and regrows as you succeed.",
      },
    },
    {
      kind: "key_point",
      heading: "Remember this",
      data: {
        keyPoint: "Name every error (distractor, spelling, paraphrase, tone…), write one repair rule per pattern, and re-test it through the spaced queue — retrieval, never re-reading.",
      },
    },
    {
      kind: "next_step",
      heading: "Next step",
      body: "Open your review queue now and clear what's due — then check your error patterns on the Progress page.",
      data: { nextHref: PRACTICE.review, nextLabel: "Open review queue" },
    },
  ],
};

export const coreLessonDefs: LessonDef[] = [
  overview,
  listeningPrediction,
  listeningDistractors,
  listeningNumbers,
  listeningMcq,
  listeningMaps,
  readingSkimScan,
  readingTfng,
  readingMatching,
  readingShortAnswer,
  readingTime,
  weeklyReview,
];
