import { PageHeader } from "@/components/layout/shells";
import { SpeakingPractice } from "@/components/speaking/SpeakingPractice";
import { getSpeakingPrompts } from "@/lib/services/speaking";

export default async function SpeakingPage() {
  const prompts = await getSpeakingPrompts();
  const prompt = prompts.find((item) => item.part === "p2") ?? prompts[0];
  return (
    <div className="space-y-5">
      <PageHeader title="Speaking practice" eyebrow="Part 2 · cue card" />
      {prompt ? <SpeakingPractice prompt={prompt} /> : null}
    </div>
  );
}
