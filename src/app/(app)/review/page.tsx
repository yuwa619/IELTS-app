import { PageHeader } from "@/components/layout/shells";
import { RevisionGrader } from "@/components/review/RevisionGrader";
import { getDueRevision } from "@/lib/services/revision";

export const dynamic = "force-dynamic";

export default async function ReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ taskId?: string }>;
}) {
  const { taskId } = await searchParams;
  const items = await getDueRevision();
  return (
    <div className="space-y-5">
      <PageHeader title="Review mistakes" eyebrow={`Due ${items.length}`} />
      <RevisionGrader items={items} taskId={taskId ?? null} />
    </div>
  );
}
