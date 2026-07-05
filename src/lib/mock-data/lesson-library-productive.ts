import type { LessonDef } from "./lesson-library-core";

// Original Clearband lessons for productive skills: GT Writing Task 1
// letters, Writing Task 2 essays, and Speaking. Frameworks only — no
// memorisable scripts, per IELTS guidance on plagiarised/rehearsed answers.

const T1 = "/practice/writing/task-1";
const T2 = "/practice/writing/task-2";
const SPK = "/practice/speaking";

// ---------------------------------------------------------------------------
// Writing Task 1 (General Training letters) — 6 lessons
// ---------------------------------------------------------------------------

const letterTone: LessonDef = {
  id: "lesson-2",
  title: "GT letter tone and structure",
  slug: "choosing-the-right-gt-letter-tone",
  module: "Writing Task 1",
  skill: "writing",
  summary: "Match purpose, reader, and tone before you write a word.",
  difficulty: 1,
  sections: [
    {
      kind: "intro",
      heading: "Why this lesson matters",
      body: "GT Task 1 gives you a situation, a reader, and three bullet points — and marks you on whether your letter's tone matches that reader. A perfectly written letter in the wrong register loses Task Achievement marks on line one. Tone is decided before writing, not during.",
    },
    {
      kind: "objectives",
      heading: "You will learn",
      data: {
        items: [
          "The three registers — formal, semi-formal, informal — and the reader test that picks one",
          "Openings, closings, and sign-offs that match each register",
          "A five-line structure that works for every GT letter",
        ],
      },
    },
    {
      kind: "explanation",
      heading: "The reader test",
      body: "Ask one question: do I know this person, and how? A stranger in authority (a manager, a company, a council) → formal: no contractions, no idioms, ‘Dear Sir or Madam' with ‘Yours faithfully', or ‘Dear Mr Chen' with ‘Yours sincerely'. Someone you know in a professional or neighbourly role (a landlord you deal with, a colleague) → semi-formal: ‘Dear Mr Osei', polite but warmer, contractions acceptable. A friend or family member → informal: ‘Dear Sam' or ‘Hi Sam', contractions, natural phrasing, ‘Best wishes'. Structure is constant across all three: greeting → purpose sentence → one short paragraph per bullet → requested action or closing thought → sign-off. Only the language dresses differently.",
    },
    {
      kind: "gt_relevance",
      heading: "In the GT exam",
      body: "Task 1 asks for at least 150 words in about 20 minutes and states the reader explicitly (“write to your manager… / to a friend…”). Tone consistency is scored inside Task Achievement — for CLB 9 you need Writing 7.0, and Band 7 requires a consistent, appropriate tone throughout, not just in the greeting.",
    },
    {
      kind: "example",
      heading: "Example: same request, two registers",
      body: "The request: borrowing a projector.",
      data: {
        sample: "Formal (to a facilities manager): “I am writing to ask whether it would be possible to borrow a projector for our community meeting on 12 May.”\nInformal (to a friend): “Any chance I could borrow your projector for our meeting on the 12th?”",
        note: "Same content, different clothing. Note the formal version's full forms (‘I am writing') and indirect request (‘whether it would be possible').",
      },
    },
    {
      kind: "example",
      heading: "Example: purpose sentence first",
      body: "The examiner should know why you're writing by the end of line one.",
      data: {
        sample: "“I am writing to express my concern about the recent changes to the parking arrangements at Millbrook House.”",
        note: "Purpose named (concern), topic named (parking changes), place named. Everything after this sentence has a job to do; nothing before it was needed.",
      },
    },
    {
      kind: "mistake",
      heading: "Common mistake",
      body: "Register drift: opening with ‘Dear Sir or Madam' and then writing ‘it's been a total nightmare'. Mixed tone reads as lack of control and caps Task Achievement. Choose the register at planning time and audit for drift when checking — contractions in a formal letter are the easiest tell.",
    },
    {
      kind: "strategy",
      heading: "Pre-writing decision (60 seconds)",
      data: {
        items: [
          "Name the reader and your relationship — that fixes the register",
          "Write the purpose sentence mentally before touching the page",
          "Assign one paragraph per bullet point, in the order given",
          "Pick the matching sign-off now: faithfully (unknown name) / sincerely (known name) / best wishes (friend)",
        ],
      },
    },
    {
      kind: "guided_practice",
      heading: "Try it: make the tone call",
      body: "Decide before revealing.",
      data: {
        task: "Prompt: “You recently moved to a new city. Write to the manager of your former apartment building about a package delivered there by mistake.” Register? Greeting? Sign-off? Purpose sentence?",
        modelAnswer: "Semi-formal to formal — a manager you may know slightly: “Dear Mr/Ms [name]” with “Yours sincerely” (or ‘Dear Sir or Madam' + ‘Yours faithfully' if unnamed). Purpose sentence: “I am writing to ask for your help with a package that was delivered to my former address at [building] after I moved out.” Reader, purpose, topic — one line.",
      },
    },
    {
      kind: "quick_check",
      heading: "Quick check 1",
      body: "You open with “Dear Sir or Madam”. Which sign-off is correct?",
      data: {
        options: ["Yours sincerely", "Yours faithfully", "Best wishes"],
        answer: "Yours faithfully",
        explanation: "Unknown name → faithfully; named person → sincerely. Examiners notice this pairing instantly — it's a free accuracy signal.",
      },
    },
    {
      kind: "quick_check",
      heading: "Quick check 2",
      body: "Which sentence belongs in a formal complaint letter?",
      data: {
        options: ["The noise is driving me crazy!", "I would appreciate it if this matter could be resolved promptly.", "You guys need to sort this out."],
        answer: "I would appreciate it if this matter could be resolved promptly.",
        explanation: "Formal register: indirect, polite, no exclamation marks or conversational phrasing — while still requesting clear action.",
      },
    },
    {
      kind: "key_point",
      heading: "Remember this",
      data: {
        keyPoint: "The reader decides the register: stranger/authority → formal, known role → semi-formal, friend → informal — pick it before writing and never drift.",
      },
    },
    {
      kind: "next_step",
      heading: "Next step",
      body: "Write a Task 1 letter and run the reader test before your first sentence.",
      data: { nextHref: T1, nextLabel: "Practise a GT letter" },
    },
  ],
};

const letterBullets: LessonDef = {
  id: "lesson-3",
  title: "Covering all three bullet points",
  slug: "covering-all-three-bullet-points",
  module: "Writing Task 1",
  skill: "writing",
  summary: "Plan a complete response — a missed bullet caps your Task Achievement score.",
  difficulty: 2,
  sections: [
    {
      kind: "intro",
      heading: "Why this lesson matters",
      body: "Every GT Task 1 prompt contains three bullet points, and the instructions are explicit: cover all three. A letter that handles two beautifully and skips the third cannot score well on Task Achievement no matter how elegant the English. Bullet coverage is the most mechanical — and most commonly failed — requirement in GT Writing.",
    },
    {
      kind: "objectives",
      heading: "You will learn",
      data: {
        items: [
          "What ‘covering' a bullet actually requires (development, not mention)",
          "How to expand a thin bullet with the detail ladder",
          "How to balance three bullets inside 150+ words and 20 minutes",
        ],
      },
    },
    {
      kind: "explanation",
      heading: "Mention is not coverage",
      body: "A bullet like “explain what happened” is not covered by “something went wrong with my order.” Coverage means development: 2–3 sentences that give the specifics an examiner can picture — what, when, what effect. The reliable expansion tool is the detail ladder: state the point → add a concrete detail (a date, a name, an amount) → add the consequence or feeling. One rung per sentence, and any bullet reaches proper depth in three sentences. Structure follows naturally: one paragraph per bullet, in the order the prompt gives them, so neither you nor the examiner has to hunt.",
    },
    {
      kind: "gt_relevance",
      heading: "In the GT exam",
      body: "Prompts state the bullets after “In your letter:” — they are the marking checklist made visible. Band 7 Task Achievement requires covering all bullets with each one developed; Band 6 letters typically cover all three but leave one thin. For CLB 9's Writing 7.0, development of the weakest bullet is exactly where the band is won.",
    },
    {
      kind: "example",
      heading: "Example: climbing the detail ladder",
      body: "Bullet: “explain what the problem is” (a faulty appliance).",
      data: {
        sample: "Rung 1: “The washing machine I purchased from your store has stopped working.”\nRung 2: “I bought it on 3 June, and it functioned normally for only two weeks before the drum stopped turning mid-cycle.”\nRung 3: “As a result, I have had to use a laundrette every week, at considerable cost and inconvenience.”",
        note: "Point → specifics (date, symptom) → consequence. Three sentences, one fully developed bullet, ~55 words.",
      },
    },
    {
      kind: "example",
      heading: "Example: the invisible third bullet",
      body: "Prompt bullets: explain the situation / describe the problem / say what you want to happen.",
      data: {
        sample: "A 180-word letter describes the situation and problem vividly… and ends “I hope you understand.” The third bullet — the requested action — never appears.",
        note: "“Say what you want to happen” needs an explicit ask: a refund, a repair, a replacement, a meeting. Hoping is not requesting. This is the most commonly dropped bullet in real scripts.",
      },
    },
    {
      kind: "mistake",
      heading: "Common mistake",
      body: "Spending 100 words on bullet one because it's easiest, then compressing bullets two and three into a sentence each. Uneven coverage reads as incomplete. Aim for rough balance — roughly a third of your body text per bullet — and let bullet order match prompt order.",
    },
    {
      kind: "strategy",
      heading: "The 3×3 plan",
      data: {
        items: [
          "Before writing, jot each bullet as a 3–4 word note in the margin",
          "Under each, note one concrete detail you will invent (date, amount, name)",
          "Draft one paragraph per bullet — three sentences each via the detail ladder",
          "Final check: point to the sentence that answers each bullet; if you can't point, it isn't there",
        ],
      },
    },
    {
      kind: "guided_practice",
      heading: "Try it: develop the weak bullet",
      body: "Expand before revealing.",
      data: {
        task: "Bullet: “suggest a solution” (context: your neighbour's dog barks at night). Write 2–3 sentences that fully develop it — with at least one concrete detail.",
        modelAnswer: "One workable shape: “Perhaps the simplest solution would be to keep Bruno indoors after 10 pm, when the barking is most disruptive. Alternatively, I would be happy to recommend the trainer who helped with our own dog last year. Either option would, I believe, resolve the problem without further inconvenience to you.” — suggestion + concrete alternative + cooperative close. (Yours should differ — the shape matters, not these sentences.)",
      },
    },
    {
      kind: "quick_check",
      heading: "Quick check 1",
      body: "A letter mentions all three bullets but develops only two. What happens to the score?",
      data: {
        options: ["Nothing, all bullets were mentioned", "Task Achievement is limited by the undeveloped bullet", "Only word count matters"],
        answer: "Task Achievement is limited by the undeveloped bullet",
        explanation: "Band descriptors distinguish covering from developing. A mentioned-but-thin bullet reads as partially addressed and caps the criterion.",
      },
    },
    {
      kind: "quick_check",
      heading: "Quick check 2",
      body: "Which detail best develops “describe the item you lost”?",
      data: {
        options: ["I lost a bag.", "I lost a bag with things in it.", "I lost a navy laptop bag with my work ID and a set of house keys inside."],
        answer: "I lost a navy laptop bag with my work ID and a set of house keys inside.",
        explanation: "Concrete, picturable specifics (colour, type, contents) are what development means. Invented details are expected — this is a writing test, not a truth test.",
      },
    },
    {
      kind: "key_point",
      heading: "Remember this",
      data: {
        keyPoint: "One paragraph per bullet, three sentences per paragraph (point → detail → consequence) — and check you can physically point to each bullet's answer before finishing.",
      },
    },
    {
      kind: "next_step",
      heading: "Next step",
      body: "Write a Task 1 letter using the 3×3 plan and margin notes.",
      data: { nextHref: T1, nextLabel: "Practise a GT letter" },
    },
  ],
};

const letterComplaint: LessonDef = {
  id: "lesson-17",
  title: "Formal complaint letters",
  slug: "writing-formal-complaint-letters",
  module: "Writing Task 1",
  skill: "writing",
  summary: "Complain firmly and politely — with facts, impact, and a clear requested remedy.",
  difficulty: 2,
  sections: [
    {
      kind: "intro",
      heading: "Why this lesson matters",
      body: "The complaint is the most frequently set GT letter type — faulty products, poor service, noisy works, billing errors. It is also a register trap: real-life complaining is emotional, but a Band 7+ complaint is factual, controlled, and solution-focused. The examiner is scoring your restraint as much as your grammar.",
    },
    {
      kind: "objectives",
      heading: "You will learn",
      data: {
        items: [
          "The firm-but-polite register that scores in complaints",
          "The complaint arc: facts → impact → remedy",
          "Softening and escalating phrases and when to use each",
        ],
      },
    },
    {
      kind: "explanation",
      heading: "Facts, impact, remedy",
      body: "A high-scoring complaint runs on three engines. Facts: what happened, with verifiable specifics — dates, order numbers, what was promised versus delivered. Impact: what the failure cost you — time, money, inconvenience — stated once, without melodrama. Remedy: exactly what you want — refund, replacement, repair, apology — with a reasonable timeframe. The register stays formal throughout: disappointment, not anger (“I was disappointed to find…”, “Unfortunately, the issue remains unresolved”). Firmness comes from precision and a clear ask, not from strong adjectives. An escalation sentence (“If the matter cannot be resolved, I will have no option but to…”) is optional and belongs only at the end, in neutral wording.",
    },
    {
      kind: "gt_relevance",
      heading: "In the GT exam",
      body: "Complaint prompts almost always bullet the same arc: explain the situation / describe the problem (or its effects) / say what action you expect. Your paragraph plan is therefore given to you. Tone control under irritation is precisely what Band 7 ‘consistent and appropriate tone' measures.",
    },
    {
      kind: "example",
      heading: "Example: emotional vs effective",
      body: "Same fact, two versions.",
      data: {
        sample: "Weak: “Your delivery service is absolutely terrible and I'm furious about the way I've been treated!!”\nStrong: “This is the second delivery that has arrived more than a week late, despite two written assurances that the problem had been addressed.”",
        note: "The strong version has no emotion words at all — its force comes from ‘second', ‘more than a week', and ‘two written assurances'. Documented patterns beat adjectives.",
      },
    },
    {
      kind: "example",
      heading: "Example: the remedy paragraph",
      body: "The ask, stated like an expectation.",
      data: {
        sample: "“I would therefore ask that you either replace the machine or refund the purchase price of $649 in full. I would appreciate a response within fourteen days.”",
        note: "Two acceptable outcomes, an exact figure, a deadline — all delivered in requesting (not demanding) grammar: ‘I would ask that', ‘I would appreciate'.",
      },
    },
    {
      kind: "mistake",
      heading: "Common mistake",
      body: "Complaining without asking. Letters that catalogue failures and end with “I hope you will do better in future” leave the remedy bullet uncovered and the letter purposeless. Every complaint ends with a specific, reasonable, time-bound request.",
    },
    {
      kind: "strategy",
      heading: "Complaint framework",
      data: {
        items: [
          "Open: purpose sentence naming the product/service and the word ‘complaint' or ‘dissatisfaction'",
          "Paragraph 1 — facts: dates, references, promised vs delivered",
          "Paragraph 2 — impact: one honest paragraph on cost/inconvenience, zero exclamation marks",
          "Paragraph 3 — remedy: the specific ask + timeframe (+ neutral escalation if warranted)",
        ],
      },
    },
    {
      kind: "guided_practice",
      heading: "Try it: de-escalate the draft",
      body: "Rewrite for register before revealing.",
      data: {
        task: "Rewrite formally, keeping the force: “I can't believe you charged me twice for the same gym membership. This is robbery. Fix it now.”",
        modelAnswer: "One workable version: “I was concerned to see that my account was charged twice for the same monthly membership on 4 April. I would ask that the duplicate charge of $59 be refunded within seven days, and that you confirm my payment details have been corrected.” — the anger is gone; the dates, amount, and deadline do the work.",
      },
    },
    {
      kind: "quick_check",
      heading: "Quick check 1",
      body: "What gives a formal complaint its force?",
      data: {
        options: ["Strong adjectives and exclamation marks", "Specific facts, documented patterns, and a clear ask", "Threatening legal action early"],
        answer: "Specific facts, documented patterns, and a clear ask",
        explanation: "Precision reads as credibility; emotion reads as loss of control. Escalation, if used at all, comes last and stays neutral.",
      },
    },
    {
      kind: "quick_check",
      heading: "Quick check 2",
      body: "Which is the best closing request?",
      data: {
        options: ["I hope things improve.", "Please do something about this.", "I would ask for a full refund of $120 and a response within ten days."],
        answer: "I would ask for a full refund of $120 and a response within ten days.",
        explanation: "Specific remedy + amount + timeframe covers the action bullet completely and ends the letter with purpose.",
      },
    },
    {
      kind: "key_point",
      heading: "Remember this",
      data: {
        keyPoint: "Complain with facts → impact → remedy: precise details and a time-bound specific request, in disappointed-not-angry register, zero exclamation marks.",
      },
    },
    {
      kind: "next_step",
      heading: "Next step",
      body: "Write a complaint letter and audit it afterwards: count the facts, find the ask.",
      data: { nextHref: T1, nextLabel: "Practise a complaint letter" },
    },
  ],
};

const letterRequest: LessonDef = {
  id: "lesson-18",
  title: "Request and enquiry letters",
  slug: "writing-request-letters",
  module: "Writing Task 1",
  skill: "writing",
  summary: "Ask for information, permission, or help with the right level of indirectness.",
  difficulty: 2,
  sections: [
    {
      kind: "intro",
      heading: "Why this lesson matters",
      body: "Request letters — asking for information, permission, time off, a favour, or arrangements — test one skill above all: polite indirectness. English encodes politeness in grammar (“I was wondering if…”, “Would it be possible to…”), and the examiner is listening for whether you can tune that grammar to the size of the favour and the status of the reader.",
    },
    {
      kind: "objectives",
      heading: "You will learn",
      data: {
        items: [
          "The politeness ladder: how request grammar scales with imposition",
          "How to justify a request so the reader wants to say yes",
          "Enquiry structure: context → specific questions → appreciation",
        ],
      },
    },
    {
      kind: "explanation",
      heading: "The politeness ladder",
      body: "Requests scale. Small ask, equal footing: “Could you send me the schedule?” Medium ask, professional distance: “Would it be possible to move my appointment to a later date?” Large ask, or reader in authority: “I would be most grateful if you could consider allowing me to take unpaid leave from…” The bigger the imposition, the longer and more conditional the grammar — that length is politeness. Two more engines make requests succeed: a reason (readers grant justified requests: ‘because my visa appointment falls on that day') and precision (a specific, answerable ask: dates, amounts, quantities — vague requests get vague answers, and examiners score the vagueness).",
    },
    {
      kind: "gt_relevance",
      heading: "In the GT exam",
      body: "Request/enquiry prompts typically bullet: explain your situation / say what you need / explain why (or when). The situations are everyday Canadian-life adjacent — courses, facilities, employers, landlords — exactly the paraphrase world of GT. Lexical Resource rewards varied request forms; three sentences all starting “Can you” caps it quickly.",
    },
    {
      kind: "example",
      heading: "Example: scaling the same request",
      body: "Asking to change a work shift.",
      data: {
        sample: "To a colleague (informal): “Any chance you could swap shifts with me next Friday?”\nTo a manager (formal): “I am writing to ask whether it would be possible to exchange my Friday shift with a colleague, as I have a medical appointment that afternoon.”",
        note: "Same favour, two rungs of the ladder. The formal version adds the reason in the same sentence — request plus justification is the strongest single move in this letter type.",
      },
    },
    {
      kind: "example",
      heading: "Example: the enquiry list",
      body: "Asking a college about an evening course.",
      data: {
        sample: "“I would be grateful if you could confirm three things: whether places remain for the September intake; the total cost, including any registration fee; and whether the course requires previous experience.”",
        note: "Numbered or listed questions are reader-friendly and prove range: one polite frame, three precise asks. This pattern fills the ‘what you need' bullet completely.",
      },
    },
    {
      kind: "mistake",
      heading: "Common mistake",
      body: "Over-apologising instead of asking: “I am so sorry to disturb you, I know you are very busy, I hate to ask…” — three sentences of throat-clearing and still no request. One softener is polite; three is filler that costs words the bullets need. Make the ask by the second paragraph at the latest.",
    },
    {
      kind: "strategy",
      heading: "Request framework",
      data: {
        items: [
          "Open: purpose sentence naming the request category (“I am writing to request/enquire about…”)",
          "Paragraph 1 — context: the situation that makes the request necessary",
          "Paragraph 2 — the ask: specific, scaled to the reader, with the reason attached",
          "Close: appreciation + practical next step (“I would be grateful for a reply by…”)",
        ],
      },
    },
    {
      kind: "guided_practice",
      heading: "Try it: climb the ladder",
      body: "Tune the register before revealing.",
      data: {
        task: "Write the ask sentence: you need your landlord's permission to repaint the living room. (Semi-formal, medium imposition, include the reason.)",
        modelAnswer: "One workable version: “I was wondering whether you would have any objection to my repainting the living room in a neutral colour, as the current paintwork has faded noticeably since I moved in. I would of course cover the cost myself.” — conditional frame, reason attached, objection pre-empted. (The pre-empt is a bonus move that often lifts requests to Band 7+.)",
      },
    },
    {
      kind: "quick_check",
      heading: "Quick check 1",
      body: "Which request form suits a large favour from someone in authority?",
      data: {
        options: ["Send me the form.", "Can you send me the form?", "I would be most grateful if you could send me the form before Friday."],
        answer: "I would be most grateful if you could send me the form before Friday.",
        explanation: "Big ask or high-status reader → longer, more conditional grammar. The deadline keeps it precise without losing politeness.",
      },
    },
    {
      kind: "quick_check",
      heading: "Quick check 2",
      body: "What makes a request most likely to succeed (and score)?",
      data: {
        options: ["Multiple apologies before asking", "A specific ask with the reason attached", "Keeping the request vague so it's easy to grant"],
        answer: "A specific ask with the reason attached",
        explanation: "Reason + precision covers the bullets and demonstrates control. Vagueness and over-apology both read as under-developed content.",
      },
    },
    {
      kind: "key_point",
      heading: "Remember this",
      data: {
        keyPoint: "Scale request grammar to the size of the ask and the status of the reader, attach the reason in the same sentence, and make every ask specific and answerable.",
      },
    },
    {
      kind: "next_step",
      heading: "Next step",
      body: "Write a request letter and check: is the ask specific, justified, and on the right rung of the ladder?",
      data: { nextHref: T1, nextLabel: "Practise a request letter" },
    },
  ],
};

const letterApology: LessonDef = {
  id: "lesson-19",
  title: "Apology and explanation letters",
  slug: "writing-apology-letters",
  module: "Writing Task 1",
  skill: "writing",
  summary: "Apologise credibly: own it, explain without excusing, and repair the damage.",
  difficulty: 2,
  sections: [
    {
      kind: "intro",
      heading: "Why this lesson matters",
      body: "Apology prompts — missing an event, damaging something borrowed, cancelling plans, a mistake at work — test whether you can manage a delicate speech act in writing. The trap is structural: an apology that is mostly excuses reads as insincere, and one that grovels without offering repair leaves a bullet uncovered.",
    },
    {
      kind: "objectives",
      heading: "You will learn",
      data: {
        items: [
          "The apology arc: own → explain → repair",
          "The line between explaining and excusing",
          "Register control for apologies to friends versus authorities",
        ],
      },
    },
    {
      kind: "explanation",
      heading: "Own, explain, repair",
      body: "Credible apologies have a fixed order. Own it first: a direct apology naming the offence — “I am sorry that I missed your presentation on Friday” — before any explanation. Explain second, briefly: one or two sentences of what happened, framed as context, not defence; the tell is grammar — “because the train was cancelled” explains, “it wasn't my fault the train was cancelled” excuses. Repair third, concretely: what you will do — replace the item, rearrange the visit, cover the cost, make sure it cannot recur. Register follows the reader as always: to a friend, warmth and contractions (“I feel terrible about…”); to a manager or organisation, formal ownership (“I take full responsibility for the oversight”).",
    },
    {
      kind: "gt_relevance",
      heading: "In the GT exam",
      body: "Apology bullets map straight onto the arc: apologise / explain what happened / say what you will do. That makes paragraph planning trivial — but examiners specifically watch the middle bullet for excuse-drift and the third for vagueness. Both are tone-and-development issues that separate Band 6 from Band 7.",
    },
    {
      kind: "example",
      heading: "Example: explaining vs excusing",
      body: "Same event, two middles.",
      data: {
        sample: "Excusing: “It's really not my fault — nobody told me the meeting had been moved, and anyway the calendar invite was confusing.”\nExplaining: “The meeting time changed after I had left for a site visit, and I did not see the update until that evening.”",
        note: "The explaining version has no blame-shifting and no ‘anyway'. It gives the reader the facts and returns responsibility to the writer.",
      },
    },
    {
      kind: "example",
      heading: "Example: the repair paragraph",
      body: "Damage to a borrowed item.",
      data: {
        sample: "“I have already ordered an identical replacement lens, which should arrive by Thursday, and I will bring it over as soon as it does. If you would rather choose the replacement yourself, I will of course cover the cost.”",
        note: "Action already taken + timeline + reader's choice respected. Repair paragraphs score when they are concrete and immediate, not hypothetical (“I could maybe replace it sometime”).",
      },
    },
    {
      kind: "mistake",
      heading: "Common mistake",
      body: "Apologising twice and repairing never. Scripts often loop — sorry in paragraph one, sorry again in paragraph three — while the ‘what you will do' bullet gets one vague clause. One sincere apology is enough; spend the recovered words on a concrete repair.",
    },
    {
      kind: "strategy",
      heading: "Apology framework",
      data: {
        items: [
          "Open: direct apology naming the specific offence — no throat-clearing",
          "Paragraph 2 — explain: 1–2 sentences of context, zero blame-shifting language",
          "Paragraph 3 — repair: concrete action, timeline, and (where fitting) prevention",
          "Close: brief forward-looking line (“I hope this goes some way to making up for…”), matching register",
        ],
      },
    },
    {
      kind: "guided_practice",
      heading: "Try it: fix the middle",
      body: "Convert excuse to explanation before revealing.",
      data: {
        task: "Rewrite as explanation (to a friend whose party you missed): “It's not my fault — my shift ran over because my useless manager can't schedule properly.”",
        modelAnswer: "One workable version: “My shift ran two hours over at the last minute, and by the time I finished, the party was nearly ending.” — the facts survive, the blame disappears, and it stays informal for a friend. Follow it with the repair: “Let me take you out for dinner this week to celebrate properly.”",
      },
    },
    {
      kind: "quick_check",
      heading: "Quick check 1",
      body: "What is the correct order for an apology letter?",
      data: {
        options: ["Explain → apologise → repair", "Apologise → explain → repair", "Repair → explain → apologise"],
        answer: "Apologise → explain → repair",
        explanation: "Ownership comes first — an explanation that arrives before the apology reads as a defence, whatever its content.",
      },
    },
    {
      kind: "quick_check",
      heading: "Quick check 2",
      body: "Which sentence is explanation, not excuse?",
      data: {
        options: ["Anyone would have made the same mistake.", "The address on the booking form was out of date, which I did not notice until I arrived.", "It's the courier's fault, not mine."],
        answer: "The address on the booking form was out of date, which I did not notice until I arrived.",
        explanation: "Facts plus continued ownership (“which I did not notice”) — no blame-shifting, no minimising. That's the register examiners reward.",
      },
    },
    {
      kind: "key_point",
      heading: "Remember this",
      data: {
        keyPoint: "Apologise once and directly, explain without excusing (facts, no blame-shift), then repair concretely with an action and a timeline.",
      },
    },
    {
      kind: "next_step",
      heading: "Next step",
      body: "Write an apology letter and underline your repair sentence — if you can't find it, neither can the examiner.",
      data: { nextHref: T1, nextLabel: "Practise an apology letter" },
    },
  ],
};

const letterInformal: LessonDef = {
  id: "lesson-20",
  title: "Informal letters that still score",
  slug: "writing-informal-letters",
  module: "Writing Task 1",
  skill: "writing",
  summary: "Write to a friend naturally — while still covering bullets and showing range.",
  difficulty: 2,
  sections: [
    {
      kind: "intro",
      heading: "Why this lesson matters",
      body: "Informal prompts feel easy — “write to a friend” — and that is exactly the danger. Candidates relax, chat, drift off the bullets, and produce warm letters that score Band 6. Informal register changes the clothing, not the job: three developed bullets, clear organisation, and enough lexical range to prove you have it.",
    },
    {
      kind: "objectives",
      heading: "You will learn",
      data: {
        items: [
          "What informal register actually licenses (and what it doesn't)",
          "Natural informal equivalents for formal letter machinery",
          "How to show Band 7 range inside casual language",
        ],
      },
    },
    {
      kind: "explanation",
      heading: "Casual clothing, same skeleton",
      body: "Informal register licenses contractions (I'm, can't), phrasal verbs (put up with, sort out), everyday idiom in moderation (a real pain, over the moon), direct questions, and exclamations used sparingly. It does not license abandoning structure: you still need a greeting (“Hi Marta,”), a reason-for-writing line (“Just wanted to let you know…”), one paragraph per bullet, and a warm sign-off (“Best wishes,” “Take care,”). Range still matters — Band 7 informal writing uses precise, natural vocabulary (“the flat's a bit cramped but the light is amazing”) rather than flat all-purpose words (“the flat is nice, it is good”). Think: how would an articulate friend actually write?",
    },
    {
      kind: "gt_relevance",
      heading: "In the GT exam",
      body: "Informal prompts cover invitations, news, advice, thanks, and arrangements. The examiner checks tone consistency against the stated reader — ‘Dear Sir' to your best friend is as wrong as slang to a council. Roughly a third of GT Task 1 prompts are informal, so this register is not optional to master.",
    },
    {
      kind: "example",
      heading: "Example: formal machinery, informal equivalents",
      body: "The same moves, translated.",
      data: {
        sample: "“I am writing to inform you that…” → “Just a quick note to say…”\n“I would be grateful if you could…” → “Could you do me a favour and…?”\n“Please do not hesitate to contact me.” → “Give me a shout if you need anything.”",
        note: "Every formal move has a natural casual twin. Using the formal version in an informal letter is a register error, not extra credit.",
      },
    },
    {
      kind: "example",
      heading: "Example: developed but casual",
      body: "Bullet: “describe your new home” — with range.",
      data: {
        sample: "“We've finally unpacked! The house is a 1950s bungalow — small kitchen, huge garden, and a mysterious cupboard under the stairs that the kids have already claimed. The neighbourhood's quieter than downtown, though I do miss being able to walk to a decent coffee.”",
        note: "Contractions, dashes, humour — and underneath: specific nouns, a contrast structure, and a concession clause (“though I do miss…”). That's Band 7 grammar wearing weekend clothes.",
      },
    },
    {
      kind: "mistake",
      heading: "Common mistake",
      body: "Confusing informal with careless: no paragraphs, chat filler (“So yeah, anyway…”), text-speak (u, gonna, lol), and bullets half-remembered. Informal letters are still assessed on Task Achievement, Coherence, Lexical Resource, and Grammar — all four criteria, full strength.",
    },
    {
      kind: "strategy",
      heading: "Informal letter framework",
      data: {
        items: [
          "Greeting + one-line opener that names why you're writing",
          "One paragraph per bullet — the detail ladder works casually too (“you won't believe what happened — Tuesday, mid-shift…”)",
          "Sprinkle, don't pour: 2–3 idiomatic touches and a couple of phrasal verbs, not slang throughout",
          "Warm close + sign-off that matches (“Can't wait to see you — Love, / Take care,”)",
        ],
      },
    },
    {
      kind: "guided_practice",
      heading: "Try it: translate the register",
      body: "Make it sound like a friend before revealing.",
      data: {
        task: "Rewrite informally (inviting a friend to stay): “I am writing to invite you to visit my new residence at your earliest convenience. Accommodation will be provided.”",
        modelAnswer: "One workable version: “You have to come and see the new place! The spare room's all set up, so just pick a weekend — honestly, any time works. It'd be so good to catch up properly.” — invitation, logistics, warmth: the same content, zero formal machinery.",
      },
    },
    {
      kind: "quick_check",
      heading: "Quick check 1",
      body: "Which is appropriate in an informal letter to a close friend?",
      data: {
        options: ["Dear Sir or Madam", "Yours faithfully", "Give me a shout when you're free"],
        answer: "Give me a shout when you're free",
        explanation: "Natural idiom fits the register. The formal openings/closings would be tone errors against a stated friend reader.",
      },
    },
    {
      kind: "quick_check",
      heading: "Quick check 2",
      body: "Do the three bullet points still need full development in an informal letter?",
      data: {
        options: ["No — informal letters are marked on friendliness", "Yes — same criteria, same coverage rules", "Only two of the three"],
        answer: "Yes — same criteria, same coverage rules",
        explanation: "Register changes the language, never the task. All bullets, developed, organised — in casual clothing.",
      },
    },
    {
      kind: "key_point",
      heading: "Remember this",
      data: {
        keyPoint: "Informal = casual language on the same skeleton: all three bullets developed, clear paragraphs, natural idiom in moderation — never text-speak, never chat drift.",
      },
    },
    {
      kind: "next_step",
      heading: "Next step",
      body: "Write an informal letter and audit it against all four criteria — friendliness is not one of them.",
      data: { nextHref: T1, nextLabel: "Practise an informal letter" },
    },
  ],
};

// ---------------------------------------------------------------------------
// Writing Task 2 — 5 lessons
// ---------------------------------------------------------------------------

const essayOpinion: LessonDef = {
  id: "lesson-4",
  title: "Opinion essays: position and paragraph control",
  slug: "task-2-position-and-paragraph-control",
  module: "Writing Task 2",
  skill: "writing",
  summary: "State a clear opinion and defend it with two developed body paragraphs.",
  difficulty: 2,
  sections: [
    {
      kind: "intro",
      heading: "Why this lesson matters",
      body: "Task 2 counts double in your Writing score, and opinion prompts (“To what extent do you agree or disagree?”) are the most common Task 2 type. The single biggest discriminator between Band 6 and Band 7 is positional clarity: does the examiner know your view from the introduction, and does every paragraph serve it?",
    },
    {
      kind: "objectives",
      heading: "You will learn",
      data: {
        items: [
          "How to state a position that survives the whole essay",
          "The one-idea-per-paragraph rule and how to develop it",
          "Where a concession belongs — and how to keep it from blurring your view",
        ],
      },
    },
    {
      kind: "explanation",
      heading: "Position first, everything follows",
      body: "Your introduction does two jobs in 2–3 sentences: paraphrase the question, then answer it. Not “this essay will discuss both sides” — an actual answer: “I largely agree, primarily because…”. Then each body paragraph runs one idea through four moves: topic sentence (the claim) → explanation (why it's true) → example (a concrete case) → link back to the position. Two developed paragraphs beat four thin ones at every band. Concession is a Band 7+ move when controlled: acknowledge the other side in one sentence, then immediately bound it (“While remote work can weaken team cohesion, this drawback is manageable and modest beside its benefits”) — the sentence ends on your side of the argument.",
    },
    {
      kind: "gt_relevance",
      heading: "In the GT exam",
      body: "GT Task 2 topics are practical and social — work, housing, community, technology in daily life — not abstract academia. You need 250+ words in about 40 minutes. For CLB 9's Writing 7.0, the descriptors ask for a clear position throughout and fully developed main ideas: exactly this lesson's two skills.",
    },
    {
      kind: "example",
      heading: "Example: vague vs clear position",
      body: "Prompt: “Employers should allow all staff to work from home. To what extent do you agree?”",
      data: {
        sample: "Vague: “Working from home has advantages and disadvantages, which this essay will discuss.”\nClear: “I largely agree: while some roles genuinely require presence, most office work can be done remotely with no loss of quality, and the flexibility benefits both staff and employers.”",
        note: "The clear version answers the question, previews both body paragraphs, and even plants its concession — in one sentence.",
      },
    },
    {
      kind: "example",
      heading: "Example: the four-move paragraph",
      body: "One idea, fully developed.",
      data: {
        sample: "Claim: “Remote work widens the talent pool available to employers.” → Explain: “Companies are no longer limited to candidates within commuting distance.” → Example: “A Halifax firm can now hire a specialist in Winnipeg without relocation costs.” → Link: “This access to skills is a competitive advantage that offices alone cannot offer.”",
        note: "Four sentences, ~65 words, one idea deepened — not four ideas mentioned. Two of these paragraphs form a complete Band 7 body.",
      },
    },
    {
      kind: "mistake",
      heading: "Common mistake",
      body: "The invisible flip: agreeing in the introduction, spending body paragraph two entirely on the opposing view, and ending “so there are good points on both sides.” Position must survive every paragraph. If a paragraph doesn't serve your stated view — directly or as a bounded concession — it's working for the other side.",
    },
    {
      kind: "strategy",
      heading: "Opinion essay frame (40 minutes)",
      data: {
        items: [
          "5 min plan: position + two body ideas + one example each",
          "Intro: paraphrase + direct answer (“I largely agree because A and B”)",
          "Body ×2: claim → explain → example → link (add a bounded concession in one of them)",
          "Conclusion: restate position + the strongest reason; no new ideas. 3 min check for word count and agreement errors",
        ],
      },
    },
    {
      kind: "guided_practice",
      heading: "Try it: write the position sentence",
      body: "Answer, don't announce.",
      data: {
        task: "Prompt: “Some people believe cities should charge drivers a fee to enter the city centre. To what extent do you agree or disagree?” Write only the position sentence of the introduction.",
        modelAnswer: "One workable version: “I strongly support such charges: they demonstrably reduce congestion and pollution, and the revenue can fund the public transport that gives drivers a real alternative.” — a graded stance (‘strongly'), two reasons that become the two body paragraphs. (Disagreeing just as clearly would score just as well.)",
      },
    },
    {
      kind: "quick_check",
      heading: "Quick check 1",
      body: "Where should your opinion first appear?",
      data: {
        options: ["In the conclusion, after weighing both sides", "In the introduction", "Implied throughout, never stated"],
        answer: "In the introduction",
        explanation: "Opinion prompts ask for your view; the examiner should never have to hunt for it. State it early, keep it consistent, restate it at the end.",
      },
    },
    {
      kind: "quick_check",
      heading: "Quick check 2",
      body: "A body paragraph contains four different supporting ideas, one sentence each. What's the problem?",
      data: {
        options: ["Nothing — more ideas show more knowledge", "None of the ideas is developed, which caps Task Response", "The paragraph is too short"],
        answer: "None of the ideas is developed, which caps Task Response",
        explanation: "Band 7 requires extended, supported ideas. One idea per paragraph through claim → explain → example → link beats an idea list every time.",
      },
    },
    {
      kind: "key_point",
      heading: "Remember this",
      data: {
        keyPoint: "Answer the question in the introduction, run one idea per paragraph (claim → explain → example → link), and make any concession end on your side of the argument.",
      },
    },
    {
      kind: "next_step",
      heading: "Next step",
      body: "Write an opinion essay with a 5-minute written plan — position and two ideas before any prose.",
      data: { nextHref: T2, nextLabel: "Practise an opinion essay" },
    },
  ],
};

const essayDiscussion: LessonDef = {
  id: "lesson-21",
  title: "Discussion essays: both views, then yours",
  slug: "task-2-discussion-essays",
  module: "Writing Task 2",
  skill: "writing",
  summary: "Handle ‘discuss both views and give your opinion' without losing your own voice.",
  difficulty: 3,
  sections: [
    {
      kind: "intro",
      heading: "Why this lesson matters",
      body: "Discussion prompts (“Discuss both views and give your own opinion”) contain three tasks in one sentence — view A, view B, and your verdict — and dropping any one caps Task Response. The structural discipline this type demands is exactly why examiners set it: fairness to a view you reject is an advanced skill.",
    },
    {
      kind: "objectives",
      heading: "You will learn",
      data: {
        items: [
          "The two structures that work — and which one is safer under time pressure",
          "How to present a view you disagree with credibly (steel, not straw)",
          "How to keep your own opinion visible without hijacking the discussion",
        ],
      },
    },
    {
      kind: "explanation",
      heading: "Discuss fairly, judge clearly",
      body: "Safest structure: intro (paraphrase + brief signal of your lean) → body 1: view A, developed as its best advocates would argue it → body 2: view B, equally developed → conclusion: your reasoned verdict and why. Discussing a view is not endorsing it — attribution language does the separation: “Supporters argue…”, “From this perspective…”, “Those in favour point to…”. Your verdict then earns its keep by giving a criterion, not a coin flip: “Both concerns are legitimate, but the second matters more because it affects people with the fewest alternatives.” Straw-manning view A (“some people wrongly think…”) reads as bias and weakens the essay's Task Response, not just its manners.",
    },
    {
      kind: "gt_relevance",
      heading: "In the GT exam",
      body: "GT discussion topics are everyday policy: apartment living vs houses, cash vs card, local shops vs supermarkets, trades vs university. The both-views structure also directly trains Speaking Part 3, where comparing perspectives aloud is the main event.",
    },
    {
      kind: "example",
      heading: "Example: attribution keeps you neutral",
      body: "Presenting a view you'll ultimately reject.",
      data: {
        sample: "“Those who favour university argue that graduates enjoy broader career options over a lifetime, and that the analytical skills degrees develop transfer across industries. There is force in this: employment data in most countries does show a graduate earnings premium.”",
        note: "The writer disagrees — but you can't tell yet. ‘There is force in this' + real evidence is what fair discussion looks like; the verdict comes later, with reasons.",
      },
    },
    {
      kind: "example",
      heading: "Example: a verdict with a criterion",
      body: "Conclusion that judges rather than shrugs.",
      data: {
        sample: "“Both paths can lead to secure work; the difference is risk. Trades offer faster, cheaper entry into reliable employment, while degrees pay off more slowly and less predictably. For most school leavers without a specific professional goal, I believe the trades route is now the sounder choice.”",
        note: "The criterion (risk) does the deciding. “Both sides have merit, it depends on the person” is a shrug — it answers nothing and costs Task Response.",
      },
    },
    {
      kind: "mistake",
      heading: "Common mistake",
      body: "The 90/10 essay: view A gets a rich paragraph, view B gets two grudging sentences, and the ‘discussion' was never real. Balance is structural — comparable length, comparable quality of argument for both views. The place where you're allowed to be unbalanced is the conclusion.",
    },
    {
      kind: "strategy",
      heading: "Discussion frame (40 minutes)",
      data: {
        items: [
          "Plan: strongest honest argument + example for EACH view, then your verdict criterion",
          "Intro: paraphrase both views; signal your lean in half a sentence (optional but tidy)",
          "Body 1 / Body 2: one view each, attributed, developed to equal depth",
          "Conclusion: verdict + criterion. Check: could a reader summarise both views fairly from your essay alone?",
        ],
      },
    },
    {
      kind: "guided_practice",
      heading: "Try it: steel-man the other side",
      body: "Argue the view you hold less.",
      data: {
        task: "Topic: “Some believe children should have daily homework; others think it should be banned in primary school.” Whichever side you lean toward — write 2 sentences presenting the OTHER side at its strongest, with attribution.",
        modelAnswer: "If you lean pro-homework, a steel-manned ban side: “Opponents of primary homework argue that young children learn chiefly through play, rest, and family time, all of which evening worksheets displace. They also note that homework at this age mainly measures parental availability, widening gaps between households.” — attributed, specific, genuinely persuasive. That's the standard both paragraphs must meet.",
      },
    },
    {
      kind: "quick_check",
      heading: "Quick check 1",
      body: "In a discussion essay, where is your opinion required?",
      data: {
        options: ["Nowhere — discussion means staying neutral", "It must appear (the prompt says ‘give your own opinion'), typically flagged in the intro and delivered in the conclusion", "Only in body paragraph one"],
        answer: "It must appear (the prompt says ‘give your own opinion'), typically flagged in the intro and delivered in the conclusion",
        explanation: "Omitting your view fails a third of the task. Discuss fairly in the bodies; judge clearly at the end.",
      },
    },
    {
      kind: "quick_check",
      heading: "Quick check 2",
      body: "Which phrase correctly presents a view without endorsing it?",
      data: {
        options: ["It is obvious that…", "Supporters of this approach argue that…", "Everyone knows that…"],
        answer: "Supporters of this approach argue that…",
        explanation: "Attribution language separates reporting a view from holding it — the core grammatical tool of the discussion essay.",
      },
    },
    {
      kind: "key_point",
      heading: "Remember this",
      data: {
        keyPoint: "Give both views equal, attributed, steel-manned treatment in the bodies — then deliver your own verdict in the conclusion with a criterion, not a shrug.",
      },
    },
    {
      kind: "next_step",
      heading: "Next step",
      body: "Write a discussion essay; afterwards, check both bodies are within ~20 words of each other.",
      data: { nextHref: T2, nextLabel: "Practise a discussion essay" },
    },
  ],
};

const essayAdvDis: LessonDef = {
  id: "lesson-22",
  title: "Advantage/disadvantage essays",
  slug: "task-2-advantages-disadvantages",
  module: "Writing Task 2",
  skill: "writing",
  summary: "Weigh benefits against drawbacks — and answer the ‘outweigh' question when asked.",
  difficulty: 2,
  sections: [
    {
      kind: "intro",
      heading: "Why this lesson matters",
      body: "Advantage/disadvantage prompts come in two variants that look identical and are marked differently: “Discuss the advantages and disadvantages” wants balanced coverage; “Do the advantages outweigh the disadvantages?” demands a verdict. Answering the wrong variant is a silent Task Response penalty that candidates never notice they've incurred.",
    },
    {
      kind: "objectives",
      heading: "You will learn",
      data: {
        items: [
          "How to detect which variant you've been given",
          "How to develop an advantage or drawback beyond naming it",
          "How to argue ‘outweighs' — by weight, not by count",
        ],
      },
    },
    {
      kind: "explanation",
      heading: "Two variants, one engine",
      body: "Read the final question sentence first. ‘Discuss the advantages and disadvantages' → present both sides developed, verdict optional. ‘Do the advantages outweigh…?' → your answer IS the essay's spine; state it in the introduction and argue it throughout. Either way, each point needs the same development engine as any Task 2 paragraph: name the advantage → explain the mechanism (why does it produce the benefit?) → ground it in an example. And ‘outweigh' is about weight, not arithmetic: three trivial advantages do not outweigh one serious drawback. Argue magnitude — who is affected, how severely, how reversibly.",
    },
    {
      kind: "gt_relevance",
      heading: "In the GT exam",
      body: "Classic GT territory: living abroad, online shopping, gig work, cars in cities, later retirement. These prompts overlap with your own immigration experience — usable as example material (kept general, never a personal essay). Band 7 requires the position (where one is required) to stay visible in every paragraph.",
    },
    {
      kind: "example",
      heading: "Example: naming vs developing",
      body: "Advantage of online shopping: convenience.",
      data: {
        sample: "Named only: “One advantage is convenience.”\nDeveloped: “The clearest advantage is convenience: purchases that once required a trip across town now take minutes from home. For people in rural areas or with limited mobility, this is not a luxury but genuine access — a wheelchair user no longer depends on a shop's physical layout to buy what they need.”",
        note: "Mechanism (time, access) plus a concrete affected group. The named-only version scores as an idea list; the developed one as an argument.",
      },
    },
    {
      kind: "example",
      heading: "Example: arguing ‘outweigh' by weight",
      body: "Working while studying.",
      data: {
        sample: "“Although part-time work costs students study hours — perhaps ten a week — what it buys is disproportionate: financial independence, workplace habits, and references that shorten the post-graduation job search by months. The hours are recoverable; the head start is not. On balance, the advantages clearly outweigh the cost.”",
        note: "One drawback conceded honestly, then outweighed on magnitude and reversibility — not by listing four small benefits against it.",
      },
    },
    {
      kind: "mistake",
      heading: "Common mistake",
      body: "The inventory essay: six advantages and five disadvantages, one sentence each, no weighing, no development. It feels thorough and scores Band 6 at best. Two developed points per side (or per body paragraph) with real mechanisms beats any list — and leaves time to actually answer the outweigh question.",
    },
    {
      kind: "strategy",
      heading: "Adv/disadv frame (40 minutes)",
      data: {
        items: [
          "Read the final sentence first: coverage variant or verdict variant?",
          "Pick your two strongest points per side — strongest, not most",
          "Verdict variant: state the verdict in the intro; make body order serve it (concede the weaker side first, land on yours)",
          "Every point: name → mechanism → example. Conclusion: coverage → summarise; verdict → re-answer ‘outweigh' explicitly",
        ],
      },
    },
    {
      kind: "guided_practice",
      heading: "Try it: read the variant, plan the spine",
      body: "Detect, then plan.",
      data: {
        task: "Prompt: “More people are choosing to rent rather than buy their homes. Do the advantages of renting outweigh the disadvantages?” Which variant is this, and what does your introduction have to contain?",
        modelAnswer: "Verdict variant — ‘outweigh' demands an answer. The introduction must paraphrase the trend AND take the position, e.g. “For most people under forty, I would argue the advantages of renting — mobility and freedom from debt — now outweigh the traditional security of ownership.” The two named advantages become the body plan.",
      },
    },
    {
      kind: "quick_check",
      heading: "Quick check 1",
      body: "The prompt asks “Do the advantages outweigh the disadvantages?” What must your essay do?",
      data: {
        options: ["Present both sides equally and let the reader decide", "State and defend a clear answer to the outweigh question", "List as many points as possible per side"],
        answer: "State and defend a clear answer to the outweigh question",
        explanation: "‘Outweigh' is a direct question; balance without a verdict leaves it unanswered and caps Task Response.",
      },
    },
    {
      kind: "quick_check",
      heading: "Quick check 2",
      body: "How is ‘outweighing' best demonstrated?",
      data: {
        options: ["More advantages than disadvantages by count", "By magnitude — who is affected, how severely, how reversibly", "By stating ‘clearly the advantages outweigh' several times"],
        answer: "By magnitude — who is affected, how severely, how reversibly",
        explanation: "Weight is argued, not counted or asserted. One serious, developed drawback can outweigh three trivial benefits — and vice versa.",
      },
    },
    {
      kind: "key_point",
      heading: "Remember this",
      data: {
        keyPoint: "Read the final prompt sentence first: if it asks ‘outweigh', answer it from the introduction on — and argue by weight (mechanism + magnitude), never by count.",
      },
    },
    {
      kind: "next_step",
      heading: "Next step",
      body: "Write an advantage/disadvantage essay — underline your verdict sentence if the prompt demanded one.",
      data: { nextHref: T2, nextLabel: "Practise an adv/disadv essay" },
    },
  ],
};

const essayProblem: LessonDef = {
  id: "lesson-23",
  title: "Problem/solution essays",
  slug: "task-2-problem-solution",
  module: "Writing Task 2",
  skill: "writing",
  summary: "Diagnose causes and propose solutions that actually match them.",
  difficulty: 2,
  sections: [
    {
      kind: "intro",
      heading: "Why this lesson matters",
      body: "Problem/solution prompts (“What problems does this cause? What solutions can you suggest?”) are marked on a link candidates routinely break: solutions must answer the specific problems you raised. An essay that describes traffic problems and then proposes ‘the government should run campaigns' has two halves that never meet — and a Task Response ceiling to match.",
    },
    {
      kind: "objectives",
      heading: "You will learn",
      data: {
        items: [
          "How to read the prompt's exact pair (problems/solutions, causes/effects, causes/solutions)",
          "The mirror rule: every solution answers a named problem",
          "How to make a solution concrete: agent + action + mechanism",
        ],
      },
    },
    {
      kind: "explanation",
      heading: "The mirror rule",
      body: "First, answer exactly the pair asked — prompts vary (causes and solutions / problems and solutions / effects and measures), and swapping in the pair you prepared for is a real penalty. Then build the mirror: body 1 raises two developed problems; body 2 solves those same two, ideally in the same order. Each solution needs three parts — an agent (who acts: municipal governments, employers, individuals), an action (what specifically), and a mechanism (why it would reduce the named problem). “Something must be done” has none of the three. Feasibility talk (“while costly upfront…”) is a Band 7+ bonus: it shows you're weighing solutions, not wishing.",
    },
    {
      kind: "gt_relevance",
      heading: "In the GT exam",
      body: "Standard GT problem territory: housing costs, congestion, work-life balance, loneliness in cities, food waste. Concrete civic vocabulary (subsidise, enforce, incentivise, zone, retrofit) earns Lexical Resource here — this essay type rewards practical-policy language that abstract topics never ask for.",
    },
    {
      kind: "example",
      heading: "Example: solution with agent, action, mechanism",
      body: "Problem raised: long commutes harming family life.",
      data: {
        sample: "“Employers are best placed to act: staggering start times and allowing two remote days a week would take cars off the road at peak hours — directly returning the commute's worst hour to households, without any new infrastructure.”",
        note: "Agent (employers), action (staggered hours, remote days), mechanism (peak-hour reduction → time returned). One sentence pair, fully concrete.",
      },
    },
    {
      kind: "example",
      heading: "Example: the mirror in miniature",
      body: "Problems and solutions, paired in order.",
      data: {
        sample: "Body 1: (a) rising rents push workers out of city centres; (b) empty offices sit unused since remote work grew.\nBody 2: (a′) zoning reform to allow residential conversion near transit; (b′) tax incentives for office-to-housing retrofits.",
        note: "b′ literally uses problem (b) as raw material for solution (a). When solutions interlock with the problems you raised, coherence marks itself.",
      },
    },
    {
      kind: "mistake",
      heading: "Common mistake",
      body: "The universal solution paragraph: “governments should raise awareness and improve education” — deployable against any problem on Earth, which is exactly why it scores nothing. If your solution paragraph would survive being pasted into a different essay, it isn't answering this one.",
    },
    {
      kind: "strategy",
      heading: "Problem/solution frame (40 minutes)",
      data: {
        items: [
          "Confirm the exact pair the prompt asks (causes? problems? effects?) before planning",
          "Pick two problems you can also solve — plan them as pairs from the start",
          "Body 1: two problems, developed with consequences. Body 2: two mirrored solutions, each with agent + action + mechanism",
          "Conclusion: which solution matters most and why; a feasibility clause if room allows",
        ],
      },
    },
    {
      kind: "guided_practice",
      heading: "Try it: mirror a problem",
      body: "Build the pair before revealing.",
      data: {
        task: "Problem raised: “Supermarkets discard large quantities of edible food as it approaches its best-before date.” Write one mirrored solution with agent, action, and mechanism.",
        modelAnswer: "One workable version: “Municipal governments could require large retailers to donate unsold edible food to certified food banks, as several European cities already do; with collection logistics funded by a small levy on the retailers' waste-disposal costs, discarding food would become more expensive than donating it.” — agent (municipal government), action (mandatory donation + levy), mechanism (flips the cost incentive).",
      },
    },
    {
      kind: "quick_check",
      heading: "Quick check 1",
      body: "The prompt asks for causes and solutions. Your essay gives problems and solutions instead. What's the consequence?",
      data: {
        options: ["None — they're the same thing", "A Task Response penalty for answering a different question", "A grammar penalty"],
        answer: "A Task Response penalty for answering a different question",
        explanation: "Causes (why it happens) and problems (what harm results) are different content. Answer the exact pair printed on your paper.",
      },
    },
    {
      kind: "quick_check",
      heading: "Quick check 2",
      body: "What's missing from the solution “People should be more aware of this issue”?",
      data: {
        options: ["Nothing — awareness is a solution", "An agent, a concrete action, and a mechanism linking it to the problem", "A longer word count"],
        answer: "An agent, a concrete action, and a mechanism linking it to the problem",
        explanation: "Who makes people aware, how, and why would awareness reduce this particular harm? Without those, it's a wish, not a solution.",
      },
    },
    {
      kind: "key_point",
      heading: "Remember this",
      data: {
        keyPoint: "Answer the exact pair asked, and mirror it: every solution names an agent, an action, and a mechanism aimed at a problem you raised — no universal awareness paragraphs.",
      },
    },
    {
      kind: "next_step",
      heading: "Next step",
      body: "Write a problem/solution essay; draw literal arrows from each solution back to its problem when checking.",
      data: { nextHref: T2, nextLabel: "Practise a problem/solution essay" },
    },
  ],
};

const essayPlanning: LessonDef = {
  id: "lesson-24",
  title: "Planning a 250-word response in five minutes",
  slug: "task-2-planning-250-words",
  module: "Writing Task 2",
  skill: "writing",
  summary: "Turn 5 minutes of planning into 35 minutes of writing that never stalls.",
  difficulty: 1,
  sections: [
    {
      kind: "intro",
      heading: "Why this lesson matters",
      body: "The 40 minutes of Task 2 punish improvisers: essays written sentence-by-sentence drift off-position, repeat ideas, and die at 210 words. A five-minute plan is not time lost from writing — it is what makes the remaining 35 minutes produce a straight line. Every Task 2 lesson in Clearband assumes the plan; this one teaches it.",
    },
    {
      kind: "objectives",
      heading: "You will learn",
      data: {
        items: [
          "The five-minute planning sequence: deconstruct → position → ideas → examples → order",
          "How to budget 250+ words across four paragraphs",
          "How a plan rescues you mid-essay when a paragraph stalls",
        ],
      },
    },
    {
      kind: "explanation",
      heading: "Five minutes, five moves",
      body: "Minute 1 — deconstruct: circle the topic, the instruction type (agree? discuss? outweigh? solutions?), and any scope limiter (‘in primary schools', ‘for young people'). Minute 2 — position: one line answering the instruction. Minutes 3–4 — ideas and examples: two body ideas, each with a concrete example jotted in 3–4 words (‘Halifax firm hires Winnipeg dev'). Minute 5 — order and budget: which idea first, and the word plan — intro ~45, body 1 ~85, body 2 ~85, conclusion ~40 = ~255. The plan is five short lines in note form. Under-length essays are almost always unplanned essays: the budget guarantees length structurally, before style is even involved.",
    },
    {
      kind: "gt_relevance",
      heading: "In the GT exam",
      body: "Below 250 words costs marks directly; rambling past 320 costs time and accuracy. The plan solves both ends. It also protects the Task 2/Task 1 split: 40/20 minutes — because Task 2 carries double weight, and an unplanned Task 2 quietly eats Task 1's twenty minutes.",
    },
    {
      kind: "example",
      heading: "Example: a complete plan in 22 words",
      body: "Prompt: “Some believe local shops deserve government support against large supermarkets. To what extent do you agree?”",
      data: {
        sample: "AGREE (limited) — support yes, subsidy no.\n1. High streets = social value (elderly, community) → ex: closures isolate villages\n2. But mkt efficiency real → support = tax breaks not handouts\nConcl: targeted support",
        note: "Twenty-two words, five lines, forty seconds to read back. Every paragraph now has a job, an idea, and an example waiting.",
      },
    },
    {
      kind: "example",
      heading: "Example: the plan as mid-essay rescue",
      body: "Paragraph two stalls at word 150.",
      data: {
        sample: "Stalled sentence: “Furthermore, local shops are also important because…” (blank). Plan line 2 reads: “support = tax breaks not handouts.” → Next sentence writes itself: “Support, however, should take the form of tax relief rather than direct subsidy…”",
        note: "Improvisers stall into repetition; planners glance left and continue. This is what the five minutes actually buy.",
      },
    },
    {
      kind: "mistake",
      heading: "Common mistake",
      body: "Planning in full sentences — spending eight minutes writing a beautiful outline that steals from drafting time. Plans are telegraphic: abbreviations, arrows, fragments. If your plan has verbs conjugated and articles in place, you're drafting twice.",
    },
    {
      kind: "strategy",
      heading: "The 40-minute clock",
      data: {
        items: [
          "0–5: plan (deconstruct → position → 2 ideas + examples → order/budget)",
          "5–12: introduction (paraphrase + position; ~45 words)",
          "12–33: two body paragraphs (~85 words each, four-move structure)",
          "33–37: conclusion (~40 words). 37–40: check — count words, hunt agreement errors and repeated openers",
        ],
      },
    },
    {
      kind: "guided_practice",
      heading: "Try it: plan without writing",
      body: "Five lines, note form only.",
      data: {
        task: "Plan (don't write) this prompt in under 5 minutes: “Many employees now change jobs every few years. What problems does this cause, and what solutions can you suggest?”",
        modelAnswer: "One workable plan: “PAIR: problems + solutions. P1: employers lose training investment → ex: 2yr dev leaves post-training. P2: workers lose pension/roots → ex: no seniority. S1(mirror P1): retention via progression paths + training bonds. S2(mirror P2): portable benefits (gov). Concl: portable benefits = priority.” — pair confirmed, mirror built, examples attached, all in fragments.",
      },
    },
    {
      kind: "quick_check",
      heading: "Quick check 1",
      body: "Your essay reaches the conclusion at 205 words. What most likely went wrong?",
      data: {
        options: ["Vocabulary too simple", "No word budget — body paragraphs were never sized to carry ~85 words each", "The topic was too hard"],
        answer: "No word budget — body paragraphs were never sized to carry ~85 words each",
        explanation: "Length problems are planning problems. Two ideas developed through claim → explain → example → link cannot come in under 250 words.",
      },
    },
    {
      kind: "quick_check",
      heading: "Quick check 2",
      body: "What form should plan notes take?",
      data: {
        options: ["Complete sentences to reuse in the essay", "Telegraphic fragments — abbreviations, arrows, 3–4 word examples", "A full first draft"],
        answer: "Telegraphic fragments — abbreviations, arrows, 3–4 word examples",
        explanation: "The plan is scaffolding, not prose. Fragments capture the idea in seconds and leave 35 minutes for the actual writing.",
      },
    },
    {
      kind: "key_point",
      heading: "Remember this",
      data: {
        keyPoint: "Five minutes, five moves: deconstruct the prompt, fix your position, jot two ideas with examples, set the order and word budget — in fragments, never sentences.",
      },
    },
    {
      kind: "next_step",
      heading: "Next step",
      body: "Write a Task 2 essay and force the full five-minute plan first — even if you feel ready sooner.",
      data: { nextHref: T2, nextLabel: "Practise a planned essay" },
    },
  ],
};

// ---------------------------------------------------------------------------
// Speaking — 5 lessons
// ---------------------------------------------------------------------------

const speakingP1: LessonDef = {
  id: "lesson-25",
  title: "Part 1: extended answers, not essays",
  slug: "speaking-part-1-short-answers",
  module: "Speaking",
  skill: "speaking",
  summary: "Answer everyday questions in 2–4 sentences: direct answer plus one extension.",
  difficulty: 1,
  sections: [
    {
      kind: "intro",
      heading: "Why this lesson matters",
      body: "Part 1 (4–5 minutes on home, work, hobbies, daily life) sets the examiner's first impression. The two failure modes are opposites: one-word answers that give nothing to assess, and three-minute monologues that sound rehearsed. The scoring zone is between them — natural, extended, conversational answers of two to four sentences.",
    },
    {
      kind: "objectives",
      heading: "You will learn",
      data: {
        items: [
          "The answer + extension pattern (A+E) for any Part 1 question",
          "Four extension types: reason, example, contrast, feeling",
          "How to handle a question you have nothing to say about",
        ],
      },
    },
    {
      kind: "explanation",
      heading: "Answer, then extend once or twice",
      body: "Every Part 1 answer is: direct answer first, then one or two extensions. The four extension types cover every question: Reason (“…mainly because my shift starts at seven”), Example (“…last weekend, for instance, we cycled the harbour trail”), Contrast (“…though back home I hardly ever cooked”), Feeling (“…which I find surprisingly relaxing”). Two extensions maximum — then stop talking. Stopping cleanly is a fluency feature, not a weakness; trailing off (“so… yeah…”) is the actual fluency error. If a question draws a blank (“Do you like fishing?”), honesty plus extension still scores: “Not really, to be honest — I've only tried it once and spent most of the day untangling the line. I'd sooner spend that time cycling.” The examiner is scoring language, not hobbies.",
    },
    {
      kind: "gt_relevance",
      heading: "In the GT exam",
      body: "Speaking is identical for GT and Academic: Part 1 topics are everyday ones — exactly the vocabulary of your Canadian life plans. CLB 9 needs Speaking 7.0: willingness to speak at length, flexible everyday vocabulary, and answers that sound thought, not recited.",
    },
    {
      kind: "example",
      heading: "Example: too little, too much, right",
      body: "Q: “Do you prefer mornings or evenings?”",
      data: {
        sample: "Too little: “Mornings.”\nToo much: 90 seconds covering your entire daily routine since childhood.\nRight: “Definitely mornings — my brain just works better before noon. I do my best writing before anyone else is awake, though by nine at night I'm honestly useless.”",
        note: "The right version: direct answer + reason + contrast, ~3 sentences, with natural markers (‘definitely', ‘honestly') doing fluency work.",
      },
    },
    {
      kind: "example",
      heading: "Example: extending a blank topic",
      body: "Q: “Is gardening popular in your country?” (you know nothing about gardening)",
      data: {
        sample: "“I'd say moderately — you see allotments in most towns, but among my friends it's rare; apartment living doesn't leave much room for it. My aunt's the exception: her balcony is a small jungle.”",
        note: "General impression + contrast + tiny example. No expertise required — the question is a language prompt, not a knowledge test.",
      },
    },
    {
      kind: "mistake",
      heading: "Common mistake",
      body: "Answering the topic instead of the question. Asked “How often do you cook?”, candidates deliver a prepared speech about their favourite food. Examiners hear topic-dumping instantly and mark it as memorised. Listen for the question word — how often, who, where — and answer that word first.",
    },
    {
      kind: "strategy",
      heading: "Part 1 habits",
      data: {
        items: [
          "First sentence answers the question word directly (how often → frequency; who → person)",
          "Add 1–2 extensions: reason / example / contrast / feeling — vary the type across answers",
          "End cleanly on a falling tone; never trail off",
          "No topic knowledge? Say so naturally and extend anyway — honesty + extension scores",
        ],
      },
    },
    {
      kind: "guided_practice",
      heading: "Try it: build an A+E answer",
      body: "Speak it aloud before revealing.",
      data: {
        task: "Q: “Do you usually use public transport?” Build: direct answer + one reason + one example or contrast. Say it aloud — 3 sentences, then stop.",
        modelAnswer: "One workable shape: “Most days, yes — the bus is honestly faster than parking downtown. [reason] Though on weekends I'll walk if the weather cooperates. [contrast]” Yours must be your own facts — the pattern (answer → reason → contrast, clean stop) is what transfers.",
      },
    },
    {
      kind: "quick_check",
      heading: "Quick check 1",
      body: "What's the ideal length for a Part 1 answer?",
      data: {
        options: ["One word — efficiency shows confidence", "2–4 sentences: answer plus one or two extensions", "As long as possible to show fluency"],
        answer: "2–4 sentences: answer plus one or two extensions",
        explanation: "Enough language to assess, short enough to stay conversational. Long monologues belong in Part 2 — in Part 1 they sound rehearsed.",
      },
    },
    {
      kind: "quick_check",
      heading: "Quick check 2",
      body: "You're asked about a topic you know nothing about. Best move?",
      data: {
        options: ["Say ‘I don't know' and wait", "Pretend expertise and improvise facts", "Admit it naturally and extend with an impression, contrast, or mini-example"],
        answer: "Admit it naturally and extend with an impression, contrast, or mini-example",
        explanation: "“Not really my area, to be honest, but…” is natural English under assessment. Silence gives the examiner nothing to score.",
      },
    },
    {
      kind: "key_point",
      heading: "Remember this",
      data: {
        keyPoint: "Part 1 = direct answer + one or two extensions (reason, example, contrast, feeling), then a clean stop — answer the question word, never the topic.",
      },
    },
    {
      kind: "next_step",
      heading: "Next step",
      body: "Record three Part 1 answers and check each: did the first sentence answer the question word?",
      data: { nextHref: SPK, nextLabel: "Record Part 1 answers" },
    },
  ],
};

const speakingP2: LessonDef = {
  id: "lesson-9",
  title: "Part 2: the cue-card map",
  slug: "speaking-part-2-cue-map",
  module: "Speaking",
  skill: "speaking",
  summary: "Use the one-minute prep to build notes you can actually speak from.",
  difficulty: 2,
  sections: [
    {
      kind: "intro",
      heading: "Why this lesson matters",
      body: "Part 2 gives you a cue card, one minute to prepare, and up to two minutes to speak alone. It is the only part of IELTS where you control the floor — and most candidates waste it by writing sentences during prep, running dry at forty seconds, or reciting something memorised. A note map fixes all three.",
    },
    {
      kind: "objectives",
      heading: "You will learn",
      data: {
        items: [
          "How to spend the 60 seconds of prep: a 5-word map, not sentences",
          "The story spine that fills two minutes naturally",
          "How to keep going when you run out of planned content",
        ],
      },
    },
    {
      kind: "explanation",
      heading: "Map words, not sentences",
      body: "In sixty seconds you can write about eight useful words. Choose them as a map, one word per beat of the story spine: SET (where/when) → WHO → WHAT happened / what it is → DETAIL (one sensory or specific fact) → FEEL (how it felt/feels) → WHY it matters (the cue card's last line, usually ‘explain why…'). Speaking from single words forces real-time sentence building — which is exactly what the examiner needs to hear for Fluency and Grammar. Each map word is good for 15–25 seconds of talk; six words comfortably fill the two minutes. The final bullet (‘explain why') is where Band 7 lives: it demands opinion language and complex sentences, so give it the last 30–40 seconds deliberately.",
    },
    {
      kind: "gt_relevance",
      heading: "In the GT exam",
      body: "Cue cards are everyday topics — a person you admire, a place you visited, a useful object, a decision you made. The examiner may ask one brief follow-up. Two minutes of connected, self-managed speech is the single strongest predictor of your Fluency & Coherence band.",
    },
    {
      kind: "example",
      heading: "Example: a one-minute map",
      body: "Cue card: “Describe a journey you remember well.”",
      data: {
        sample: "MAP: night-bus / brother / breakdown 2am / cold-coffee / laughing / why→unplanned",
        note: "Six fragments, written in ~40 seconds, leaving 20 to breathe and think. Each fragment seeds a scene; ‘why→unplanned' reminds the speaker to land on the reflection the card asked for.",
      },
    },
    {
      kind: "example",
      heading: "Example: expanding one map word",
      body: "The fragment ‘cold-coffee' becomes 20 seconds of speech.",
      data: {
        sample: "“What I remember most, oddly, is the coffee — we'd bought it hours earlier and it was stone cold by the time the bus broke down, but we drank it anyway at two in the morning, sitting on the kerb, and somehow it tasted better than any coffee since.”",
        note: "One noun on paper → sensory detail, past habits, evaluation — spontaneous grammar the examiner can score. This is why maps beat scripts.",
      },
    },
    {
      kind: "mistake",
      heading: "Common mistake",
      body: "Writing the first two sentences out in full during prep. They come out polished — then the speaker falls off a cliff into silence at 0:25, because nothing else was prepared. Sixty seconds buys a whole map or two nice sentences, never both. Take the map.",
    },
    {
      kind: "strategy",
      heading: "The two minutes, managed",
      data: {
        items: [
          "Prep: write the 6-word spine (SET–WHO–WHAT–DETAIL–FEEL–WHY); no verbs, no sentences",
          "Open by rooting yourself in the scene (“This was three winters ago, on…”) — never by reading the card back",
          "One map word at a time; if one runs dry, bridge to the next (“But what really made it memorable was…”)",
          "Save the WHY for the final stretch and let the examiner stop you — running over is fine, stopping at 1:10 is not",
        ],
      },
    },
    {
      kind: "guided_practice",
      heading: "Try it: build a map in 60 seconds",
      body: "Time yourself strictly.",
      data: {
        task: "Cue card: “Describe an object you use every day. Say what it is, how you got it, what you use it for, and explain why it is important to you.” Write your 6-word map in one minute.",
        modelAnswer: "Any six fragments that ladder the card works, e.g.: “bike / dad-2019 / commute+groceries / squeaky-brake / freedom / why→independence”. Test it: can you talk 20 seconds on each? If a word gives you nothing to say, swap it now — that's what prep time is for.",
      },
    },
    {
      kind: "quick_check",
      heading: "Quick check 1",
      body: "How should you use the one-minute preparation time?",
      data: {
        options: ["Write your opening sentences in full", "Write a map of ~6 single words covering the card's points", "Relax — preparation makes you sound rehearsed"],
        answer: "Write a map of ~6 single words covering the card's points",
        explanation: "Fragments seed spontaneous speech across all two minutes; full sentences buy 25 polished seconds and a cliff.",
      },
    },
    {
      kind: "quick_check",
      heading: "Quick check 2",
      body: "You've covered your map and the examiner hasn't stopped you. What now?",
      data: {
        options: ["Stop and say ‘that's all'", "Extend the WHY: compare, reflect, or say how it changed things", "Start the story again from the beginning"],
        answer: "Extend the WHY: compare, reflect, or say how it changed things",
        explanation: "Reflection language (“looking back…”, “compared to…”) is high-band material and inexhaustible. Never surrender the floor early.",
      },
    },
    {
      kind: "key_point",
      heading: "Remember this",
      data: {
        keyPoint: "Prep = a six-word map (SET–WHO–WHAT–DETAIL–FEEL–WHY), never sentences; speak 20 seconds per word and spend the final stretch on the card's ‘explain why'.",
      },
    },
    {
      kind: "next_step",
      heading: "Next step",
      body: "Record a Part 2 answer: 60 seconds of map-making, then two full minutes on the clock.",
      data: { nextHref: SPK, nextLabel: "Record a Part 2 response" },
    },
  ],
};

const speakingP3: LessonDef = {
  id: "lesson-26",
  title: "Part 3: developed answers under pressure",
  slug: "speaking-part-3-developed-answers",
  module: "Speaking",
  skill: "speaking",
  summary: "Turn abstract discussion questions into structured 30–45 second answers.",
  difficulty: 3,
  sections: [
    {
      kind: "intro",
      heading: "Why this lesson matters",
      body: "Part 3 lifts the cue-card topic to society level: not “describe your bike” but “why are cities encouraging cycling?” These abstract questions decide the top of your Speaking band — they demand opinion, speculation, and comparison in real time. The good news: a small set of thinking moves covers nearly every question.",
    },
    {
      kind: "objectives",
      heading: "You will learn",
      data: {
        items: [
          "The PEEL answer shape adapted for speech (position → explain → example → land)",
          "Thinking moves for the four Part 3 question types: why / compare / predict / evaluate",
          "How to buy thinking time without losing fluency marks",
        ],
      },
    },
    {
      kind: "explanation",
      heading: "Speak in PEEL, think in moves",
      body: "A Part 3 answer is a spoken mini-paragraph, 30–45 seconds: Position (“Largely, I'd say it's economic”) → Explain (“because…”) → Example (“you can see it in…”) → Land (a closing clause that returns to the question). The four question types each have a reliable move: Why questions → give two causes, ranked (“partly X, but mainly Y”). Compare questions → name the dimension first (“the biggest difference is cost”). Predict questions → hedge + trend + consequence (“I suspect…, given…, which would mean…”). Evaluate questions → concede then commit (“there's some truth in that, but on balance…”). Buying time is legal and scored as fluency when done with content phrases: “That's not something I'd considered — my instinct is…” beats a five-second silence every time.",
    },
    {
      kind: "gt_relevance",
      heading: "In the GT exam",
      body: "Part 3 is where Speaking 7.0 (CLB 9) is won or lost: the descriptors reward developing topics, justifying opinions, and speculating — none of which Part 1's everyday answers can demonstrate. Expect follow-up probes (“Why do you think that is?”); they are invitations to go deeper, not challenges.",
    },
    {
      kind: "example",
      heading: "Example: a PEEL answer in real time",
      body: "Q: “Why do you think fewer young people are learning to drive?”",
      data: {
        sample: "“Mostly cost, I'd say — insurance for new drivers has become genuinely prohibitive, on top of lessons and fuel. [P+E] A friend of mine calculated it would take her two years of part-time wages just to get on the road, so she simply didn't. [E] Add ride-sharing apps filling the gap, and driving has shifted from a rite of passage to an optional expense. [Land]”",
        note: "~35 seconds. Position ranked (‘mostly cost'), mechanism explained, one concrete example, and a landing sentence that answers the actual question.",
      },
    },
    {
      kind: "example",
      heading: "Example: concede then commit",
      body: "Q: “Some say online friendships are as valuable as face-to-face ones. Do you agree?”",
      data: {
        sample: "“There's real truth in that — I've kept friendships alive across three time zones that distance would have killed a generation ago. But on balance I'd still say no: the friendships that carry you through a crisis tend to be the ones that can show up at your door.”",
        note: "The concession is genuine (with its own example), then ‘but on balance' pivots to a committed position. Evaluating both sides aloud, then choosing, is textbook Band 7+ discourse management.",
      },
    },
    {
      kind: "mistake",
      heading: "Common mistake",
      body: "Answering abstract questions with personal anecdotes only. “Why are rents rising?” — “Well, MY rent went up last year…” Part 3 wants the society-level answer first; personal experience enters as the example, not the thesis. Zoom out first, then illustrate.",
    },
    {
      kind: "strategy",
      heading: "Part 3 toolkit",
      data: {
        items: [
          "Classify the question in your first breath: why / compare / predict / evaluate",
          "Apply the matching move (rank causes / name the dimension / hedge+trend / concede+commit)",
          "Shape every answer as PEEL, 30–45 seconds, landing back on the question",
          "Stuck? Buy time with a content phrase (“my instinct is…”), never with silence or ‘I don't know'",
        ],
      },
    },
    {
      kind: "guided_practice",
      heading: "Try it: classify and answer",
      body: "Name the move, then speak.",
      data: {
        task: "Q: “Do you think working from home will become the norm in the future?” — Which question type is this, which move applies, and what would your first sentence be?",
        modelAnswer: "Predict type → hedge + trend + consequence. A workable first sentence: “I suspect it'll settle into a hybrid rather than a full norm — the technology clearly works, but the last few years showed employers how much informal training happens in person.” From there: explain, one example, land.",
      },
    },
    {
      kind: "quick_check",
      heading: "Quick check 1",
      body: "How long should a good Part 3 answer run?",
      data: {
        options: ["5–10 seconds — keep it snappy", "30–45 seconds — a spoken mini-paragraph", "2 minutes — like Part 2"],
        answer: "30–45 seconds — a spoken mini-paragraph",
        explanation: "Long enough to position, explain, and exemplify; short enough to stay a discussion. Part 3 is a dialogue, not a monologue slot.",
      },
    },
    {
      kind: "quick_check",
      heading: "Quick check 2",
      body: "Asked to predict something you've never thought about, you should:",
      data: {
        options: ["Say ‘I have no idea about the future'", "Hedge, name a trend, and reason to a consequence (“I suspect…, given…, which would mean…”)", "Recite a prepared opinion on a related topic"],
        answer: "Hedge, name a trend, and reason to a consequence (“I suspect…, given…, which would mean…”)",
        explanation: "Speculation language IS the assessed skill — the examiner wants to hear you think, not to check your forecasting record.",
      },
    },
    {
      kind: "key_point",
      heading: "Remember this",
      data: {
        keyPoint: "Classify each Part 3 question (why/compare/predict/evaluate), apply its move, and speak in PEEL for 30–45 seconds — society-level answer first, personal experience as the example.",
      },
    },
    {
      kind: "next_step",
      heading: "Next step",
      body: "Record answers to two Part 3-style prompts and check each for all four PEEL beats.",
      data: { nextHref: SPK, nextLabel: "Record Part 3 answers" },
    },
  ],
};

const speakingFluency: LessonDef = {
  id: "lesson-27",
  title: "Fluency and coherence: connect, don't rush",
  slug: "speaking-fluency-coherence",
  module: "Speaking",
  skill: "speaking",
  summary: "Fluency is flow and connection — not speed. Build both with discourse markers and repair skills.",
  difficulty: 2,
  sections: [
    {
      kind: "intro",
      heading: "Why this lesson matters",
      body: "Candidates chase fluency by speaking faster — and produce rushed, fragmented answers with more errors. The Fluency & Coherence criterion actually measures continuity (few long pauses), connection (ideas linked logically), and repair (recovering smoothly from stumbles). All three are learnable mechanics.",
    },
    {
      kind: "objectives",
      heading: "You will learn",
      data: {
        items: [
          "The difference between hesitation that costs marks and pausing that doesn't",
          "A working set of discourse markers — and the overuse trap",
          "Self-correction technique: repair without derailing",
        ],
      },
    },
    {
      kind: "explanation",
      heading: "Flow, links, repairs",
      body: "Pauses split into two kinds: content pauses (thinking about ideas — natural, brief, often filled: “let me think…”) and language pauses (hunting for a word mid-sentence — these are what the descriptor means by hesitation). You reduce language pauses with paraphrase reflexes: when a word won't come, describe around it without stopping (“the… the machine that measures your blood pressure”) — that repair is itself scored as a fluency strength. Coherence comes from markers doing real work: sequencing (first of all, on top of that), contrasting (having said that, on the other hand), exemplifying (for instance, take…), returning (anyway, as I was saying). The trap is mechanical overuse — ‘moreover' after every sentence reads as memorised furniture. Markers should appear where the logic actually turns.",
    },
    {
      kind: "gt_relevance",
      heading: "In the GT exam",
      body: "Band 7 Fluency & Coherence describes speaking at length without noticeable effort, with a range of connectives used flexibly. Band 6 allows hesitation while searching for language; Band 7 mostly doesn't. For CLB 9's Speaking 7.0, converting word-hunt pauses into smooth paraphrases is the highest-value single upgrade.",
    },
    {
      kind: "example",
      heading: "Example: the paraphrase reflex",
      body: "The word ‘commute' vanishes mid-answer.",
      data: {
        sample: "Stalling: “My… uh… my… [4 seconds] …commute?”\nRepairing: “My daily trip into work — the commute, that's the word — takes about forty minutes…”",
        note: "The repair version never stops moving, retrieves the word in passing, and reads to the examiner as control. Same vocabulary gap, opposite band signal.",
      },
    },
    {
      kind: "example",
      heading: "Example: markers at the logic turns",
      body: "One answer, connected.",
      data: {
        sample: "“Public transport here is decent — the trains especially. Having said that, evenings are a different story: services thin out after nine. For instance, my Friday class ends at 9:30, and the next train home is at 10:40. So on those days, honestly, driving wins.”",
        note: "Four markers, each at a genuine turn (contrast, example, consequence). None decorative. That's the flexible use Band 7 describes.",
      },
    },
    {
      kind: "mistake",
      heading: "Common mistake",
      body: "Treating self-correction as failure and restarting the whole sentence — “I have lived… I am living… sorry, I have been living…” — three restarts cost more fluency than the original slip. Correct once, briefly (“I lived — I've lived here two years”), or let small slips go entirely. The examiner scores the stream, not each pebble.",
    },
    {
      kind: "strategy",
      heading: "Fluency training kit",
      data: {
        items: [
          "Practise the paraphrase reflex: pick 5 objects daily and describe each without naming it, at speed",
          "Adopt 6–8 markers you actually like (not a list of 30) and drill them into real answers",
          "Record yourself: count language pauses (>2s mid-sentence) per minute; target fewer each week",
          "One correction per slip maximum — repair and roll on",
        ],
      },
    },
    {
      kind: "guided_practice",
      heading: "Try it: describe around the word",
      body: "The reflex, on the clock.",
      data: {
        task: "Without using the words ‘thermostat', ‘kettle', or ‘receipt', describe each in one flowing sentence — no pauses over 2 seconds. Say them aloud.",
        modelAnswer: "The skill is unbroken flow, e.g.: “It's the dial on the wall that lets you set how warm the house should be.” / “The thing you boil water in for tea.” / “The slip of paper the shop gives you to prove you paid.” If you stalled, repeat with three new objects — this reflex is pure repetition.",
      },
    },
    {
      kind: "quick_check",
      heading: "Quick check 1",
      body: "Which pause pattern most damages a fluency score?",
      data: {
        options: ["A brief filled pause before answering a hard question", "Frequent mid-sentence stops while hunting for words", "Pausing at the end of a completed idea"],
        answer: "Frequent mid-sentence stops while hunting for words",
        explanation: "Language-search hesitation is the specific behaviour the descriptors penalise. Thinking pauses at natural boundaries are normal speech.",
      },
    },
    {
      kind: "quick_check",
      heading: "Quick check 2",
      body: "A needed word won't come mid-sentence. Best response?",
      data: {
        options: ["Stop until you remember it", "Switch to a different topic", "Describe around it and keep the sentence moving"],
        answer: "Describe around it and keep the sentence moving",
        explanation: "Paraphrase repair maintains flow and demonstrates resourcefulness — it converts a vocabulary gap into a fluency credit.",
      },
    },
    {
      kind: "key_point",
      heading: "Remember this",
      data: {
        keyPoint: "Fluency is continuity, not speed: paraphrase around missing words without stopping, place markers at real logic turns, and repair slips once — then roll on.",
      },
    },
    {
      kind: "next_step",
      heading: "Next step",
      body: "Record a speaking answer, then count your mid-sentence pauses — that number is your baseline to beat.",
      data: { nextHref: SPK, nextLabel: "Record and self-review" },
    },
  ],
};

const speakingMemorised: LessonDef = {
  id: "lesson-28",
  title: "Avoiding memorised answers",
  slug: "speaking-avoiding-memorised-answers",
  module: "Speaking",
  skill: "speaking",
  summary: "Examiners detect scripts in seconds — learn frameworks and flexible phrases instead.",
  difficulty: 2,
  sections: [
    {
      kind: "intro",
      heading: "Why this lesson matters",
      body: "Memorised answers feel like insurance and work like sabotage. Examiners are trained to detect recitation — and when they do, they discount it and probe with unexpected follow-ups until they hear your real English. IELTS itself warns that memorised responses prevent proper assessment. The alternative isn't going in empty: it's preparing the right layer.",
    },
    {
      kind: "objectives",
      heading: "You will learn",
      data: {
        items: [
          "The signals that expose a memorised answer (and why examiners probe them)",
          "What to prepare instead: frameworks, flexible phrases, and experience banks",
          "How to redeploy preparation naturally when a familiar topic appears",
        ],
      },
    },
    {
      kind: "explanation",
      heading: "Prepare the layer that transfers",
      body: "Recitation leaks through delivery: flat list-like intonation, a sudden register jump (“my quotidian perambulations”), zero hesitation on complex sentences followed by stumbles on simple follow-ups, and answers that fit the topic but not the actual question. What preparation should build instead sits one layer up: frameworks (A+E for Part 1, the six-word map for Part 2, PEEL for Part 3), flexible phrase stems that fit any content (“What strikes me most about… is…”, “It depends partly on…”), and an experience bank — six or seven real stories from your life (a journey, a decision, a person, a challenge) that you've told aloud often enough to be instantly available but never twice in the same words. Fresh words, familiar material: that combination sounds prepared in the good sense — articulate — rather than the fatal one.",
    },
    {
      kind: "gt_relevance",
      heading: "In the GT exam",
      body: "The examiner controls follow-ups precisely to break scripts: “You mentioned your grandmother — what would she say about that?” No script survives contact with a good probe. Speaking 7.0 for CLB 9 requires flexibility — the descriptors reward spontaneous development, which is definitionally unmemorisable.",
    },
    {
      kind: "example",
      heading: "Example: script vs experience bank",
      body: "Cue card: “Describe a person who influenced you.” — same grandmother, two preparations.",
      data: {
        sample: "Script (2019, word-for-word): “My grandmother is the most influential person in my life. She was born in a small village…” [recited; examiner probes: “What did she think of city life?” — silence.]\nBank: the speaker has told grandmother stories aloud dozens of times, never identically — tonight's version leans on the market stall years because ‘influence' called for it. The probe about city life? She has real material; she just talks.",
        note: "Same life, same person. One preparation collapses under a follow-up; the other feeds on it.",
      },
    },
    {
      kind: "example",
      heading: "Example: a stem doing honest work",
      body: "Prepared stem, unprepared content.",
      data: {
        sample: "Q: “Is it important for children to play outdoors?” — “What strikes me most about this is how recent the question is — a generation ago nobody needed to ask. I'd say it matters enormously, partly for health, but mainly because unsupervised play is where kids learn to negotiate…”",
        note: "The stem (“What strikes me most…”) was rehearsed; everything after it is live. Stems buy composure without buying content — that's the legal kind of preparation.",
      },
    },
    {
      kind: "mistake",
      heading: "Common mistake",
      body: "Upgrading vocabulary beyond your control zone: memorising ‘showcase words' (plethora, myriad, quintessential) and deploying them into sentences that can't support them. One register mismatch flags the whole performance. Band 7 vocabulary is precise and natural, not ornamental — ‘a huge range' used correctly outscores ‘a plethora' used stiffly.",
    },
    {
      kind: "strategy",
      heading: "Legal preparation",
      data: {
        items: [
          "Build an experience bank: 6–7 real stories, told aloud weekly, never in the same words",
          "Drill frameworks (A+E, six-word map, PEEL) until they're reflexes, not recipes",
          "Collect 8–10 phrase stems you'd actually say; retire any that feel like costume",
          "Practise with random question generators so rehearsal never converges on fixed wording",
        ],
      },
    },
    {
      kind: "guided_practice",
      heading: "Try it: same story, new words",
      body: "The anti-script drill.",
      data: {
        task: "Pick one real story from your life (a move, a decision, a mistake). Record yourself telling it in 45 seconds. Then immediately record it again — same story, but you may not reuse any full sentence from take one.",
        modelAnswer: "There's no model text — that's the point. Compare your takes: same facts, different sentences means you own the material (bank). If take two kept collapsing into take one's exact phrasing, that story had started fossilising into a script; keep re-telling with forced variation until it flexes.",
      },
    },
    {
      kind: "quick_check",
      heading: "Quick check 1",
      body: "What does an examiner typically do on suspecting a memorised answer?",
      data: {
        options: ["Award marks for the effort of memorising", "Discount it and probe with unexpected follow-up questions", "End the interview early"],
        answer: "Discount it and probe with unexpected follow-up questions",
        explanation: "The examiner must assess YOUR spontaneous English; probes are the tool that gets past the script to reach it.",
      },
    },
    {
      kind: "quick_check",
      heading: "Quick check 2",
      body: "Which preparation is both effective and safe?",
      data: {
        options: ["A word-for-word answer for the 50 most common cue cards", "Frameworks, phrase stems, and a bank of real stories retold in fresh words", "A list of 30 impressive words to insert wherever possible"],
        answer: "Frameworks, phrase stems, and a bank of real stories retold in fresh words",
        explanation: "Transferable structure + owned material survives any follow-up. Scripts and showcase vocabulary both collapse under probing.",
      },
    },
    {
      kind: "key_point",
      heading: "Remember this",
      data: {
        keyPoint: "Never memorise answers — build frameworks, phrase stems, and a bank of real stories you retell in fresh words; scripts get discounted and probed, flexibility gets Band 7.",
      },
    },
    {
      kind: "next_step",
      heading: "Next step",
      body: "Record the same prompt twice with forced re-wording — the anti-script drill is your weekly speaking warm-up from now on.",
      data: { nextHref: SPK, nextLabel: "Record speaking practice" },
    },
  ],
};

export const productiveLessonDefs: LessonDef[] = [
  letterTone,
  letterBullets,
  letterComplaint,
  letterRequest,
  letterApology,
  letterInformal,
  essayOpinion,
  essayDiscussion,
  essayAdvDis,
  essayProblem,
  essayPlanning,
  speakingP1,
  speakingP2,
  speakingP3,
  speakingFluency,
  speakingMemorised,
];
