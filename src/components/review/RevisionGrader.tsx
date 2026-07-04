"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge, Card, EmptyState } from "@/components/ui/surface";
import type { RevisionItem } from "@/types/domain";

const grades = ["again", "hard", "good", "easy"] as const;

export function RevisionGrader({ items: initialItems }: { items: RevisionItem[] }) {
  const [items, setItems] = useState(initialItems);
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
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (!items.length) {
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
