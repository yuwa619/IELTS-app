import { PageHeader } from "@/components/layout/shells";
import { Badge, Card, ProgressBar, SkillMeter } from "@/components/ui/surface";
import { getProgress } from "@/lib/services/progress";

export default async function ProgressPage() {
  const progress = await getProgress();
  return (
    <div className="space-y-5">
      <PageHeader title="Progress" eyebrow="Last 30 days" action={<Badge tone="maple">Level 2 · {progress.xp} XP</Badge>} />
      <Card className="space-y-4">
        <h2 className="text-xl font-semibold">Band trend</h2>
        <div className="flex h-28 items-end gap-3">
          {progress.scoreHistory.map((score, index) => (
            <div key={`${score}-${index}`} className="flex flex-1 flex-col items-center gap-2">
              <div className="w-full rounded-t-xl bg-[var(--blue-500)]" style={{ height: `${(score / 9) * 100}%` }} />
              <span className="font-mono text-xs">{score.toFixed(1)}</span>
            </div>
          ))}
        </div>
      </Card>
      <Card className="grid gap-4 sm:grid-cols-2">
        {Object.entries(progress.skills).map(([skill, value]) => (
          <SkillMeter key={skill} label={skill} value={value} target={skill === "listening" ? 8 : 7} color={`var(--skill-${skill})`} />
        ))}
      </Card>
      <Card className="space-y-3">
        <h2 className="text-xl font-semibold">Badges</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {progress.badges.map((badge) => (
            <div className="rounded-2xl bg-[var(--tint)] p-3" key={badge.id}>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white font-serif text-2xl">{badge.art}</div>
              <p className="mt-2 font-semibold">{badge.name}</p>
              <ProgressBar
                value={badge.code === "streak-7" ? 100 : 55}
                color="var(--maple)"
                ariaLabel={`${badge.name} badge progress`}
              />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
