"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge, Card, EmptyState } from "@/components/ui/surface";
import { CompletionActionPanel } from "@/components/practice/CompletionActionPanel";
import type { RevisionItem } from "@/types/domain";

const grades = ["again", "hard", "good", "easy"] as const;

export function RevisionGrader({
  items: initialItems,
  taskId,
}: {
  items: RevisionItem[];
  taskId?: string | null;
}) {
  const [items, setItems] = useState(initialItems);
  const [gradedCount, setGradedCount] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function grade(itemId: string, value: (typeof grades)[number]) {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/revision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, grade: value }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error?.message ?? "Could not save the grade.");
      }
      setItems((current) => current.filter((item) => item.id !== itemId));
      setGradedCount((count) => count + 1);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (!items.length) {
    // An empty queue still completes a Today warm-up/review task — the user
    // should never be trapped with an uncompletable task.
    if (gradedCount > 0 || taskId) {
      return (
        <CompletionActionPanel
          title={gradedCount > 0 ? "Review session complete" : "Queue already clear"}
          savedNote={
            gradedCount > 0
              ? `You graded ${gradedCount} item${gradedCount === 1 ? "" : "s"}. Each one is rescheduled by how well you knew it.`
              : "Nothing is due right now, so this block counts as done."
          }
          taskId={taskId}
          primaryAction={{ href: "/today", label: "Back to Today's plan" }}
          secondaryActions={[
            { href: "/practice/reading", label: "Reading practice" },
            { href: "/vocabulary", label: "Vocabulary" },
            { href: "/progress", label: "Progress" },
          ]}
        />
      );
    }
    return <EmptyState title="All reviewed" body="Your due queue is clear." />;
  }

  return (
    <div className="space-y-3">
      {error ? <p className="text-sm text-[var(--maple)]" role="alert">{error}</p> : null}
      {items.map((item) => (
        <Card key={item.id} className="space-y-3">
          <Badge>{item.refType}</Badge>
          <h2 className="text-lg font-semibold">{item.title}</h2>
          <p className="text-sm text-[var(--text-muted)]">Due now · interval {item.interval} days</p>
          <div className="grid grid-cols-4 gap-2">
            {grades.map((value) => (
              <Button
                key={value}
                variant="secondary"
                size="sm"
                disabled={busy}
                onClick={() => grade(item.id, value)}
              >
                {value.charAt(0).toUpperCase() + value.slice(1)}
              </Button>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}
