"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Check, Info } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/form";
import { Alert, Badge, Card, ProgressBar } from "@/components/ui/surface";
import {
  CLB_FACTS,
  clbForOverallBand,
  clbLabel,
  hardestSkillNote,
  MAX_OVERALL_BAND,
  MIN_OVERALL_BAND,
  targetForClb,
} from "@/lib/scoring/clb";
import type { GoalMode, TestFormat } from "@/types/domain";

const testFormats: { id: TestFormat; label: string }[] = [
  { id: "computer", label: "Computer-delivered" },
  { id: "paper", label: "Paper-based" },
  { id: "unsure", label: "Not sure yet" },
];

function todayIsoDate() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 10);
}

const goalCards: { id: GoalMode; title: string; body: string; target: string }[] = [
  { id: "eligible", title: "Get eligible", body: "Reach CLB 7 in all four skills: the Federal Skilled Worker minimum.", target: "IELTS 6.0 each" },
  { id: "crs", title: "Boost my CRS", body: "Aim for CLB 9, where language and skill-transfer points jump.", target: "L8.0 R7.0 W7.0 S7.0" },
  { id: "unsure", title: "Not sure yet", body: "We will recommend a target after your diagnostic.", target: "Start with a guided diagnostic" },
];

export function OnboardingWizard() {
  const [step, setStep] = useState(0);
  const [goalMode, setGoalMode] = useState<GoalMode>("crs");
  const [overallBand, setOverallBand] = useState(7);
  const [hasBookedDate, setHasBookedDate] = useState(false);
  const [testDate, setTestDate] = useState("");
  const [testFormat, setTestFormat] = useState<TestFormat>("unsure");
  const [testLocation, setTestLocation] = useState("");
  const [dailyMinutes, setDailyMinutes] = useState(30);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const targetClb = clbForOverallBand(overallBand);
  const target = useMemo(() => targetForClb(targetClb), [targetClb]);

  const minTestDate = todayIsoDate();
  const testDateError = hasBookedDate
    ? !testDate
      ? "Pick your test date, or choose “I haven’t booked a date yet”."
      : testDate < minTestDate
        ? "Your test date is in the past. Pick today or a later date."
        : null
    : null;

  const next = () => setStep((current) => Math.min(5, current + 1));
  const back = () => setStep((current) => Math.max(0, current - 1));

  async function saveAndContinue() {
    setSaveError(null);
    setSaving(true);
    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goalMode,
          targetClb,
          targetOverallBand: overallBand,
          testDate: hasBookedDate && testDate ? testDate : null,
          testFormat,
          ...(testLocation.trim() ? { testLocation: testLocation.trim() } : {}),
          confidence: 3,
          dailyMinutes,
        }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        setSaveError(
          body?.error?.message ?? "We could not save your plan. Please try again.",
        );
        return;
      }
      next();
    } catch {
      setSaveError("We could not save your plan. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="flex items-center gap-3">
        <button className="min-h-11 min-w-11 rounded-full bg-white text-[var(--ink)]" onClick={back} aria-label="Back">
          ←
        </button>
        <ProgressBar
          value={((step + 1) / 6) * 100}
          color="var(--navy-700)"
          ariaLabel="Onboarding progress"
        />
        <span className="font-mono text-xs text-[var(--text-muted)]">{step + 1}/6</span>
      </div>

      {step === 0 && (
        <Card className="space-y-5 bg-[var(--navy-700)] p-5 text-white">
          <Badge className="bg-white/12 text-white">Canada · Express Entry</Badge>
          <h1 className="font-serif text-4xl leading-tight">Setup as a consultation, not a form.</h1>
          <p className="text-white/76">
            In a few minutes Clearband will connect your Canada goal, CLB target, test date, and daily time into a focused plan.
          </p>
          <div className="grid gap-3">
            {["Why IELTS General Training matters", "Your target bands by skill", "The 4-block daily method"].map((item) => (
              <div className="flex items-center gap-3" key={item}>
                <Check className="h-5 w-5 text-[var(--maple)]" aria-hidden />
                <span>{item}</span>
              </div>
            ))}
          </div>
          <button className="min-h-12 rounded-xl bg-white px-5 font-semibold text-[var(--navy-700)]" onClick={next}>
            Let&apos;s start
          </button>
        </Card>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <Badge tone="maple">Canada · Express Entry</Badge>
          <h1 className="font-serif text-[34px] leading-tight">What&apos;s your goal?</h1>
          <p className="text-[var(--text-muted)]">This sets your target band and how hard we push your plan. You can change it anytime.</p>
          <div className="space-y-3">
            {goalCards.map((goal) => (
              <button
                key={goal.id}
                className={`w-full rounded-2xl border bg-white p-4 text-left shadow-card ${goalMode === goal.id ? "border-2 border-[var(--navy-700)]" : "border-[var(--border)]"}`}
                onClick={() => {
                  setGoalMode(goal.id);
                  if (goal.id === "eligible") setOverallBand(6);
                  if (goal.id === "crs") setOverallBand(7);
                }}
              >
                <div className="flex items-start gap-3">
                  <span className="mt-1 flex h-5 w-5 items-center justify-center rounded-full border border-[var(--border)] text-xs">
                    {goalMode === goal.id ? "✓" : ""}
                  </span>
                  <div>
                    <h2 className="font-semibold">{goal.title}</h2>
                    <p className="mt-1 text-sm text-[var(--text-muted)]">{goal.body}</p>
                    <p className="mt-2 font-mono text-xs text-[var(--navy-700)]">Target · {goal.target}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
          <button className="min-h-12 w-full rounded-xl bg-[var(--navy-700)] font-semibold text-white" onClick={next}>Continue</button>
        </div>
      )}

      {step === 2 && (
        <Card className="space-y-5">
          <h1 className="font-serif text-[34px] leading-tight">Set your target</h1>
          <p className="text-[var(--text-muted)]">Slide to the band you&apos;re aiming for. We show the matching CLB and what it unlocks.</p>
          <div className="rounded-2xl bg-[var(--navy-700)] p-5 text-white">
            <p className="text-sm text-white/70">Overall target</p>
            <p className="font-serif text-6xl">{overallBand.toFixed(1)}</p>
            <p className="font-mono text-sm text-white/75">{clbLabel(targetClb)}</p>
            <input
              className="mt-5 w-full accent-[var(--maple)]"
              type="range"
              min={MIN_OVERALL_BAND}
              max={MAX_OVERALL_BAND}
              step={0.5}
              value={overallBand}
              onChange={(event) => setOverallBand(Number(event.target.value))}
              aria-label="Target overall IELTS band"
              aria-valuetext={`Overall band ${overallBand.toFixed(1)}, ${clbLabel(targetClb)}`}
            />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {(["listening", "reading", "writing", "speaking"] as const).map((skill) => (
              <div key={skill} className="rounded-2xl border border-[var(--border)] bg-white p-3 text-center">
                <p className="text-xs font-semibold uppercase text-[var(--text-muted)]">{skill}</p>
                <p className="font-serif text-3xl">{target[skill].toFixed(1)}</p>
              </div>
            ))}
          </div>
          <Alert tone="info">{hardestSkillNote(targetClb)}</Alert>
          <button className="min-h-12 w-full rounded-xl bg-[var(--navy-700)] font-semibold text-white" onClick={next}>Continue</button>
        </Card>
      )}

      {step === 3 && (
        <Card className="space-y-5">
          <h1 className="font-serif text-[34px] leading-tight">When&apos;s your test?</h1>
          <p className="text-[var(--text-muted)]">Your daily load and mock schedule are paced to this date. No date yet? That&apos;s fine.</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { booked: true, label: "I have a date booked" },
              { booked: false, label: "I haven’t booked a date yet" },
            ].map((option) => (
              <button
                key={option.label}
                type="button"
                className={`min-h-12 rounded-2xl border bg-white p-3 text-sm font-semibold ${hasBookedDate === option.booked ? "border-2 border-[var(--navy-700)]" : "border-[var(--border)] text-[var(--text-muted)]"}`}
                aria-pressed={hasBookedDate === option.booked}
                onClick={() => setHasBookedDate(option.booked)}
              >
                {option.label}
              </button>
            ))}
          </div>
          {hasBookedDate ? (
            <div className="space-y-2">
              <Label htmlFor="test-date">Test date</Label>
              <Input
                id="test-date"
                type="date"
                min={minTestDate}
                value={testDate}
                onChange={(event) => setTestDate(event.target.value)}
              />
              {testDateError ? (
                <p className="text-sm text-[var(--maple)]" role="alert">{testDateError}</p>
              ) : null}
            </div>
          ) : (
            <Alert tone="info">
              No problem. We will pace your plan in default planning mode and you can add a date later in Settings.
            </Alert>
          )}
          <div className="space-y-2">
            <span
              id="test-format-label"
              className="text-xs font-semibold uppercase tracking-normal text-[var(--text-muted)]"
            >
              Test format
            </span>
            <div className="grid grid-cols-3 gap-2" role="group" aria-labelledby="test-format-label">
              {testFormats.map((format) => (
                <button
                  key={format.id}
                  type="button"
                  className={`min-h-11 rounded-xl border bg-white px-2 text-sm ${testFormat === format.id ? "border-2 border-[var(--navy-700)] font-semibold" : "border-[var(--border)] text-[var(--text-muted)]"}`}
                  aria-pressed={testFormat === format.id}
                  onClick={() => setTestFormat(format.id)}
                >
                  {format.label}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="test-location">Test location (optional)</Label>
            <Input
              id="test-location"
              type="text"
              placeholder="e.g. Toronto"
              value={testLocation}
              onChange={(event) => setTestLocation(event.target.value)}
            />
          </div>
          <Alert tone="success">{CLB_FACTS[3]} One Skill Retake is not accepted for Express Entry.</Alert>
          <button
            className="min-h-12 w-full rounded-xl bg-[var(--navy-700)] font-semibold text-white disabled:opacity-50"
            disabled={Boolean(testDateError)}
            onClick={next}
          >
            Continue
          </button>
        </Card>
      )}

      {step === 4 && (
        <Card className="space-y-5">
          <h1 className="font-serif text-[34px] leading-tight">How much time can you study daily?</h1>
          <div className="grid grid-cols-3 gap-3">
            {[20, 30, 45].map((minutes) => (
              <button
                key={minutes}
                className={`min-h-16 rounded-2xl border font-serif text-3xl ${dailyMinutes === minutes ? "border-2 border-[var(--navy-700)] bg-white" : "border-[var(--border)] bg-white"}`}
                onClick={() => setDailyMinutes(minutes)}
              >
                {minutes}
                <span className="block font-sans text-xs text-[var(--text-muted)]">min</span>
              </button>
            ))}
          </div>
          <Alert tone="info">Review and correction earn more XP than repetition. Your plan stays realistic for your time budget.</Alert>
          {saveError ? (
            <p className="text-sm text-[var(--maple)]" role="alert">{saveError}</p>
          ) : null}
          <button
            className="min-h-12 w-full rounded-xl bg-[var(--navy-700)] font-semibold text-white disabled:opacity-50"
            disabled={saving}
            onClick={saveAndContinue}
          >
            {saving ? "Saving your plan..." : "Continue"}
          </button>
        </Card>
      )}

      {step === 5 && (
        <Card className="space-y-5">
          <Info className="h-7 w-7 text-[var(--maple)]" aria-hidden />
          <h1 className="font-serif text-[34px] leading-tight">Start with a short diagnostic</h1>
          <p className="text-[var(--text-muted)]">
            We will check each skill, estimate your starting point, then build today&apos;s plan. It is a practice estimate, not an official IELTS score.
          </p>
          <ButtonLink href="/diagnostic" className="w-full" icon={<ArrowRight className="h-4 w-4" />}>
            Start my diagnostic
          </ButtonLink>
          <ButtonLink href="/dashboard" variant="ghost" className="w-full">
            I&apos;ll do this later
          </ButtonLink>
        </Card>
      )}
    </div>
  );
}
