"use client";

import { useMemo, useState } from "react";
import { Alert, Card, ProgressBar } from "@/components/ui/surface";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/form";
import { CountdownTimer } from "@/components/ui/CountdownTimer";
import { CompletionActionPanel } from "@/components/practice/CompletionActionPanel";
import { useCountdown } from "@/hooks/useCountdown";
import { AI_DISCLAIMER } from "@/lib/ai";
import type { WritingPrompt } from "@/types/domain";

type Estimate = {
  criteria: Record<string, number>;
  band: { low: number; high: number; isEstimate: true; disclaimer: string };
};

const criteriaLabels: Record<string, string> = {
  taskAchievement: "Task Achievement",
  coherenceCohesion: "Coherence & Cohesion",
  lexicalResource: "Lexical Resource",
  grammaticalRange: "Grammatical Range & Accuracy",
};

export function WritingPractice({
  prompt,
  taskId,
  nextPromptHref,
}: {
  prompt: WritingPrompt;
  taskId?: string | null;
  nextPromptHref?: string;
}) {
  const timeLimitSeconds = prompt.task === "task1" ? 20 * 60 : 40 * 60;
  const countdown = useCountdown(timeLimitSeconds);
  const [text, setText] = useState("");
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [saved, setSaved] = useState<boolean | null>(null);
  const [overTime, setOverTime] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [consent, setConsent] = useState(false);
  const words = useMemo(() => text.trim().split(/\s+/).filter(Boolean).length, [text]);
  const target = prompt.task === "task1" ? 150 : 250;

  async function submit() {
    setSubmitting(true);
    setError(null);
    const wasOverTime = countdown.expired;
    try {
      const response = await fetch("/api/writing/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promptId: prompt.id,
          text,
          timeMs: countdown.secondsElapsed * 1000,
          startedAt: countdown.startedAtIso,
          timeLimitSeconds,
          overTime: wasOverTime,
        }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(body?.error?.message ?? "Could not save this attempt.");
      }
      setEstimate(body.data.estimate as Estimate);
      setSaved(Boolean(body.data.saved));
      setOverTime(wasOverTime);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="font-mono text-xs uppercase text-[var(--text-muted)]">{prompt.task === "task1" ? "Writing · Task 1" : "Writing · Task 2 counts double"}</p>
          <CountdownTimer countdown={countdown} />
        </div>
        {countdown.expired && !estimate ? (
          <Alert tone="warning">
            Time is up. Your writing is kept — you can still submit, and the attempt will be marked as over-time.
          </Alert>
        ) : null}
        <h2 className="text-xl font-semibold">{prompt.title}</h2>
        <p className="leading-7 text-[var(--ink)]">{prompt.prompt}</p>
        {prompt.bullets.length ? (
          <ul className="space-y-2">
            {prompt.bullets.map((bullet) => (
              <li className="flex gap-2 text-sm text-[var(--text-muted)]" key={bullet}>
                <span className="text-[var(--maple)]">•</span>
                {bullet}
              </li>
            ))}
          </ul>
        ) : (
          <Alert tone="info">Plan your position, two body paragraphs, and conclusion before drafting. Do not memorise a full essay.</Alert>
        )}
      </Card>
      <div className="space-y-4">
        {!estimate ? (
          <Card className="space-y-4">
            <Textarea
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Write your own practice answer here..."
              aria-label="Writing editor"
            />
            <label className="flex gap-3 rounded-xl border border-[var(--border)] bg-[var(--tint)] p-3 text-sm text-[var(--text-muted)]">
              <input
                className="mt-1 h-4 w-4 accent-[var(--navy-700)]"
                type="checkbox"
                checked={consent}
                onChange={(event) => setConsent(event.target.checked)}
              />
              <span>
                I understand this writing sample is sensitive practice data. It is stored in my account, only visible to me, and deletable.
              </span>
            </label>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1">
                <ProgressBar
                  value={(words / target) * 100}
                  color={words >= target ? "var(--success)" : "var(--blue-500)"}
                  ariaLabel={`${prompt.task === "task1" ? "Writing Task 1" : "Writing Task 2"} word count progress`}
                />
                <p className="mt-1 font-mono text-xs text-[var(--text-muted)]">{words} / {target} words</p>
              </div>
              <Button onClick={submit} disabled={!consent || words === 0 || submitting}>
                {submitting ? "Submitting..." : "Submit for feedback"}
              </Button>
            </div>
            {error ? <p className="text-sm text-[var(--maple)]" role="alert">{error}</p> : null}
          </Card>
        ) : (
          <>
            <Card className="border-[var(--warning)] bg-[var(--warning-50)]">
              <p className="font-mono text-xs uppercase text-[var(--text-muted)]">Estimated practice band</p>
              <p className="font-serif text-4xl">
                {estimate.band.low.toFixed(1)}–{estimate.band.high.toFixed(1)}
              </p>
              <p className="mt-1 text-sm">
                {saved === false ? (
                  <span className="text-[var(--text-muted)]">Mock mode: this attempt was not saved to an account.</span>
                ) : (
                  <span className="text-[var(--success)]">Saved to your account.</span>
                )}
                {overTime ? <span className="text-[var(--maple)]"> Submitted over time.</span> : null}
              </p>
              <div className="mt-4 space-y-3">
                {Object.entries(estimate.criteria).map(([key, value]) => (
                  <div key={key}>
                    <div className="flex justify-between text-sm">
                      <span>{criteriaLabels[key] ?? key}</span>
                      <span>{Number(value).toFixed(1)}</span>
                    </div>
                    <ProgressBar
                      value={(Number(value) / 9) * 100}
                      color="var(--skill-writing)"
                      ariaLabel={`${criteriaLabels[key] ?? key} estimated score progress`}
                    />
                  </div>
                ))}
              </div>
              <Alert tone="warning" title="AI estimate">{AI_DISCLAIMER}</Alert>
            </Card>
            <CompletionActionPanel
              title="Writing attempt complete"
              savedNote={
                saved === false
                  ? "Mock mode keeps this attempt local."
                  : "Your attempt and estimate are saved to your progress history."
              }
              xpAwarded={saved ? 25 : 0}
              taskId={taskId}
              primaryAction={
                nextPromptHref
                  ? { href: nextPromptHref, label: "Try another prompt" }
                  : { href: "/today", label: "Back to Today's plan" }
              }
              secondaryActions={[
                { href: "/today", label: "Today's plan" },
                { href: prompt.task === "task1" ? "/practice/writing/task-2" : "/practice/writing/task-1", label: prompt.task === "task1" ? "Writing Task 2" : "Writing Task 1" },
                { href: "/progress", label: "Progress" },
                { href: "/review", label: "Review queue" },
              ]}
            />
          </>
        )}
      </div>
    </div>
  );
}
