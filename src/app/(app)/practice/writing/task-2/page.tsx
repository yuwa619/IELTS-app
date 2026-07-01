import { PageHeader } from "@/components/layout/shells";
import { WritingPractice } from "@/components/writing/WritingPractice";
import { getWritingPrompts } from "@/lib/services/writing";

export default async function WritingTask2Page() {
  const prompts = await getWritingPrompts("task2");
  const prompt = prompts[0];
  return (
    <div className="space-y-5">
      <PageHeader title="Writing Task 2" eyebrow="Essay · counts double" />
      {prompt ? <WritingPractice prompt={prompt} /> : null}
    </div>
  );
}
