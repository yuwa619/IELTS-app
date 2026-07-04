"use client";

import type { CountdownState } from "@/hooks/useCountdown";

// Live countdown chip in the Clearband Timer style. Turns amber at 5 minutes
// remaining and red with "Time is up" at zero. Never blocks the user.
export function CountdownTimer({ countdown }: { countdown: CountdownState }) {
  const tone = countdown.expired
    ? "bg-[var(--maple)] text-white"
    : countdown.warning
      ? "bg-[var(--warning-50)] text-[var(--ink)] ring-1 ring-[var(--warning)]"
      : "bg-[var(--navy-700)] text-white";
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 font-mono text-sm ${tone}`}
      role="timer"
      aria-live={countdown.warning || countdown.expired ? "polite" : "off"}
      aria-label={countdown.expired ? "Time is up" : `Time remaining ${countdown.display}`}
    >
      {countdown.expired ? "Time is up" : countdown.display}
    </span>
  );
}
