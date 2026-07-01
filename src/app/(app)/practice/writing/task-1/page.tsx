import { PageHeader } from "@/components/layout/shells";
import { WritingPractice } from "@/components/writing/WritingPractice";
import { getWritingPrompts } from "@/lib/services/writing";

export default async function WritingTask1Page() {
  const [prompt] = await getWritingPrompts("task1");
  return (
    <div className="space-y-5">
      <PageHeader title="Writing Task 1" eyebrow="GT letter · tone and bullet coverage" />
      {prompt ? <WritingPractice prompt={prompt} /> : null}
    </div>
  );
}
