"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, Card } from "@/components/ui/surface";
import type { PracticeQuestion } from "@/types/domain";

export function PracticeQuestionCard({ question }: { question: PracticeQuestion }) {
  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const expected = Array.isArray(question.answerKey.answer) ? question.answerKey.answer[0] : question.answerKey.answer;
  const correct = answer.trim().toLowerCase() === String(expected).trim().toLowerCase();

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
      <Button onClick={() => setSubmitted(true)} className="w-full">Submit</Button>
      {submitted ? (
        <Alert tone={correct ? "success" : "danger"} title={correct ? "Correct" : "Review this"}>
          {question.explanation} {question.answerKey.evidence ? `Evidence: ${question.answerKey.evidence}` : ""}
        </Alert>
      ) : null}
    </Card>
  );
}
