import type { ReactNode } from "react";
import { AdminShell } from "@/components/layout/shells";
import { adminUnavailableMessage, canUseMockAdmin } from "@/lib/services/admin-guard";
import { Alert } from "@/components/ui";

export default function AdminLayout({ children }: { children: ReactNode }) {
  if (!canUseMockAdmin()) {
    return (
      <main className="min-h-screen bg-[var(--bg)] p-6">
        <Alert tone="danger" title="Admin access unavailable">
          {adminUnavailableMessage()}
        </Alert>
      </main>
    );
  }

  return <AdminShell>{children}</AdminShell>;
}
