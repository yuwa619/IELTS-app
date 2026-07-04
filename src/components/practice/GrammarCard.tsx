"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/surface";
import type { GrammarItem } from "@/types/domain";

// Expandable grammar rule card — the "Explain rule" button now actually
// reveals the examples instead of doing nothing.
export function GrammarCard({ item }: { item: GrammarItem }) {
  const [open, setOpen] = useState(false);
  return (
    <Card className="space-y-3">
      <h2 className="font-semibold">{item.title}</h2>
      <p className="text-sm leading-6 text-[var(--text-muted)]">{item.rule}</p>
      <Button
        variant="secondary"
        size="sm"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? "Hide examples" : "Explain rule"}
      </Button>
      {open ? (
        <ul className="space-y-2 rounded-xl bg-[var(--tint)] p-3 text-sm leading-6">
          {item.examples.map((example) => (
            <li key={example}>“{example}”</li>
          ))}
        </ul>
      ) : null}
    </Card>
  );
}
