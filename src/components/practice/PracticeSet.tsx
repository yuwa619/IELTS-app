"use client";

import { useState } from "react";
import { PracticeQuestionCard } from "@/components/practice/PracticeQuestionCard";
import { CompletionActionPanel } from "@/components/practice/CompletionActionPanel";
import { ProgressBar } from "@/components/ui/surface";
import type { PracticeQuestion } from "@/types/domain";

// Renders a drill set one question at a time and ends with the universal
// completion panel instead of a dead end.
export function PracticeSet({
  questions,
  skillLabel,
  taskId,
  retryHref,
}: {
  questions: PracticeQuestion[];
  skillLabel: string;
  taskId?: string | null;
  retryHref: string;
}) {
  const [index, setIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const done = index >= questions.length;
  const current = questions[index];

  if (!questions.length) return null;

  return (
    <div className="space-y-4">
      <div>
        <ProgressBar
          value={(Math.min(index, questions.length) / questions.length) * 100}
          color="var(--navy-700)"
          ariaLabel={`${skillLabel} set progress`}
        />
        <p className="mt-1 font-mono text-xs text-[var(--text-muted)]">
          {Math.min(index + 1, questions.length)} / {questions.length} questions
        </p>
      </div>
      {!done && current ? (
        <PracticeQuestionCard
          key={current.id}
          question={current}
          onNext={(wasCorrect) => {
            if (wasCorrect) setCorrectCount((value) => value + 1);
            setIndex((value) => value + 1);
          }}
        />
      ) : (
        <CompletionActionPanel
          title={`${skillLabel} set complete`}
          savedNote={`You answered ${correctCount} of ${questions.length} correctly. Wrong answers were added to your review queue.`}
          taskId={taskId}
          primaryAction={{ href: "/review", label: "Review mistakes now" }}
          onRetry={() => {
            window.location.href = retryHref;
          }}
          retryLabel="Practise again"
          secondaryActions={[
            { href: "/today", label: "Today's plan" },
            { href: "/progress", label: "Progress" },
            { href: "/dashboard", label: "Dashboard" },
          ]}
        />
      )}
    </div>
  );
}
