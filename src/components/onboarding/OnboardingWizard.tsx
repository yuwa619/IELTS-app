"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Check, Info } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Alert, Badge, Card, ProgressBar } from "@/components/ui/surface";
import { CLB_FACTS, clbLabel, targetForClb } from "@/lib/scoring/clb";
import type { GoalMode } from "@/types/domain";

const goalCards: { id: GoalMode; title: string; body: string; target: string }[] = [
  { id: "eligible", title: "Get eligible", body: "Reach CLB 7 in all four skills: the Federal Skilled Worker minimum.", target: "IELTS 6.0 each" },
  { id: "crs", title: "Boost my CRS", body: "Aim for CLB 9, where language and skill-transfer points jump.", target: "L8.0 R7.0 W7.0 S7.0" },
  { id: "unsure", title: "Not sure yet", body: "We will recommend a target after your diagnostic.", target: "Start with a guided diagnostic" },
];

export function OnboardingWizard() {
  const [step, setStep] = useState(0);
  const [goalMode, setGoalMode] = useState<GoalMode>("crs");
  const [targetClb, setTargetClb] = useState(9);
  const [dailyMinutes, setDailyMinutes] = useState(30);
  const target = useMemo(() => targetForClb(targetClb), [targetClb]);

  const next = () => setStep((current) => Math.min(5, current + 1));
  const back = () => setStep((current) => Math.max(0, current - 1));

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
                  if (goal.id === "eligible") setTargetClb(7);
                  if (goal.id === "crs") setTargetClb(9);
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
            <p className="font-serif text-6xl">{target.writing.toFixed(1)}</p>
            <p className="font-mono text-sm text-white/75">{clbLabel(targetClb)}</p>
            <input
              className="mt-5 w-full accent-[var(--maple)]"
              type="range"
              min={7}
              max={10}
              step={1}
              value={targetClb}
              onChange={(event) => setTargetClb(Number(event.target.value))}
              aria-label="Target CLB"
            />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {(["listening", "reading", "writing", "speaking"] as const).map((skill) => (
              <div key={skill} className="rounded-2xl border border-[var(--border)] bg-white p-3 text-center">
                <p className="text-xs font-semibold uppercase text-[var(--text-muted)]">{skill.slice(0, 6)}</p>
                <p className="font-serif text-3xl">{target[skill].toFixed(1)}</p>
              </div>
            ))}
          </div>
          <Alert tone="info">
            CLB 9 needs Listening 8.0, higher than the others. We will weight your plan accordingly.
          </Alert>
          <button className="min-h-12 w-full rounded-xl bg-[var(--navy-700)] font-semibold text-white" onClick={next}>Continue</button>
        </Card>
      )}

      {step === 3 && (
        <Card className="space-y-5">
          <h1 className="font-serif text-[34px] leading-tight">When&apos;s your test?</h1>
          <p className="text-[var(--text-muted)]">Your daily load and mock schedule are paced to this date. No date yet? That&apos;s fine.</p>
          <div className="grid gap-3 sm:grid-cols-[120px_1fr]">
            <div className="rounded-2xl bg-[var(--maple-50)] p-4 text-center text-[var(--maple)]">
              <p className="text-xs font-semibold uppercase">Aug</p>
              <p className="font-serif text-5xl">06</p>
            </div>
            <div className="rounded-2xl border border-[var(--border)] p-4">
              <p className="font-semibold">Thu, 06 Aug 2026</p>
              <p className="text-sm text-[var(--text-muted)]">Computer-delivered · Toronto</p>
              <button className="mt-3 text-sm font-semibold text-[var(--navy-700)]">I haven&apos;t booked a date yet</button>
            </div>
          </div>
          <Alert tone="success">{CLB_FACTS[3]} One Skill Retake is not accepted for Express Entry.</Alert>
          <button className="min-h-12 w-full rounded-xl bg-[var(--navy-700)] font-semibold text-white" onClick={next}>Continue</button>
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
          <button className="min-h-12 w-full rounded-xl bg-[var(--navy-700)] font-semibold text-white" onClick={next}>Continue</button>
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
