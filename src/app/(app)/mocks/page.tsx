import Link from "next/link";
import { PageHeader } from "@/components/layout/shells";
import { Badge, Card } from "@/components/ui/surface";
import { getMocks } from "@/lib/services/mocks";

export default async function MocksPage() {
  const mocks = await getMocks();
  return (
    <div className="space-y-5">
      <PageHeader title="Mock exams" eyebrow="Timed practice" />
      {mocks.map((mock) => (
        <Link href={`/mocks/${mock.id}`} key={mock.id}>
          <Card className="space-y-3">
            <Badge tone="maple">{mock.type}</Badge>
            <h2 className="font-serif text-3xl">{mock.title}</h2>
            <p className="text-[var(--text-muted)]">{mock.sections?.length} sections · {mock.totalMinutes} min · cannot pause once started</p>
          </Card>
        </Link>
      ))}
    </div>
  );
}
