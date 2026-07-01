import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/layout/shells";
import { ButtonLink } from "@/components/ui/button";
import { Badge, DashboardCard, SkillMeter, StatCard } from "@/components/ui/surface";
import { getProfile, getTarget } from "@/lib/services/profile";
import { getProgress } from "@/lib/services/progress";
import { getTodayTasks } from "@/lib/services/study-plan";

export default async function DashboardPage() {
  const [profile, target, progress, tasks] = await Promise.all([getProfile(), getTarget(), getProgress(), getTodayTasks()]);
  const nextTask = tasks.find((task) => task.status !== "done") ?? tasks[0];
  return (
    <div className="space-y-5">
      <PageHeader title={`Good morning, ${profile.displayName}`} action={<Badge tone="maple">12-day streak</Badge>} />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Target" value="7.0" detail={`CLB ${target.targetClb}`} />
        <StatCard label="Test in" value="38" detail="days" />
        <StatCard label="XP" value={progress.xp} detail="Level 2" />
        <StatCard label="Revision" value={progress.revisionQueue.length} detail="due items" />
      </div>
      <DashboardCard title="Today&apos;s plan" action={<ButtonLink href="/today" icon={<ArrowRight className="h-4 w-4" />}>Continue plan</ButtonLink>}>
        <p className="text-sm text-[var(--text-muted)]">2 of 4 · 18 min left</p>
        <div className="rounded-2xl bg-[var(--tint)] p-4">
          <Badge tone={nextTask.skill}>{nextTask.skill}</Badge>
          <h2 className="mt-2 text-lg font-semibold">{nextTask.title}</h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">Up next · {nextTask.estMinutes} min · +{nextTask.xp} XP</p>
        </div>
      </DashboardCard>
      <DashboardCard title="Skill progress" action={<ButtonLink href="/progress" variant="ghost">Details</ButtonLink>}>
        <div className="grid gap-4 sm:grid-cols-2">
          {Object.entries(progress.skills).map(([skill, value]) => (
            <SkillMeter key={skill} label={skill} value={value} target={skill === "listening" ? 8 : 7} color={`var(--skill-${skill})`} />
          ))}
        </div>
      </DashboardCard>
      <div className="grid gap-3 sm:grid-cols-2">
        <DashboardCard title="Weakest area">
          <p className="text-xl font-semibold">Writing Task 1</p>
          <p className="text-sm text-[var(--text-muted)]">Tone and bullet coverage</p>
        </DashboardCard>
        <DashboardCard title="Next mock">
          <p className="text-xl font-semibold">Mini mock</p>
          <p className="text-sm text-[var(--text-muted)]">Ready today · 28 min</p>
        </DashboardCard>
      </div>
    </div>
  );
}
