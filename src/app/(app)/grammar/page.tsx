import { PageHeader } from "@/components/layout/shells";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/surface";
import { getGrammar } from "@/lib/services/practice";

export default async function GrammarPage() {
  const items = await getGrammar();
  return (
    <div className="space-y-5">
      <PageHeader title="Grammar practice" eyebrow="Micro-drills" />
      <div className="grid gap-3 sm:grid-cols-2">
        {items.slice(0, 8).map((item) => (
          <Card key={item.id} className="space-y-3">
            <h2 className="font-semibold">{item.title}</h2>
            <p className="text-sm leading-6 text-[var(--text-muted)]">{item.rule}</p>
            <Button variant="secondary" size="sm">Explain rule</Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
