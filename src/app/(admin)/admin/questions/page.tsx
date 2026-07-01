import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/form";
import { Badge, Card } from "@/components/ui/surface";
import { getAdminQuestions } from "@/lib/services/admin";

export default async function AdminQuestionsPage() {
  const questions = await getAdminQuestions();
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
      <Card className="space-y-3">
        <h2 className="text-xl font-semibold">Practice questions</h2>
        {questions.slice(0, 12).map((question) => (
          <div className="rounded-xl border border-[var(--border)] p-3" key={question.id}>
            <div className="flex items-center justify-between gap-3">
              <p className="font-semibold">{question.prompt}</p>
              <Badge tone={question.skill}>{question.skill}</Badge>
            </div>
            <p className="mt-1 text-sm text-[var(--text-muted)]">{question.questionType} · {question.topic}</p>
          </div>
        ))}
      </Card>
      <Card className="space-y-4">
        <h2 className="text-xl font-semibold">Question editor</h2>
        <div><Label>Type</Label><Select defaultValue="tfng"><option>tfng</option><option>gap_fill</option><option>mcq</option></Select></div>
        <div><Label>Stem</Label><Textarea defaultValue={questions[0]?.prompt} /></div>
        <div><Label>Answer key</Label><Input defaultValue={String(questions[0]?.answerKey.answer)} /></div>
        <Button>Mock save</Button>
      </Card>
    </div>
  );
}
