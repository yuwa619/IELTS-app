"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CompletionActionPanel } from "@/components/practice/CompletionActionPanel";

export function CompleteLessonButton({
  lessonId,
  completed,
  taskId,
}: {
  lessonId: string;
  completed?: boolean;
  taskId?: string | null;
}) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "saving" | "done" | "error">(
    completed ? "done" : "idle",
  );
  const [justCompleted, setJustCompleted] = useState(false);
  const [xp, setXp] = useState(0);
  const [message, setMessage] = useState<string | null>(null);

  async function complete() {
    setState("saving");
    setMessage(null);
    try {
      const response = await fetch("/api/lessons/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(body?.error?.message ?? "Could not save lesson completion.");
      }
      setState("done");
      setJustCompleted(true);
      setXp(Number(body?.data?.xpAwarded ?? 0));
      router.refresh();
    } catch (error) {
      setState("error");
      setMessage((error as Error).message);
    }
  }

  if (justCompleted) {
    return (
      <CompletionActionPanel
        title="Lesson complete"
        savedNote="Your lesson progress is saved."
        xpAwarded={xp}
        taskId={taskId}
        primaryAction={{ href: "/lessons", label: "Next lesson" }}
        secondaryActions={[
          { href: "/today", label: "Today's plan" },
          { href: "/review", label: "Review queue" },
          { href: "/progress", label: "Progress" },
        ]}
      />
    );
  }

  return (
    <div className="space-y-2">
      <Button
        className="w-full"
        disabled={state === "saving" || state === "done"}
        onClick={complete}
      >
        {state === "done" ? "Completed ✓" : state === "saving" ? "Saving..." : "Mark complete"}
      </Button>
      {message ? (
        <p
          className={`text-sm ${state === "error" ? "text-[var(--maple)]" : "text-[var(--success)]"}`}
          role={state === "error" ? "alert" : "status"}
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
