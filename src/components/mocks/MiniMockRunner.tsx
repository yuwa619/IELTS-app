"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { Alert, Badge, Card, SkillMeter, Timer } from "@/components/ui/surface";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/form";
import type {
  ErrorLog,
  MockExam,
  PracticeQuestion,
  Skill,
  SpeakingPrompt,
  WritingPrompt,
} from "@/types/domain";

type RunnerMode = "intro" | "runner" | "confirm" | "result" | "review";
type RunnerItem =
  | { id: string; kind: "question"; skill: Skill; title: string; question: PracticeQuestion }
  | { id: string; kind: "writing"; skill: "writing"; title: string; prompt: WritingPrompt }
  | { id: string; kind: "speaking"; skill: "speaking"; title: string; prompt: SpeakingPrompt };

export function MiniMockRunner({
  mock,
  practiceQuestions,
  writingPrompts,
  speakingPrompts,
  errorLogs,
  result,
}: {
  mock: MockExam;
  practiceQuestions: PracticeQuestion[];
  writingPrompts: WritingPrompt[];
  speakingPrompts: SpeakingPrompt[];
  errorLogs: ErrorLog[];
  result: {
    overall: number;
    clb: number;
    skills: Record<Skill, number>;
    recommendation: string;
  };
}) {
  const [mode, setMode] = useState<RunnerMode>("intro");
  const [sectionIndex, setSectionIndex] = useState(0);
  const [itemIndex, setItemIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(mock.totalMinutes * 60);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const sections = mock.sections ?? [];
  const currentSection = sections[sectionIndex] ?? sections[0];
  const sectionItems = useMemo<RunnerItem[]>(() => {
    if (!currentSection) return [];
    const items: RunnerItem[] = [];
    currentSection.itemRefs.forEach((refId) => {
      const question = practiceQuestions.find((item) => item.id === refId);
      if (question) {
        items.push({ id: refId, kind: "question", skill: question.skill, title: question.prompt, question });
        return;
      }
      const writing = writingPrompts.find((item) => item.id === refId);
      if (writing) {
        items.push({ id: refId, kind: "writing", skill: "writing", title: writing.title, prompt: writing });
        return;
      }
      const speaking = speakingPrompts.find((item) => item.id === refId);
      if (speaking) {
        items.push({ id: refId, kind: "speaking", skill: "speaking", title: speaking.prompt, prompt: speaking });
      }
    });
    return items;
  }, [currentSection, practiceQuestions, speakingPrompts, writingPrompts]);
  const currentItem = sectionItems[itemIndex] ?? sectionItems[0];
  const totalItems = sections.reduce((sum, section) => sum + section.itemRefs.length, 0);
  const answeredCount = Object.values(answers).filter(Boolean).length;

  useEffect(() => {
    if (mode !== "runner") return;
    const id = window.setInterval(() => {
      setSecondsLeft((value) => {
        if (value <= 1) {
          window.clearInterval(id);
          setMode("confirm");
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [mode]);

  function formattedTime() {
    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;
    return `${minutes}:${String(seconds).padStart(2, "0")}`;
  }

  function goNext() {
    if (itemIndex < sectionItems.length - 1) {
      setItemIndex((value) => value + 1);
      return;
    }
    if (sectionIndex < sections.length - 1) {
      setSectionIndex((value) => value + 1);
      setItemIndex(0);
      return;
    }
    setMode("confirm");
  }

  function goBack() {
    if (itemIndex > 0) {
      setItemIndex((value) => value - 1);
      return;
    }
    if (sectionIndex > 0) {
      const previousSection = sections[sectionIndex - 1];
      setSectionIndex((value) => value - 1);
      setItemIndex(Math.max(0, previousSection.itemRefs.length - 1));
    }
  }

  function resetMock() {
    setMode("intro");
    setSectionIndex(0);
    setItemIndex(0);
    setSecondsLeft(mock.totalMinutes * 60);
    setAnswers({});
  }

  if (mode === "intro") {
    return (
      <div className="space-y-5">
        <Card className="space-y-4">
          <Badge tone="maple">Mini mock</Badge>
          <h2 className="font-serif text-4xl">{mock.title}</h2>
          <p className="text-[var(--text-muted)]">
            A short timed check across the four skills. This is not a full IELTS simulation; it is a focused readiness snapshot for today&apos;s plan.
          </p>
          <Alert tone="warning">
            Timers cannot pause once started. Find a quiet block and answer from your own ability, not memorised scripts.
          </Alert>
          <div className="grid gap-3 sm:grid-cols-2">
            {sections.map((section) => (
              <div className="rounded-xl bg-[var(--tint)] p-3" key={section.id}>
                <Badge tone={section.skill}>{section.skill}</Badge>
                <p className="mt-2 font-semibold">{section.itemRefs.length} item{section.itemRefs.length === 1 ? "" : "s"}</p>
                <p className="font-mono text-xs text-[var(--text-muted)]">{Math.round(section.timeLimitS / 60)} min</p>
              </div>
            ))}
          </div>
          <Button variant="danger" className="w-full" onClick={() => setMode("runner")}>
            Start mini mock
          </Button>
        </Card>
      </div>
    );
  }

  if (mode === "confirm") {
    return (
      <Card className="space-y-4">
        <AlertTriangle className="h-7 w-7 text-[var(--maple)]" aria-hidden />
        <h2 className="font-serif text-3xl">Submit this mini mock?</h2>
        <p className="text-[var(--text-muted)]">
          You answered {answeredCount} of {totalItems} items. Submit to see your estimated result, error log, and retake recommendation.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Button variant="outline" onClick={() => setMode("runner")}>Return to questions</Button>
          <Button onClick={() => setMode("result")}>Submit mock</Button>
        </div>
      </Card>
    );
  }

  if (mode === "result" || mode === "review") {
    return (
      <div className="space-y-5">
        <Card className="space-y-4">
          <Badge tone="success">Mock result snapshot</Badge>
          <p className="font-serif text-5xl">{result.overall.toFixed(1)}</p>
          <p className="text-[var(--text-muted)]">≈ CLB {result.clb} · eligible · target CLB 9</p>
          <div className="grid gap-4 sm:grid-cols-2">
            {Object.entries(result.skills).map(([skill, value]) => (
              <SkillMeter
                key={skill}
                label={skill}
                value={value}
                target={skill === "listening" ? 8 : 7}
                color={`var(--skill-${skill})`}
              />
            ))}
          </div>
          <Alert tone="info">{result.recommendation}</Alert>
          <div className="grid gap-3 sm:grid-cols-3">
            <Button onClick={() => setMode("review")}>Review mistakes</Button>
            <Button variant="secondary" icon={<RotateCcw className="h-4 w-4" />} onClick={resetMock}>
              Retake later
            </Button>
            <Button variant="outline" onClick={() => setMode("runner")}>Back to answers</Button>
          </div>
        </Card>

        {mode === "review" ? (
          <Card className="space-y-3">
            <h2 className="text-xl font-semibold">Error log</h2>
            {errorLogs.map((entry) => (
              <div className="rounded-xl border border-[var(--border)] p-3" key={entry.id}>
                <Badge tone={entry.skill}>{entry.skill}</Badge>
                <p className="mt-2 font-semibold">{entry.category.replace(/_/g, " ")}</p>
                <p className="text-sm text-[var(--text-muted)]">{entry.note}</p>
              </div>
            ))}
            <Alert tone="warning">
              Retake recommendation: repair the top writing and reading errors, then repeat a mini mock after two focused review sessions.
            </Alert>
          </Card>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Card className="space-y-4 border-2 border-[var(--navy-700)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Badge tone={currentSection.skill}>{currentSection.skill}</Badge>
            <h2 className="mt-2 text-xl font-semibold">
              Section {sectionIndex + 1} of {sections.length}
            </h2>
          </div>
          <Timer>{formattedTime()}</Timer>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1" aria-label="Section navigation">
          {sections.map((section, index) => (
            <button
              key={section.id}
              className={`min-h-11 rounded-full px-4 text-sm font-semibold ${
                index === sectionIndex ? "bg-[var(--navy-700)] text-white" : "bg-[var(--tint)] text-[var(--ink)]"
              }`}
              onClick={() => {
                setSectionIndex(index);
                setItemIndex(0);
              }}
            >
              {section.skill}
            </button>
          ))}
        </div>
      </Card>

      <Card className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <p className="font-mono text-xs uppercase text-[var(--text-muted)]">
            Item {itemIndex + 1} of {sectionItems.length}
          </p>
          {answers[currentItem.id] ? <Badge tone="success">Answered</Badge> : <Badge>Blank</Badge>}
        </div>
        <MockItem item={currentItem} value={answers[currentItem.id] ?? ""} onChange={(value) => setAnswers((current) => ({ ...current, [currentItem.id]: value }))} />
        <div className="grid grid-cols-3 gap-2">
          <Button variant="outline" onClick={goBack} disabled={sectionIndex === 0 && itemIndex === 0} icon={<ChevronLeft className="h-4 w-4" />}>
            Back
          </Button>
          <Button variant="secondary" onClick={() => setAnswers((current) => ({ ...current, [currentItem.id]: "" }))}>
            Clear
          </Button>
          <Button onClick={goNext} icon={<ChevronRight className="h-4 w-4" />}>
            Next
          </Button>
        </div>
      </Card>
    </div>
  );
}

function MockItem({
  item,
  value,
  onChange,
}: {
  item: RunnerItem;
  value: string;
  onChange: (value: string) => void;
}) {
  if (item.kind === "question") {
    const question = item.question;
    return (
      <div className="space-y-4">
        {question.payload.passage ? (
          <div className="max-h-56 overflow-auto rounded-xl bg-[var(--tint)] p-4 text-sm leading-6">
            {question.payload.passage}
          </div>
        ) : null}
        {question.payload.transcript ? (
          <div className="rounded-xl bg-[var(--navy-700)] p-4 text-white">
            <p className="font-mono text-xs text-white/70">Audio transcript placeholder</p>
            <p className="mt-2 text-sm leading-6 text-white/85">{question.payload.transcript}</p>
          </div>
        ) : null}
        <div>
          <p className="font-mono text-xs uppercase text-[var(--text-muted)]">{question.questionType.replace("_", " ")}</p>
          <h3 className="mt-2 text-lg font-semibold">{question.prompt}</h3>
          {question.payload.instructions ? <p className="mt-2 text-sm text-[var(--text-muted)]">{question.payload.instructions}</p> : null}
        </div>
        {question.payload.options ? (
          <div className="grid gap-2">
            {question.payload.options.map((option) => (
              <button
                key={option}
                className={`min-h-12 rounded-xl border px-4 text-left ${
                  value === option ? "border-2 border-[var(--navy-700)] bg-white" : "border-[var(--border)] bg-white"
                }`}
                onClick={() => onChange(option)}
              >
                {option}
              </button>
            ))}
          </div>
        ) : (
          <input
            className="min-h-12 w-full rounded-xl border-[1.5px] border-[var(--border)] px-4 outline-none focus:border-[var(--navy-700)] focus:ring-4 focus:ring-[rgba(27,43,74,.10)]"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="Type your answer"
          />
        )}
      </div>
    );
  }

  if (item.kind === "writing") {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{item.prompt.title}</h3>
        <p className="leading-7">{item.prompt.prompt}</p>
        {item.prompt.bullets.length ? (
          <ul className="space-y-2 text-sm text-[var(--text-muted)]">
            {item.prompt.bullets.map((bullet) => <li key={bullet}>• {bullet}</li>)}
          </ul>
        ) : null}
        <Textarea value={value} onChange={(event) => onChange(event.target.value)} aria-label="Mock writing answer" placeholder="Write your own mock response..." />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{item.prompt.prompt}</h3>
      <ul className="space-y-2 text-sm text-[var(--text-muted)]">
        {item.prompt.cuePoints.map((point) => <li key={point}>• {point}</li>)}
      </ul>
      <Alert tone="info">
        MVP speaking mock: record on the Speaking screen later. For this mini mock, type cue notes or a self-review summary.
      </Alert>
      <Textarea value={value} onChange={(event) => onChange(event.target.value)} aria-label="Mock speaking notes" placeholder="Add short cue notes or self-review..." />
    </div>
  );
}
