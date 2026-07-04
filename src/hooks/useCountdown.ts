"use client";

import { useEffect, useState } from "react";

export interface CountdownState {
  secondsLeft: number;
  secondsElapsed: number;
  display: string;
  // warning at/below 5 minutes; expired at 0. The countdown never blocks
  // submission — expiry is informational and flags the attempt as over-time.
  warning: boolean;
  expired: boolean;
  startedAtIso: string;
}

export function formatSeconds(total: number) {
  const minutes = Math.floor(Math.max(0, total) / 60);
  const seconds = Math.max(0, total) % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function useCountdown(limitSeconds: number): CountdownState {
  const [elapsed, setElapsed] = useState(0);
  // Lazy state keeps the start timestamp stable across renders without
  // touching refs during render.
  const [startedAt] = useState(() => ({ ms: Date.now(), iso: new Date().toISOString() }));

  useEffect(() => {
    const id = window.setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt.ms) / 1000));
    }, 1000);
    return () => window.clearInterval(id);
  }, [startedAt.ms]);

  const secondsLeft = Math.max(0, limitSeconds - elapsed);
  return {
    secondsLeft,
    secondsElapsed: elapsed,
    display: formatSeconds(secondsLeft),
    warning: secondsLeft > 0 && secondsLeft <= 300,
    expired: secondsLeft === 0,
    startedAtIso: startedAt.iso,
  };
}
