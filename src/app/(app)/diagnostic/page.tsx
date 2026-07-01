import { ButtonLink } from "@/components/ui/button";
import { Alert, Badge, Card, SkillMeter, Timer } from "@/components/ui/surface";
import { PracticeQuestionCard } from "@/components/practice/PracticeQuestionCard";
import { getDiagnosticResult, getDiagnosticSet } from "@/lib/services/diagnostic";

export default async function DiagnosticPage() {
  const set = await getDiagnosticSet();
  const result = await getDiagnosticResult();
  const reading = set.reading[0];
  return (
    <div className="space-y-5">
      <Card className="space-y-4 bg-[var(--navy-700)] text-white">
        <Badge className="bg-white/12 text-white">Step 1 of your plan</Badge>
        <h1 className="font-serif text-4xl">Let&apos;s find your starting level</h1>
        <p className="text-white/75">A short, representative check, not a full exam. It picks your starting module and plan.</p>
        <div className="grid gap-3 sm:grid-cols-4">
          {["Listening · 4 min", "Reading · 6 min", "Writing · 7 min", "Speaking · 3 min"].map((item) => (
            <div className="rounded-xl bg-white/10 p-3 text-sm" key={item}>{item}</div>
          ))}
        </div>
      </Card>
      {reading ? <PracticeQuestionCard question={reading} /> : null}
      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-3xl">Estimated starting band</h2>
          <Timer>5:12</Timer>
        </div>
        <p className="font-serif text-6xl">{result.startingBand.toFixed(1)}</p>
        <p className="text-[var(--text-muted)]">≈ CLB {result.clb} · target is CLB 9 (7.0)</p>
        <div className="grid gap-4 sm:grid-cols-2">
          {Object.entries(result.skills).map(([skill, value]) => (
            <SkillMeter key={skill} label={skill} value={value} target={skill === "listening" ? 8 : 7} color={`var(--skill-${skill})`} />
          ))}
        </div>
        <Alert tone="warning">This is an estimated practice score, not an official IELTS score.</Alert>
        <ButtonLink href="/dashboard" className="w-full">Build my study plan</ButtonLink>
      </Card>
    </div>
  );
}
