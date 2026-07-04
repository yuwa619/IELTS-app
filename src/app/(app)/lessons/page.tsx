import { PageHeader } from "@/components/layout/shells";
import { LessonBrowser } from "@/components/content/LessonBrowser";
import { getLessons } from "@/lib/services/lessons";

export const dynamic = "force-dynamic";

export default async function LessonsPage() {
  const lessons = await getLessons();
  return (
    <div className="space-y-5">
      <PageHeader title="Lessons" eyebrow="General Training curriculum" />
      <LessonBrowser lessons={lessons} />
    </div>
  );
}
