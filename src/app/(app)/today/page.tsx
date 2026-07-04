import { PageHeader } from "@/components/layout/shells";
import { TaskList } from "@/components/today/TaskList";
import { Alert, Badge } from "@/components/ui/surface";
import { getTodayTasks } from "@/lib/services/study-plan";

export const dynamic = "force-dynamic";

export default async function TodayPage() {
  const tasks = await getTodayTasks();
  const totalMinutes = tasks.reduce((sum, task) => sum + task.estMinutes, 0);
  const totalXp = tasks.reduce((sum, task) => sum + task.xp, 0);
  const eyebrow = new Date().toLocaleDateString("en-CA", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="space-y-5">
      <PageHeader
        title="Today's plan"
        eyebrow={eyebrow}
        action={<Badge>{totalMinutes} min · +{totalXp} XP</Badge>}
      />
      <TaskList tasks={tasks} />
      <Alert tone="info">Spacing and retrieval are baked in. Reviews count for more XP than fresh repeats.</Alert>
    </div>
  );
}
