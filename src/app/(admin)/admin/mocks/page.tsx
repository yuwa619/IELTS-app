import { Button } from "@/components/ui/button";
import { Badge, Card } from "@/components/ui/surface";
import { getMocks } from "@/lib/services/mocks";

export default async function AdminMocksPage() {
  const [mock] = await getMocks();
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
      <Card className="space-y-4">
        <h2 className="text-xl font-semibold">{mock.title}</h2>
        {mock.sections?.map((section) => (
          <div className="flex items-center justify-between rounded-xl border border-[var(--border)] p-3" key={section.id}>
            <span className="font-semibold capitalize">{section.skill}</span>
            <Badge>{Math.round(section.timeLimitS / 60)} min</Badge>
          </div>
        ))}
      </Card>
      <Card className="space-y-4">
        <h2 className="text-xl font-semibold">Mock builder</h2>
        <p className="text-[var(--text-muted)]">Assemble sections, timing, item sets, and publish flags. Audio/transcript placeholders are ready for Supabase Storage.</p>
        <Button>Publish mock</Button>
      </Card>
    </div>
  );
}
