import { PageHeader } from "@/components/layout/shells";
import { PracticeSet } from "@/components/practice/PracticeSet";
import { getPracticeQuestions } from "@/lib/services/practice";

export const dynamic = "force-dynamic";

export default async function ReadingPage({
  searchParams,
}: {
  searchParams: Promise<{ taskId?: string }>;
}) {
  const { taskId } = await searchParams;
  const questions = (await getPracticeQuestions("reading")).slice(0, 5);
  return (
    <div className="space-y-5">
      <PageHeader title="Reading practice" eyebrow="General Training · notices and workplace texts" />
      <PracticeSet
        questions={questions}
        skillLabel="Reading"
        taskId={taskId ?? null}
        retryHref="/practice/reading"
      />
    </div>
  );
}
