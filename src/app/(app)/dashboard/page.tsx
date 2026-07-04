import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/layout/shells";
import { ButtonLink } from "@/components/ui/button";
import { Badge, DashboardCard, SkillMeter, StatCard } from "@/components/ui/surface";
import { getGoal, getProfile, getTarget } from "@/lib/services/profile";
import { getProgress } from "@/lib/services/progress";
import { getTodayTasks } from "@/lib/services/study-plan";
import { roundOverallBand } from "@/lib/scoring/clb";

export const dynamic = "force-dynamic";

function daysUntil(date: string | null) {
  if (!date) return null;
  const diff = new Date(`${date}T00:00:00`).getTime() - Date.now();
  return diff > 0 ? Math.ceil(diff / 86_400_000) : 0;
}

export default async function DashboardPage() {
  const [profile, goal, target, progress, tasks] = await Promise.all([
    getProfile(),
    getGoal(),
    getTarget(),
    getProgress(),
    getTodayTasks(),
  ]);
  const nextTask = tasks.find((task) => task.status !== "done") ?? tasks[0];
  const doneCount = tasks.filter((task) => task.status === "done").length;
  const minutesLeft = tasks
    .filter((task) => task.status !== "done")
    .reduce((sum, task) => sum + task.estMinutes, 0);
  const testIn = daysUntil(goal.testDate);
  const overallTarget = roundOverallBand({
    listening: target.listening,
    reading: target.reading,
    writing: target.writing,
    speaking: target.speaking,
  });
  const weakest = progress.weaknesses[0];

  return (
    <div className="space-y-5">
      <PageHeader
        title={`Welcome back, ${profile.displayName ?? "learner"}`}
        action={
          progress.streak > 0 ? <Badge tone="maple">{progress.streak}-day streak</Badge> : null
        }
      />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Target" value={overallTarget.toFixed(1)} detail={`CLB ${target.targetClb}`} />
        <StatCard
          label="Test in"
          value={testIn === null ? "—" : String(testIn)}
          detail={testIn === null ? "no date booked" : "days"}
        />
        <StatCard label="XP" value={progress.xp} detail={`Level ${Math.max(1, Math.floor(progress.xp / 120) + 1)}`} />
        <StatCard label="Revision" value={progress.revisionQueue.length} detail="due items" />
      </div>
      <DashboardCard
        title="Today's plan"
        action={
          <ButtonLink href="/today" icon={<ArrowRight className="h-4 w-4" />}>
            Continue plan
          </ButtonLink>
        }
      >
        <p className="text-sm text-[var(--text-muted)]">
          {doneCount} of {tasks.length} · {minutesLeft} min left
        </p>
        {nextTask ? (
          <div className="rounded-2xl bg-[var(--tint)] p-4">
            <Badge tone={nextTask.skill}>{nextTask.skill}</Badge>
            <h2 className="mt-2 text-lg font-semibold">{nextTask.title}</h2>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              Up next · {nextTask.estMinutes} min · +{nextTask.xp} XP
            </p>
          </div>
        ) : null}
      </DashboardCard>
      <DashboardCard title="Skill progress" action={<ButtonLink href="/progress" variant="ghost">Details</ButtonLink>}>
        <div className="grid gap-4 sm:grid-cols-2">
          {Object.entries(progress.skills).map(([skill, value]) => (
            <SkillMeter
              key={skill}
              label={skill}
              value={Number(value)}
              target={progress.target[skill as keyof typeof progress.target]}
              color={`var(--skill-${skill})`}
            />
          ))}
        </div>
        {Object.values(progress.skills).every((value) => !value) ? (
          <p className="mt-3 text-sm text-[var(--text-muted)]">
            Complete a few practice sets and your estimated skill bands will appear here.
          </p>
        ) : null}
      </DashboardCard>
      <div className="grid gap-3 sm:grid-cols-2">
        <DashboardCard title="Weakest area">
          {weakest ? (
            <>
              <p className="text-xl font-semibold capitalize">{weakest.skill}</p>
              <p className="text-sm text-[var(--text-muted)]">{weakest.category.replace(/_/g, " ")}</p>
            </>
          ) : (
            <p className="text-sm text-[var(--text-muted)]">No logged errors yet — practice to find your weak spots.</p>
          )}
        </DashboardCard>
        <DashboardCard title="Next mock">
          <p className="text-xl font-semibold">Mini mock</p>
          <p className="text-sm text-[var(--text-muted)]">
            {progress.scoreHistory.length
              ? `Last estimate: ${progress.scoreHistory[progress.scoreHistory.length - 1].toFixed(1)}`
              : "Ready when you are · 28 min"}
          </p>
        </DashboardCard>
      </div>
    </div>
  );
}
