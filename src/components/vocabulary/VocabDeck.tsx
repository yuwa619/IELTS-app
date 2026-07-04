"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge, Card, EmptyState } from "@/components/ui/surface";
import type { VocabularyItem } from "@/types/domain";

const grades = ["again", "hard", "good", "easy"] as const;

export function VocabDeck({ words }: { words: VocabularyItem[] }) {
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const word = words[index];

  async function grade(value: (typeof grades)[number]) {
    if (!word) return;
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/vocabulary/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: word.id, grade: value }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error?.message ?? "Could not save the grade.");
      }
      setRevealed(false);
      setIndex((current) => current + 1);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (!word) {
    return <EmptyState title="Deck complete" body="You graded every card in this session. Come back when reviews are due." />;
  }

  return (
    <Card className="space-y-5 text-center">
      <Badge>{word.cefr} · {word.topic}</Badge>
      <p className="font-serif text-5xl">{word.term}</p>
      <p className="font-mono text-sm text-[var(--text-muted)]">{word.ipa}</p>
      {revealed ? (
        <>
          <p className="mx-auto max-w-md text-lg leading-8">{word.definition}.</p>
          <p className="text-[var(--text-muted)]">“{word.example}”</p>
          <div className="grid grid-cols-4 gap-2">
            {grades.map((value) => (
              <Button
                key={value}
                variant="secondary"
                size="sm"
                disabled={busy}
                onClick={() => grade(value)}
              >
                {value.charAt(0).toUpperCase() + value.slice(1)}
              </Button>
            ))}
          </div>
        </>
      ) : (
        <Button className="w-full" onClick={() => setRevealed(true)}>
          Show definition
        </Button>
      )}
      {error ? <p className="text-sm text-[var(--maple)]" role="alert">{error}</p> : null}
    </Card>
  );
}
