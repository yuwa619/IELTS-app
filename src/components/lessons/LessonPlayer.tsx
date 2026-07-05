"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  Flag,
  HelpCircle,
  Lightbulb,
  ListChecks,
  MapPin,
  PencilLine,
  Star,
} from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Alert, Badge, Card, ProgressBar } from "@/components/ui/surface";
import { CompletionActionPanel } from "@/components/practice/CompletionActionPanel";
import { cn } from "@/lib/utils/cn";
import type { Lesson, LessonSection } from "@/types/domain";

// Interactive lesson module: teaching blocks, worked examples, mistake
// callouts, guided practice with model reveal, quick checks with feedback,
// a working "Save key point", and a completion panel that always offers a
// next action (never a dead end).

interface CheckState {
  selected: string | null;
  submitted: boolean;
}

function fallbackPracticeHref(lesson: Lesson): { href: string; label: string } {
  if (lesson.module === "Writing Task 1") return { href: "/practice/writing/task-1", label: "Continue to letter practice" };
  if (lesson.module === "Writing Task 2") return { href: "/practice/writing/task-2", label: "Continue to essay practice" };
  if (lesson.module === "Revision") return { href: "/review", label: "Open review queue" };
  const bySkill: Record<Lesson["skill"], { href: string; label: string }> = {
    listening: { href: "/practice/listening", label: "Continue to Listening practice" },
    reading: { href: "/practice/reading", label: "Continue to Reading practice" },
    writing: { href: "/practice/writing/task-1", label: "Continue to Writing practice" },
    speaking: { href: "/practice/speaking", label: "Continue to Speaking practice" },
  };
  return bySkill[lesson.skill];
}

const KIND_META: Record<
  string,
  { label: string; icon: typeof BookOpen }
> = {
  intro: { label: "Overview", icon: BookOpen },
  objectives: { label: "You will learn", icon: ListChecks },
  explanation: { label: "Teaching", icon: BookOpen },
  gt_relevance: { label: "IELTS GT relevance", icon: MapPin },
  example: { label: "Worked example", icon: Lightbulb },
  mistake: { label: "Common mistake", icon: AlertTriangle },
  strategy: { label: "Strategy", icon: Flag },
  checklist: { label: "Checklist", icon: ClipboardList },
  guided_practice: { label: "Guided practice", icon: PencilLine },
  quick_check: { label: "Quick check", icon: HelpCircle },
  reflection: { label: "Reflect", icon: Star },
  key_point: { label: "Remember this", icon: Star },
  next_step: { label: "Next step", icon: ArrowRight },
};

export function LessonPlayer({
  lesson,
  taskId,
  nextLesson,
}: {
  lesson: Lesson & { completed?: boolean };
  taskId?: string | null;
  nextLesson?: { id: string; title: string } | null;
}) {
  const router = useRouter();
  const sections = useMemo(
    () => [...(lesson.sections ?? [])].sort((a, b) => a.order - b.order),
    [lesson.sections],
  );

  const [checks, setChecks] = useState<Record<string, CheckState>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [keyPointState, setKeyPointState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [completeState, setCompleteState] = useState<"idle" | "saving" | "done" | "error">(
    lesson.completed ? "done" : "idle",
  );
  const [justCompleted, setJustCompleted] = useState(false);
  const [xp, setXp] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const interactive = sections.filter(
    (section) => section.kind === "quick_check" || section.kind === "guided_practice",
  );
  const doneCount = interactive.filter((section) =>
    section.kind === "quick_check" ? checks[section.id]?.submitted : revealed[section.id],
  ).length;
  const progressPct = interactive.length ? (doneCount / interactive.length) * 100 : 0;

  const practice = useMemo(() => {
    const nextStep = sections.find((section) => section.kind === "next_step");
    if (nextStep?.data?.nextHref) {
      return { href: nextStep.data.nextHref, label: nextStep.data.nextLabel ?? "Continue to practice" };
    }
    return fallbackPracticeHref(lesson);
  }, [sections, lesson]);

  async function saveKeyPoint(note: string) {
    setKeyPointState("saving");
    try {
      const response = await fetch("/api/revision/key-point", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId: lesson.id, title: lesson.title, note }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error?.message ?? "Could not save the key point.");
      }
      setKeyPointState("saved");
    } catch (error) {
      setKeyPointState("error");
      setErrorMessage((error as Error).message);
    }
  }

  async function completeLesson() {
    setCompleteState("saving");
    setErrorMessage(null);
    try {
      const response = await fetch("/api/lessons/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId: lesson.id }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(body?.error?.message ?? "Could not save lesson completion.");
      }
      setCompleteState("done");
      setJustCompleted(true);
      setXp(Number(body?.data?.xpAwarded ?? 0));
      router.refresh();
    } catch (error) {
      setCompleteState("error");
      setErrorMessage((error as Error).message);
    }
  }

  function renderSection(section: LessonSection) {
    const meta = KIND_META[section.kind] ?? KIND_META.explanation;
    const Icon = meta.icon;

    const header = (
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-[var(--navy-700)]" aria-hidden />
        <p className="font-mono text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
          {meta.label}
        </p>
      </div>
    );

    switch (section.kind) {
      case "objectives":
      case "strategy":
      case "checklist":
        return (
          <Card key={section.id} id={section.id} className="space-y-3">
            {header}
            <h2 className="text-lg font-semibold">{section.heading}</h2>
            {section.body ? <p className="leading-7 text-[var(--text-muted)]">{section.body}</p> : null}
            <ul className="space-y-2">
              {(section.data?.items ?? []).map((item, index) => (
                <li key={index} className="flex gap-2.5 text-[15px] leading-6 text-[var(--ink)]">
                  <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[var(--success)]" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Card>
        );

      case "example":
        return (
          <Card key={section.id} id={section.id} className="space-y-3 border-l-4 border-l-[var(--blue-500)]">
            {header}
            <h2 className="text-lg font-semibold">{section.heading}</h2>
            {section.body ? <p className="leading-7 text-[var(--text-muted)]">{section.body}</p> : null}
            {section.data?.sample ? (
              <div className="whitespace-pre-line rounded-xl bg-[var(--tint)] p-3.5 text-[15px] leading-7">
                {section.data.sample}
              </div>
            ) : null}
            {section.data?.note ? (
              <p className="text-sm leading-6 text-[var(--text-muted)]">{section.data.note}</p>
            ) : null}
          </Card>
        );

      case "mistake":
        return (
          <div key={section.id} id={section.id}>
            <Alert tone="warning" title={section.heading}>
              {section.body}
            </Alert>
          </div>
        );

      case "guided_practice": {
        const isRevealed = Boolean(revealed[section.id]);
        return (
          <Card key={section.id} id={section.id} className="space-y-3 border-2 border-[var(--navy-700)]/15">
            {header}
            <h2 className="text-lg font-semibold">{section.heading}</h2>
            {section.body ? <p className="leading-7 text-[var(--text-muted)]">{section.body}</p> : null}
            {section.data?.task ? (
              <div className="rounded-xl bg-[var(--tint)] p-3.5 text-[15px] leading-7">{section.data.task}</div>
            ) : null}
            {isRevealed ? (
              <div className="space-y-2 rounded-xl border border-[var(--border)] p-3.5">
                <p className="font-mono text-[11px] font-semibold uppercase text-[var(--text-muted)]">Model approach</p>
                <p className="text-[15px] leading-7">{section.data?.modelAnswer}</p>
              </div>
            ) : (
              <Button variant="secondary" onClick={() => setRevealed((r) => ({ ...r, [section.id]: true }))}>
                Show model approach
              </Button>
            )}
          </Card>
        );
      }

      case "quick_check": {
        const state = checks[section.id] ?? { selected: null, submitted: false };
        const options = section.data?.options ?? [];
        const correct = section.data?.answer;
        const isCorrect = state.submitted && state.selected === correct;
        return (
          <Card key={section.id} id={section.id} className="space-y-3 border-2 border-[var(--navy-700)]/15">
            {header}
            <h2 className="text-lg font-semibold">{section.heading}</h2>
            <p className="leading-7">{section.body}</p>
            <div className="space-y-2" role="radiogroup" aria-label={section.heading}>
              {options.map((option) => {
                const selected = state.selected === option;
                const showCorrect = state.submitted && option === correct;
                const showWrong = state.submitted && selected && option !== correct;
                return (
                  <button
                    key={option}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    disabled={state.submitted}
                    onClick={() =>
                      setChecks((c) => ({ ...c, [section.id]: { selected: option, submitted: false } }))
                    }
                    className={cn(
                      "w-full rounded-xl border px-4 py-3 text-left text-[15px] leading-6 transition focus-visible:cb-focus",
                      selected && !state.submitted
                        ? "border-2 border-[var(--navy-700)] bg-white font-semibold"
                        : "border-[var(--border)] bg-white",
                      showCorrect && "border-2 border-[var(--success)] bg-[var(--success-50)] font-semibold",
                      showWrong && "border-2 border-[var(--maple)] bg-[var(--maple-50)]",
                      state.submitted && "cursor-default",
                    )}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
            {!state.submitted ? (
              <Button
                size="sm"
                disabled={!state.selected}
                onClick={() =>
                  setChecks((c) => ({
                    ...c,
                    [section.id]: { selected: state.selected, submitted: true },
                  }))
                }
              >
                Check answer
              </Button>
            ) : (
              <Alert tone={isCorrect ? "success" : "warning"} title={isCorrect ? "Correct" : `Answer: ${correct}`}>
                {section.data?.explanation}
              </Alert>
            )}
          </Card>
        );
      }

      case "key_point": {
        const keyPoint = section.data?.keyPoint ?? section.body;
        return (
          <Card key={section.id} id={section.id} className="space-y-3 border-2 border-[var(--navy-700)] bg-[var(--tint)]/40">
            {header}
            <h2 className="text-lg font-semibold">{section.heading}</h2>
            <p className="text-[15px] font-medium leading-7">{keyPoint}</p>
            {keyPointState === "saved" ? (
              <p className="text-sm text-[var(--success)]" role="status">
                Saved — it will appear in your review queue. ✓
              </p>
            ) : (
              <Button
                variant="outline"
                size="sm"
                disabled={keyPointState === "saving"}
                onClick={() => saveKeyPoint(keyPoint)}
              >
                {keyPointState === "saving" ? "Saving..." : "Save key point"}
              </Button>
            )}
            {keyPointState === "error" && errorMessage ? (
              <p className="text-sm text-[var(--maple)]" role="alert">{errorMessage}</p>
            ) : null}
          </Card>
        );
      }

      case "next_step":
        return (
          <Card key={section.id} id={section.id} className="space-y-3">
            {header}
            <h2 className="text-lg font-semibold">{section.heading}</h2>
            {section.body ? <p className="leading-7 text-[var(--text-muted)]">{section.body}</p> : null}
            <ButtonLink href={practice.href} variant="secondary" size="sm">
              {practice.label}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </ButtonLink>
          </Card>
        );

      case "gt_relevance":
        return (
          <Card key={section.id} id={section.id} className="space-y-2 border-l-4 border-l-[var(--maple)]">
            {header}
            <h2 className="text-lg font-semibold">{section.heading}</h2>
            <p className="leading-7 text-[var(--text-muted)]">{section.body}</p>
          </Card>
        );

      default:
        // intro, explanation, reflection: readable teaching prose
        return (
          <Card key={section.id} id={section.id} className="space-y-2">
            {header}
            <h2 className="text-lg font-semibold">{section.heading}</h2>
            <p className="leading-7 text-[var(--text-muted)]">{section.body}</p>
          </Card>
        );
    }
  }

  const secondaryActions = [
    ...(nextLesson ? [{ href: `/lessons/${nextLesson.id}`, label: `Next lesson: ${nextLesson.title}` }] : []),
    { href: "/today", label: "Back to Today" },
    { href: "/progress", label: "Go to Progress" },
  ];

  return (
    <div className="gap-6 xl:grid xl:grid-cols-[minmax(0,1fr)_240px]">
      <div className="space-y-4">
        {/* Sticky progress through the lesson's activities */}
        <div className="sticky top-0 z-10 -mx-1 rounded-b-xl bg-[var(--bg)]/95 px-1 py-2 backdrop-blur">
          <div className="mb-1.5 flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span className="font-semibold uppercase tracking-wide">Lesson progress</span>
            <span className="font-mono">
              {doneCount}/{interactive.length} activities
            </span>
          </div>
          <ProgressBar value={progressPct} ariaLabel="Lesson activity progress" />
        </div>

        {sections.map(renderSection)}

        {/* Completion — always ends with somewhere to go */}
        {justCompleted ? (
          <CompletionActionPanel
            title="Lesson complete"
            savedNote="Your progress is saved to your account."
            xpAwarded={xp}
            taskId={taskId}
            primaryAction={{ href: practice.href, label: practice.label }}
            secondaryActions={secondaryActions}
          />
        ) : completeState === "done" ? (
          <Card className="space-y-3 border-2 border-[var(--success)]/40">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-[var(--success)]" aria-hidden />
              <h2 className="text-lg font-semibold">You&apos;ve completed this lesson</h2>
              <Badge tone="success">Done</Badge>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <ButtonLink href={practice.href} className="w-full">{practice.label}</ButtonLink>
              {nextLesson ? (
                <ButtonLink href={`/lessons/${nextLesson.id}`} variant="secondary" className="w-full">
                  Next lesson
                </ButtonLink>
              ) : (
                <ButtonLink href="/lessons" variant="secondary" className="w-full">
                  All lessons
                </ButtonLink>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <ButtonLink href="/today" variant="outline" size="sm">Back to Today</ButtonLink>
              <ButtonLink href="/progress" variant="outline" size="sm">Go to Progress</ButtonLink>
            </div>
          </Card>
        ) : (
          <div className="space-y-2">
            {doneCount < interactive.length ? (
              <p className="text-sm text-[var(--text-muted)]">
                You&apos;ve finished {doneCount} of {interactive.length} activities — try the quick checks
                before completing.
              </p>
            ) : null}
            <Button
              className="w-full"
              disabled={completeState === "saving"}
              onClick={completeLesson}
            >
              {completeState === "saving" ? "Saving..." : "Mark complete"}
            </Button>
            {completeState === "error" && errorMessage ? (
              <p className="text-sm text-[var(--maple)]" role="alert">{errorMessage}</p>
            ) : null}
          </div>
        )}
      </div>

      {/* Desktop outline rail */}
      <nav className="hidden xl:block" aria-label="Lesson outline">
        <div className="sticky top-4 space-y-1 rounded-2xl border border-[var(--border)] bg-white p-4">
          <p className="mb-2 font-mono text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
            In this lesson
          </p>
          {sections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="block rounded-lg px-2 py-1.5 text-sm text-[var(--text-muted)] hover:bg-[var(--tint)] hover:text-[var(--ink)] focus-visible:cb-focus"
            >
              {section.heading}
            </a>
          ))}
        </div>
      </nav>
    </div>
  );
}
