"use client";

import { useMemo, useState } from "react";
import { Alert, Card, ProgressBar, Timer } from "@/components/ui/surface";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/form";
import { AI_DISCLAIMER } from "@/lib/ai";
import type { WritingPrompt } from "@/types/domain";

export function WritingPractice({ prompt }: { prompt: WritingPrompt }) {
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [consent, setConsent] = useState(false);
  const words = useMemo(() => text.trim().split(/\s+/).filter(Boolean).length, [text]);
  const target = prompt.task === "task1" ? 150 : 250;
  const estimated = words < target ? "5.5–6.0" : "6.0–6.5";

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
            I understand this writing sample is sensitive practice data. In mock mode it stays local; live storage must support deletion.
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
          <Button onClick={() => setSubmitted(true)} disabled={!consent || words === 0}>
            Submit for feedback
          </Button>
        </div>
        {submitted ? (
          <Card className="border-[var(--warning)] bg-[var(--warning-50)]">
            <p className="font-mono text-xs uppercase text-[var(--text-muted)]">Estimated practice band</p>
            <p className="font-serif text-4xl">{estimated}</p>
            <div className="mt-4 space-y-3">
              {["Task Achievement", "Coherence & Cohesion", "Lexical Resource", "Grammatical Range & Accuracy"].map((criterion, index) => (
                <div key={criterion}>
                  <div className="flex justify-between text-sm"><span>{criterion}</span><span>{index === 3 ? "5.5" : "6.0"}</span></div>
                  <ProgressBar
                    value={index === 3 ? 61 : 66}
                    color="var(--skill-writing)"
                    ariaLabel={`${criterion} estimated score progress`}
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
