import { PageHeader } from "@/components/layout/shells";
import { PracticeQuestionCard } from "@/components/practice/PracticeQuestionCard";
import { Timer } from "@/components/ui/surface";
import { getPracticeQuestions } from "@/lib/services/practice";

export default async function ReadingPage() {
  const [question] = await getPracticeQuestions("reading");
  return (
    <div className="space-y-5">
      <PageHeader title="Reading practice" eyebrow="GT passage · True / False / Not Given" action={<Timer>6:20</Timer>} />
      {question ? <PracticeQuestionCard question={question} /> : null}
    </div>
  );
}
