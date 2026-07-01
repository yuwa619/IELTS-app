import { Card, StatCard } from "@/components/ui/surface";
import { getAdminSummary } from "@/lib/services/admin";

export default async function AdminPage() {
  const summary = await getAdminSummary();
  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Object.entries(summary).map(([label, value]) => (
          <StatCard key={label} label={label.replace(/([A-Z])/g, " $1")} value={value} />
        ))}
      </div>
      <Card>
        <h2 className="text-xl font-semibold">Editorial status</h2>
        <p className="mt-2 text-[var(--text-muted)]">
          Mock CMS mode displays structured content and save-ready forms. Live Supabase writes should remain behind admin RLS policies.
        </p>
      </Card>
    </div>
  );
}
