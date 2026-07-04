"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, Card } from "@/components/ui/surface";
import type { PracticeQuestion } from "@/types/domain";

type Result = {
  isCorrect: boolean;
  expected: string | null;
  explanation: string;
  saved?: boolean;
};

export function PracticeQuestionCard({
  question,
  onNext,
}: {
  question: PracticeQuestion;
  onNext?: (wasCorrect: boolean) => void;
}) {
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [startedAt] = useState(() => Date.now());

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/practice/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: question.id,
          response: answer,
          timeMs: Date.now() - startedAt,
        }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(body?.error?.message ?? "Could not save this attempt.");
      }
      setResult(body.data as Result);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="space-y-4">
      {question.payload.passage ? (
        <div className="max-h-56 overflow-auto rounded-xl bg-[var(--tint)] p-4 text-sm leading-6 text-[var(--ink)] lg:max-h-none">
          {question.payload.passage}
        </div>
      ) : null}
      <div>
        <p className="font-mono text-xs uppercase text-[var(--text-muted)]">{question.skill} · {question.questionType.replace("_", " ")}</p>
        <h2 className="mt-2 text-lg font-semibold">{question.prompt}</h2>
        {question.payload.instructions ? <p className="mt-2 text-sm text-[var(--text-muted)]">{question.payload.instructions}</p> : null}
      </div>
      {question.payload.options ? (
        <div className="grid gap-2">
          {question.payload.options.map((option) => (
            <button
              key={option}
              className={`min-h-12 rounded-xl border px-4 text-left ${answer === option ? "border-2 border-[var(--navy-700)] bg-white" : "border-[var(--border)] bg-white"}`}
              onClick={() => setAnswer(option)}
            >
              {option}
            </button>
          ))}
        </div>
      ) : (
        <input
          className="min-h-12 w-full rounded-xl border-[1.5px] border-[var(--border)] px-4 outline-none focus:border-[var(--navy-700)] focus:ring-4 focus:ring-[rgba(27,43,74,.10)]"
          value={answer}
          onChange={(event) => setAnswer(event.target.value)}
          placeholder="Type your answer"
        />
      )}
      <Button onClick={submit} className="w-full" disabled={submitting || !answer}>
        {submitting ? "Checking..." : "Submit"}
      </Button>
      {error ? <p className="text-sm text-[var(--maple)]" role="alert">{error}</p> : null}
      {result ? (
        <>
          <Alert tone={result.isCorrect ? "success" : "danger"} title={result.isCorrect ? "Correct" : "Review this"}>
            {result.explanation}{" "}
            {question.answerKey.evidence ? `Evidence: ${question.answerKey.evidence}` : ""}
            {result.saved === false ? " (Mock mode: not saved to an account.)" : ""}
          </Alert>
          {onNext ? (
            <Button variant="secondary" className="w-full" onClick={() => onNext(result.isCorrect)}>
              Next question
            </Button>
          ) : null}
        </>
      ) : null}
    </Card>
  );
}
