"use client";

import { useState } from "react";
import { CheckCircle2, ChevronRight } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Badge, Card } from "@/components/ui/surface";
import type { DailyTask } from "@/types/domain";

// Starting a task carries ?taskId= so the activity can mark it complete on
// finish (the CompletionActionPanel posts /api/tasks/complete once).
function taskHref(task: DailyTask) {
  if (task.refType === "lesson") return `/lessons/${task.refId}?taskId=${task.id}`;
  if (task.refType === "revision" || task.refType === "review") return `/review?taskId=${task.id}`;
  if (task.refType === "practice") return `/practice/writing/task-1?taskId=${task.id}`;
  return "/today";
}

export function TaskList({ tasks: initialTasks }: { tasks: DailyTask[] }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function complete(taskId: string) {
    setBusyId(taskId);
    setError(null);
    try {
      const response = await fetch("/api/tasks/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error?.message ?? "Could not save completion.");
      }
      setTasks((current) =>
        current.map((task) => (task.id === taskId ? { ...task, status: "done" } : task)),
      );
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-3">
      {error ? (
        <p className="text-sm text-[var(--maple)]" role="alert">{error}</p>
      ) : null}
      {tasks.map((task) => (
        <Card key={task.id} className="flex items-center gap-4">
          <span
            className={`flex h-9 w-9 items-center justify-center rounded-full ${task.status === "done" ? "bg-[var(--success-50)] text-[var(--success)]" : "bg-[var(--tint)] text-[var(--navy-700)]"}`}
          >
            {task.status === "done" ? <CheckCircle2 className="h-5 w-5" /> : task.block[0].toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold">{task.title}</h2>
            <p className="text-sm text-[var(--text-muted)]">{task.estMinutes} min · +{task.xp} XP</p>
          </div>
          {task.status === "done" ? (
            <Badge tone="success">Done</Badge>
          ) : (
            <div className="flex items-center gap-2">
              <ButtonLink href={taskHref(task)} variant="secondary">Start</ButtonLink>
              <Button
                size="sm"
                variant="outline"
                disabled={busyId === task.id}
                onClick={() => complete(task.id)}
              >
                {busyId === task.id ? "Saving..." : "Mark done"}
              </Button>
            </div>
          )}
          <ChevronRight className="h-4 w-4 text-[var(--text-faint)]" />
        </Card>
      ))}
    </div>
  );
}
