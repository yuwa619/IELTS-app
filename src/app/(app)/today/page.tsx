import { CheckCircle2, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/layout/shells";
import { ButtonLink } from "@/components/ui/button";
import { Alert, Badge, Card } from "@/components/ui/surface";
import { getTodayTasks } from "@/lib/services/study-plan";

export default async function TodayPage() {
  const tasks = await getTodayTasks();
  return (
    <div className="space-y-5">
      <PageHeader title="Today&apos;s plan" eyebrow="Monday · Day 14" action={<Badge>30 min · +90 XP</Badge>} />
      <div className="space-y-3">
        {tasks.map((task) => (
          <Card key={task.id} className="flex items-center gap-4">
            <span className={`flex h-9 w-9 items-center justify-center rounded-full ${task.status === "done" ? "bg-[var(--success-50)] text-[var(--success)]" : "bg-[var(--tint)] text-[var(--navy-700)]"}`}>
              {task.status === "done" ? <CheckCircle2 className="h-5 w-5" /> : task.block[0].toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="font-semibold">{task.title}</h2>
              <p className="text-sm text-[var(--text-muted)]">{task.estMinutes} min · +{task.xp} XP</p>
            </div>
            {task.status === "done" ? <Badge tone="success">Done</Badge> : <ButtonLink href={task.refType === "lesson" ? `/lessons/${task.refId}` : "/practice/writing/task-1"} variant="secondary">Start</ButtonLink>}
            <ChevronRight className="h-4 w-4 text-[var(--text-faint)]" />
          </Card>
        ))}
      </div>
      <Alert tone="info">Spacing and retrieval are baked in. Reviews count for more XP than fresh repeats.</Alert>
    </div>
  );
}
