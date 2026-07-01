import { PageHeader } from "@/components/layout/shells";
import { Button } from "@/components/ui/button";
import { Badge, Card, EmptyState } from "@/components/ui/surface";
import { getDueRevision } from "@/lib/services/revision";

export default async function ReviewPage() {
  const items = await getDueRevision();
  return (
    <div className="space-y-5">
      <PageHeader title="Review mistakes" eyebrow={`All ${items.length}`} />
      {items.length ? items.map((item) => (
        <Card key={item.id} className="space-y-3">
          <Badge>{item.refType}</Badge>
          <h2 className="text-lg font-semibold">{item.title}</h2>
          <p className="text-sm text-[var(--text-muted)]">Due now · interval {item.interval} days</p>
          <div className="grid grid-cols-4 gap-2">
            {["Again", "Hard", "Good", "Easy"].map((grade) => <Button key={grade} variant="secondary" size="sm">{grade}</Button>)}
          </div>
        </Card>
      )) : <EmptyState title="All reviewed" body="Your due queue is clear." />}
    </div>
  );
}
