"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Badge, Card } from "@/components/ui/surface";

export interface NextAction {
  href: string;
  label: string;
}

// Universal end-of-activity panel: saved status, XP, one primary next action,
// secondary navigation. If the activity was started from Today's plan
// (?taskId=...), it marks that daily task complete exactly once — the server
// XP ledger is idempotent, so retries and re-renders cannot double-award.
export function CompletionActionPanel({
  title = "Nice work — what's next?",
  savedNote,
  xpAwarded,
  taskId,
  primaryAction,
  secondaryActions,
  onRetry,
  retryLabel = "Try another",
}: {
  title?: string;
  savedNote?: string;
  xpAwarded?: number;
  taskId?: string | null;
  primaryAction?: NextAction;
  secondaryActions?: NextAction[];
  onRetry?: () => void;
  retryLabel?: string;
}) {
  const router = useRouter();
  const [taskState, setTaskState] = useState<"idle" | "saving" | "done" | "failed">("idle");
  const completedOnce = useRef(false);

  useEffect(() => {
    if (!taskId || completedOnce.current) return;
    completedOnce.current = true;
    setTaskState("saving");
    fetch("/api/tasks/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId }),
    })
      .then((response) => {
        setTaskState(response.ok ? "done" : "failed");
        if (response.ok) router.refresh();
      })
      .catch(() => setTaskState("failed"));
  }, [taskId, router]);

  const secondary = secondaryActions ?? [
    { href: "/today", label: "Today's plan" },
    { href: "/progress", label: "Progress" },
    { href: "/dashboard", label: "Dashboard" },
  ];

  return (
    <Card className="space-y-4 border-2 border-[var(--navy-700)]">
      <div className="flex flex-wrap items-center gap-2">
        <CheckCircle2 className="h-5 w-5 text-[var(--success)]" aria-hidden />
        <h2 className="text-lg font-semibold">{title}</h2>
        {typeof xpAwarded === "number" && xpAwarded > 0 ? (
          <Badge tone="success">+{xpAwarded} XP</Badge>
        ) : null}
      </div>
      {savedNote ? <p className="text-sm text-[var(--text-muted)]">{savedNote}</p> : null}
      {taskId ? (
        <p className="text-sm" role="status">
          {taskState === "done" && (
            <span className="text-[var(--success)]">Today&apos;s task marked complete ✓</span>
          )}
          {taskState === "saving" && <span className="text-[var(--text-muted)]">Updating today&apos;s plan...</span>}
          {taskState === "failed" && (
            <span className="text-[var(--maple)]">Could not update today&apos;s task — it may already be complete.</span>
          )}
        </p>
      ) : null}
      <div className="grid gap-2 sm:grid-cols-2">
        {primaryAction ? (
          <ButtonLink href={primaryAction.href} className="w-full">
            {primaryAction.label}
          </ButtonLink>
        ) : null}
        {onRetry ? (
          <Button variant="secondary" className="w-full" onClick={onRetry}>
            {retryLabel}
          </Button>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-2">
        {secondary.map((action) => (
          <ButtonLink key={action.href} href={action.href} variant="outline" size="sm">
            {action.label}
          </ButtonLink>
        ))}
      </div>
    </Card>
  );
}
