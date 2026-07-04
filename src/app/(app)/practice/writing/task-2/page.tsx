import { PageHeader } from "@/components/layout/shells";
import { WritingPractice } from "@/components/writing/WritingPractice";
import { getWritingPrompts } from "@/lib/services/writing";

export const dynamic = "force-dynamic";

export default async function WritingTask2Page({
  searchParams,
}: {
  searchParams: Promise<{ p?: string; taskId?: string }>;
}) {
  const { p, taskId } = await searchParams;
  const prompts = await getWritingPrompts("task2");
  const index = Math.abs(Number.parseInt(p ?? "0", 10) || 0) % Math.max(1, prompts.length);
  const prompt = prompts[index];
  const nextIndex = (index + 1) % Math.max(1, prompts.length);
  return (
    <div className="space-y-5">
      <PageHeader title="Writing Task 2" eyebrow="Essay · counts double" />
      {prompt ? (
        <WritingPractice
          key={prompt.id}
          prompt={prompt}
          taskId={taskId ?? null}
          nextPromptHref={`/practice/writing/task-2?p=${nextIndex}`}
        />
      ) : null}
    </div>
  );
}
