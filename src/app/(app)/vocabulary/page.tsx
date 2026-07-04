import { PageHeader } from "@/components/layout/shells";
import { VocabDeck } from "@/components/vocabulary/VocabDeck";
import { getVocabulary } from "@/lib/services/practice";

export const dynamic = "force-dynamic";

export default async function VocabularyPage() {
  const words = await getVocabulary();
  return (
    <div className="space-y-5">
      <PageHeader title="Vocabulary" eyebrow={`${words.length} cards`} />
      <VocabDeck words={words} />
    </div>
  );
}
