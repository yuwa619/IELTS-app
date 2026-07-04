import { PageHeader } from "@/components/layout/shells";
import { SpeakingPractice } from "@/components/speaking/SpeakingPractice";
import { getSpeakingPrompts } from "@/lib/services/speaking";

export const dynamic = "force-dynamic";

export default async function SpeakingPage({
  searchParams,
}: {
  searchParams: Promise<{ p?: string; taskId?: string }>;
}) {
  const { p, taskId } = await searchParams;
  const prompts = await getSpeakingPrompts();
  const part2 = prompts.filter((item) => item.part === "p2");
  const pool = part2.length ? part2 : prompts;
  const index = Math.abs(Number.parseInt(p ?? "0", 10) || 0) % Math.max(1, pool.length);
  const prompt = pool[index];
  const nextIndex = (index + 1) % Math.max(1, pool.length);
  return (
    <div className="space-y-5">
      <PageHeader title="Speaking practice" eyebrow="Part 2 · cue card" />
      {prompt ? (
        <SpeakingPractice
          key={prompt.id}
          prompt={prompt}
          taskId={taskId ?? null}
          nextPromptHref={`/practice/speaking?p=${nextIndex}`}
        />
      ) : null}
    </div>
  );
}
