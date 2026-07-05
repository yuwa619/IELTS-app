import { PageHeader } from "@/components/layout/shells";
import { LessonPlayer } from "@/components/lessons/LessonPlayer";
import { Badge } from "@/components/ui/surface";
import { getLesson, getLessons } from "@/lib/services/lessons";

export const dynamic = "force-dynamic";

export default async function LessonDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ taskId?: string }>;
}) {
  const { id } = await params;
  const { taskId } = await searchParams;
  const [lesson, allLessons] = await Promise.all([getLesson(id), getLessons()]);

  // Recommended next lesson: first uncompleted lesson after this one in
  // curriculum order, falling back to the next by order, then none.
  const ordered = [...allLessons].sort((a, b) => a.order - b.order);
  const index = ordered.findIndex((entry) => entry.id === lesson.id);
  const after = index >= 0 ? ordered.slice(index + 1) : [];
  const nextLesson = after.find((entry) => !entry.completed) ?? after[0] ?? null;

  return (
    <div className="space-y-5">
      <PageHeader
        title={lesson.title}
        eyebrow={`${lesson.module} · Lesson ${lesson.order}/${ordered.length || lesson.order}`}
        action={<Badge tone={lesson.skill}>{lesson.skill}</Badge>}
      />
      <LessonPlayer
        lesson={lesson}
        taskId={taskId ?? null}
        nextLesson={nextLesson ? { id: nextLesson.id, title: nextLesson.title } : null}
      />
    </div>
  );
}
