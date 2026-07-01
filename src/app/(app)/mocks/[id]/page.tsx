import { PageHeader } from "@/components/layout/shells";
import { MiniMockRunner } from "@/components/mocks/MiniMockRunner";
import { getMockRunner } from "@/lib/services/mocks";

export default async function MockDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const runner = await getMockRunner(id);
  return (
    <div className="space-y-5">
      <PageHeader title={runner.mock.title} eyebrow="Mini mock runner" />
      <MiniMockRunner {...runner} />
    </div>
  );
}
