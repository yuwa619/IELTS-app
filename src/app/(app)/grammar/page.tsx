import { PageHeader } from "@/components/layout/shells";
import { GrammarCard } from "@/components/practice/GrammarCard";
import { getGrammar } from "@/lib/services/practice";

export const dynamic = "force-dynamic";

export default async function GrammarPage() {
  const items = await getGrammar();
  return (
    <div className="space-y-5">
      <PageHeader title="Grammar practice" eyebrow="Micro-drills" />
      <div className="grid gap-3 sm:grid-cols-2">
        {items.slice(0, 8).map((item) => (
          <GrammarCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
