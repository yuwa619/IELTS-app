import Link from "next/link";
import { PageHeader } from "@/components/layout/shells";
import { Badge, Card, EmptyState } from "@/components/ui/surface";
import { getLessons } from "@/lib/services/lessons";

export default async function LessonsPage() {
  const lessons = await getLessons();
  return (
    <div className="space-y-5">
      <PageHeader title="Lessons" eyebrow="Curriculum" />
      {lessons.length ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {lessons.map((lesson) => (
            <Link href={`/lessons/${lesson.id}`} key={lesson.id} className="focus-visible:cb-focus">
              <Card className="h-full space-y-3">
                <Badge tone={lesson.skill}>{lesson.skill}</Badge>
                <h2 className="text-lg font-semibold">{lesson.title}</h2>
                <p className="text-sm text-[var(--text-muted)]">{lesson.summary}</p>
                <p className="font-mono text-xs text-[var(--text-muted)]">{lesson.estMinutes} min · {lesson.module}</p>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState title="No lessons yet" body="Published lessons will appear here." />
      )}
    </div>
  );
}
