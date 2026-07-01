import { PageHeader } from "@/components/layout/shells";
import { PracticeQuestionCard } from "@/components/practice/PracticeQuestionCard";
import { Card, Timer } from "@/components/ui/surface";
import { getPracticeQuestions } from "@/lib/services/practice";

export default async function ListeningPage() {
  const [question] = await getPracticeQuestions("listening");
  return (
    <div className="space-y-5">
      <PageHeader title="Listening practice" eyebrow="Part 1 · Form completion" action={<Timer>4:48</Timer>} />
      <Card className="bg-[var(--navy-700)] text-white">
        <div className="flex items-center justify-between font-mono text-sm"><span>0:42</span><span>3:10</span><span>1.0x</span></div>
        <div className="mt-4 h-10 rounded-xl bg-white/15" aria-label="Audio waveform placeholder" />
      </Card>
      {question ? <PracticeQuestionCard question={question} /> : null}
    </div>
  );
}
