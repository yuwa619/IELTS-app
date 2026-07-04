import { PageHeader } from "@/components/layout/shells";
import { PracticeSet } from "@/components/practice/PracticeSet";
import { getPracticeQuestions } from "@/lib/services/practice";

export const dynamic = "force-dynamic";

export default async function ListeningPage({
  searchParams,
}: {
  searchParams: Promise<{ taskId?: string }>;
}) {
  const { taskId } = await searchParams;
  const questions = (await getPracticeQuestions("listening")).slice(0, 5);
  return (
    <div className="space-y-5">
      <PageHeader title="Listening practice" eyebrow="Shared skill · transcripts included" />
      <PracticeSet
        questions={questions}
        skillLabel="Listening"
        taskId={taskId ?? null}
        retryHref="/practice/listening"
      />
    </div>
  );
}
