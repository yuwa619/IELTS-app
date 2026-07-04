"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/form";
import type { UserProfile } from "@/types/domain";

export function ProfileForm({ profile }: { profile: UserProfile }) {
  const [displayName, setDisplayName] = useState(profile.displayName ?? "");
  const [dailyMinutes, setDailyMinutes] = useState(profile.dailyMinutes);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function save() {
    setState("saving");
    setMessage(null);
    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: displayName || undefined, dailyMinutes }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(body?.error?.message ?? "Could not save your settings.");
      }
      setState("saved");
      setMessage("Saved to your account.");
    } catch (error) {
      setState("error");
      setMessage((error as Error).message);
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="display-name">Name</Label>
        <Input
          id="display-name"
          value={displayName}
          onChange={(event) => {
            setDisplayName(event.target.value);
            setState("idle");
          }}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="daily-minutes">Daily study time</Label>
        <Select
          id="daily-minutes"
          value={String(dailyMinutes)}
          onChange={(event) => {
            setDailyMinutes(Number(event.target.value));
            setState("idle");
          }}
        >
          <option value="20">20 minutes</option>
          <option value="30">30 minutes</option>
          <option value="45">45 minutes</option>
        </Select>
      </div>
      <Button onClick={save} disabled={state === "saving"}>
        {state === "saving" ? "Saving..." : "Save changes"}
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
