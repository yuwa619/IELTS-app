"use client";

import { useMemo, useState } from "react";
import { Alert, Card, ProgressBar, Timer } from "@/components/ui/surface";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/form";
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

export function WritingPractice({ prompt }: { prompt: WritingPrompt }) {
  const [text, setText] = useState("");
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [saved, setSaved] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [consent, setConsent] = useState(false);
  const [startedAt] = useState(() => Date.now());
  const words = useMemo(() => text.trim().split(/\s+/).filter(Boolean).length, [text]);
  const target = prompt.task === "task1" ? 150 : 250;

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/writing/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promptId: prompt.id,
          text,
          timeMs: Date.now() - startedAt,
        }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(body?.error?.message ?? "Could not save this attempt.");
      }
      setEstimate(body.data.estimate as Estimate);
      setSaved(Boolean(body.data.saved));
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
          <Timer>{prompt.task === "task1" ? "20:00" : "40:00"}</Timer>
        </div>
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
        {estimate ? (
          <Card className="border-[var(--warning)] bg-[var(--warning-50)]">
            <p className="font-mono text-xs uppercase text-[var(--text-muted)]">Estimated practice band</p>
            <p className="font-serif text-4xl">
              {estimate.band.low.toFixed(1)}–{estimate.band.high.toFixed(1)}
            </p>
            {saved === false ? (
              <p className="mt-1 text-sm text-[var(--text-muted)]">Mock mode: this attempt was not saved to an account.</p>
            ) : (
              <p className="mt-1 text-sm text-[var(--success)]">Saved to your account.</p>
            )}
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
        ) : null}
      </Card>
    </div>
  );
}
