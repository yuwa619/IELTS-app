import { PageHeader } from "@/components/layout/shells";
import { CompleteLessonButton } from "@/components/lessons/CompleteLessonButton";
import { ButtonLink } from "@/components/ui/button";
import { Badge, Card } from "@/components/ui/surface";
import { getLesson } from "@/lib/services/lessons";

export const dynamic = "force-dynamic";

export default async function LessonDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lesson = await getLesson(id);
  return (
    <div className="space-y-5">
      <PageHeader title={lesson.title} eyebrow={`${lesson.module} · Lesson ${lesson.order}/10`} action={<Badge tone={lesson.skill}>{lesson.skill}</Badge>} />
      <div className="space-y-3">
        {lesson.sections?.map((section) => (
          <Card key={section.id} className="space-y-2">
            <p className="font-mono text-xs text-[var(--text-muted)]">{String(section.order).padStart(2, "0")}</p>
            <h2 className="text-xl font-semibold">{section.heading}</h2>
            <p className="leading-7 text-[var(--text-muted)]">{section.body}</p>
          </Card>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <CompleteLessonButton lessonId={lesson.id} completed={lesson.completed} />
        <ButtonLink href="/review" variant="outline">Save key point</ButtonLink>
      </div>
    </div>
  );
}
