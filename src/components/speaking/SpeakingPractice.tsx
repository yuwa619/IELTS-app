"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Mic, Square, Trash2 } from "lucide-react";
import { Alert, Card, Timer } from "@/components/ui/surface";
import { Button } from "@/components/ui/button";
import { CompletionActionPanel } from "@/components/practice/CompletionActionPanel";
import { AI_DISCLAIMER } from "@/lib/ai";
import type { SpeakingPrompt } from "@/types/domain";

export function SpeakingPractice({
  prompt,
  taskId,
  nextPromptHref,
}: {
  prompt: SpeakingPrompt;
  taskId?: string | null;
  nextPromptHref?: string;
}) {
  const supported = useSyncExternalStore(
    () => () => undefined,
    () => typeof window !== "undefined" && "MediaRecorder" in window,
    () => true,
  );
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "failed">("idle");
  const [savedEstimate, setSavedEstimate] = useState<string | null>(null);
  const recorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);

  useEffect(() => {
    if (!recording) return;
    const id = window.setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(id);
  }, [recording]);

  async function start() {
    if (!supported || !consent) return;
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunks.current = [];
      recorder.current = new MediaRecorder(stream);
      recorder.current.ondataavailable = (event) => chunks.current.push(event.data);
      recorder.current.onstop = () => {
        const blob = new Blob(chunks.current, { type: "audio/webm" });
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((track) => track.stop());
      };
      setSeconds(0);
      setRecording(true);
      recorder.current.start();
    } catch {
      setError("Microphone permission was not granted. You can still use the cue card and self-review without saving audio.");
    }
  }

  function stop() {
    recorder.current?.stop();
    setRecording(false);
  }

  function remove() {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setSeconds(0);
    setSaveState("idle");
    setSavedEstimate(null);
  }

  async function saveAttempt() {
    setSaveState("saving");
    try {
      const response = await fetch("/api/speaking/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promptId: prompt.id, durationS: Math.max(1, seconds) }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(body?.error?.message ?? "Could not save the attempt.");
      }
      setSaveState("saved");
      const band = body?.data?.estimate?.band;
      if (band) setSavedEstimate(`${Number(band.low).toFixed(1)}–${Number(band.high).toFixed(1)}`);
    } catch (err) {
      setSaveState("failed");
      setError((err as Error).message);
    }
  }

  if (saveState === "saved") {
    return (
      <CompletionActionPanel
        title="Speaking attempt saved"
        savedNote={
          savedEstimate
            ? `Estimated range ${savedEstimate} (practice estimate, not an official IELTS score). Audio stays on this device.`
            : "Attempt metadata saved. Audio stays on this device."
        }
        xpAwarded={25}
        taskId={taskId}
        primaryAction={
          nextPromptHref
            ? { href: nextPromptHref, label: "Try another cue card" }
            : { href: "/today", label: "Back to Today's plan" }
        }
        secondaryActions={[
          { href: "/today", label: "Today's plan" },
          { href: "/progress", label: "Progress" },
          { href: "/review", label: "Review queue" },
        ]}
      />
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
      <Card className="space-y-4 bg-[#FBF3E2]">
        <p className="font-mono text-xs uppercase text-[var(--text-muted)]">Speaking · {prompt.part.toUpperCase()}</p>
        <h2 className="text-xl font-semibold">{prompt.prompt}</h2>
        <ul className="space-y-2 text-sm text-[var(--text-muted)]">
          {prompt.cuePoints.map((point) => <li key={point}>• {point}</li>)}
        </ul>
        <Alert tone="warning">
          Recording is sensitive data. This MVP keeps audio local unless a future signed Supabase upload is configured and you consent.
        </Alert>
        <label className="flex gap-3 rounded-xl border border-[var(--border)] bg-white/60 p-3 text-sm text-[var(--text-muted)]">
          <input
            className="mt-1 h-4 w-4 accent-[var(--navy-700)]"
            type="checkbox"
            checked={consent}
            onChange={(event) => setConsent(event.target.checked)}
          />
          <span>I consent to record this local practice attempt and understand I can delete it before saving.</span>
        </label>
      </Card>
      <Card className="space-y-5 bg-[var(--navy-700)] pb-28 text-white lg:pb-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white/70">Recording answer</p>
            <p className="font-semibold">Part 2 · long turn</p>
          </div>
          <Timer>{Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}</Timer>
        </div>
        {!supported ? <Alert tone="danger">MediaRecorder is not supported in this browser. You can still use the prompt and self-review checklist.</Alert> : null}
        {error ? <Alert tone="danger">{error}</Alert> : null}
        <div className="flex min-h-40 items-center justify-center">
          <div className={`flex h-24 w-24 items-center justify-center rounded-full bg-[var(--maple)] ${recording ? "animate-pulse" : ""}`}>
            <Mic className="h-9 w-9" aria-hidden />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {!recording ? (
            <Button onClick={start} disabled={!supported || !consent} className="bg-white text-[var(--navy-700)] hover:bg-white/90">Start</Button>
          ) : (
            <Button onClick={stop} icon={<Square className="h-4 w-4" />} variant="danger">Stop & review</Button>
          )}
          <Button onClick={remove} icon={<Trash2 className="h-4 w-4" />} variant="secondary">Delete</Button>
        </div>
        {audioUrl ? (
          <div className="space-y-3 rounded-2xl bg-white/10 p-4">
            <audio controls src={audioUrl} className="w-full" />
            <Button
              className="w-full bg-white text-[var(--navy-700)] hover:bg-white/90"
              disabled={saveState === "saving"}
              onClick={saveAttempt}
            >
              {saveState === "saving" ? "Saving..." : "Save attempt to my progress"}
            </Button>
            <Alert tone="warning" title="Estimated practice feedback">
              {AI_DISCLAIMER}
              {savedEstimate
                ? ` Estimated range: ${savedEstimate}. Audio stays on this device; only attempt length and self-review are stored.`
                : " Audio stays on this device; saving stores attempt length and self-review only."}
            </Alert>
          </div>
        ) : null}
      </Card>
    </div>
  );
}
