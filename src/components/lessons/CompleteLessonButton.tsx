"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function CompleteLessonButton({
  lessonId,
  completed,
}: {
  lessonId: string;
  completed?: boolean;
}) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "saving" | "done" | "error">(
    completed ? "done" : "idle",
  );
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
      if (body?.data?.xpAwarded) setMessage(`+${body.data.xpAwarded} XP`);
      router.refresh();
    } catch (error) {
      setState("error");
      setMessage((error as Error).message);
    }
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
