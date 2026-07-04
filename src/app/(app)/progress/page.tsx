import { PageHeader } from "@/components/layout/shells";
import { ButtonLink } from "@/components/ui/button";
import { Badge, Card, EmptyState, SkillMeter } from "@/components/ui/surface";
import { getProgress } from "@/lib/services/progress";

export const dynamic = "force-dynamic";

export default async function ProgressPage() {
  const progress = await getProgress();
  const level = Math.max(1, Math.floor(progress.xp / 120) + 1);
  const earned = new Set(progress.earnedBadgeIds ?? []);
  return (
    <div className="space-y-5">
      <PageHeader
        title="Progress"
        eyebrow={progress.streak > 0 ? `${progress.streak}-day streak` : "Your analytics"}
        action={<Badge tone="maple">Level {level} · {progress.xp} XP</Badge>}
      />
      <Card className="space-y-4">
        <h2 className="text-xl font-semibold">Band trend (mock estimates)</h2>
        {progress.scoreHistory.length ? (
          <div className="flex h-28 items-end gap-3">
            {progress.scoreHistory.map((score, index) => (
              <div key={`${score}-${index}`} className="flex flex-1 flex-col items-center gap-2">
                <div className="w-full rounded-t-xl bg-[var(--blue-500)]" style={{ height: `${(score / 9) * 100}%` }} />
                <span className="font-mono text-xs">{score.toFixed(1)}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-[var(--text-muted)]">
              Complete a mini mock to start your score trend.
            </p>
            <ButtonLink href="/mocks" variant="secondary" size="sm">Take the mini mock</ButtonLink>
          </div>
        )}
      </Card>
      <Card className="grid gap-4 sm:grid-cols-2">
        {Object.entries(progress.skills).map(([skill, value]) => (
          <SkillMeter
            key={skill}
            label={skill}
            value={Number(value)}
            target={progress.target[skill as keyof typeof progress.target]}
            color={`var(--skill-${skill})`}
          />
        ))}
      </Card>
      <Card className="space-y-3">
        <h2 className="text-xl font-semibold">Weakest areas</h2>
        {progress.weaknesses.length ? (
          <div className="space-y-2">
            {progress.weaknesses.slice(0, 5).map((entry) => (
              <div className="flex items-center justify-between rounded-xl border border-[var(--border)] p-3" key={entry.id}>
                <div>
                  <Badge tone={entry.skill}>{entry.skill}</Badge>
                  <p className="mt-1 text-sm font-semibold">{entry.category.replace(/_/g, " ")}</p>
                </div>
                <ButtonLink href="/review" variant="outline" size="sm">Repair</ButtonLink>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="No logged errors yet" body="Wrong practice answers will appear here with repair links." />
        )}
      </Card>
      <Card className="space-y-3">
        <h2 className="text-xl font-semibold">Badges</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {progress.badges.map((badge) => {
            const isEarned = earned.has(badge.id);
            return (
              <div
                className={`rounded-2xl p-3 ${isEarned ? "bg-[var(--tint)]" : "bg-[var(--tint)] opacity-50"}`}
                key={badge.id}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white font-serif text-2xl">{badge.art}</div>
                <p className="mt-2 font-semibold">{badge.name}</p>
                <p className="text-xs text-[var(--text-muted)]">{isEarned ? "Earned" : "Locked"}</p>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
