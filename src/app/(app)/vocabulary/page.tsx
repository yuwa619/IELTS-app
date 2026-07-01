import { PageHeader } from "@/components/layout/shells";
import { Button } from "@/components/ui/button";
import { Badge, Card } from "@/components/ui/surface";
import { getVocabulary } from "@/lib/services/practice";

export default async function VocabularyPage() {
  const words = await getVocabulary();
  const word = words[0];
  return (
    <div className="space-y-5">
      <PageHeader title="Vocabulary · Workplace" eyebrow="7/20" />
      <Card className="space-y-5 text-center">
        <Badge>{word.cefr} · {word.topic}</Badge>
        <p className="font-serif text-5xl">{word.term}</p>
        <p className="font-mono text-sm text-[var(--text-muted)]">{word.ipa}</p>
        <p className="mx-auto max-w-md text-lg leading-8">{word.definition}.</p>
        <p className="text-[var(--text-muted)]">“{word.example}”</p>
        <div className="grid grid-cols-4 gap-2">
          {["Again", "Hard", "Good", "Easy"].map((grade) => <Button key={grade} variant="secondary" size="sm">{grade}</Button>)}
        </div>
      </Card>
    </div>
  );
}
