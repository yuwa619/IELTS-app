"use client";

import { useState } from "react";
import { Download, FileX2, MicOff, Trash2 } from "lucide-react";
import { Alert, Card } from "@/components/ui/surface";
import { Button } from "@/components/ui/button";

const actions = [
  {
    id: "export",
    label: "Export my data",
    detail: "Mock export prepared. Live mode should generate a user-owned data bundle.",
    icon: Download,
    variant: "secondary" as const,
  },
  {
    id: "recordings",
    label: "Delete speaking recordings",
    detail: "Mock deletion logged. Live mode must delete Supabase Storage objects and speaking_attempts rows.",
    icon: MicOff,
    variant: "outline" as const,
  },
  {
    id: "writing",
    label: "Delete writing submissions",
    detail: "Mock deletion logged. Live mode must delete writing_attempts rows after confirmation.",
    icon: FileX2,
    variant: "outline" as const,
  },
  {
    id: "account",
    label: "Delete my account",
    detail: "Mock account deletion blocked from destructive action. Live mode needs a separate confirmed server flow.",
    icon: Trash2,
    variant: "danger" as const,
  },
];

export function SettingsPrivacyActions() {
  const [message, setMessage] = useState<string | null>(null);

  return (
    <Card className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Data controls</h2>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          These controls are safe mock handlers in the MVP. They show the deletion-ready product surface without deleting live Supabase data.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Button
              key={action.id}
              type="button"
              variant={action.variant}
              icon={<Icon className="h-4 w-4" />}
              onClick={() => setMessage(action.detail)}
              className="justify-start"
            >
              {action.label}
            </Button>
          );
        })}
      </div>
      {message ? (
        <Alert tone="info" title="Mock mode action">
          {message}
        </Alert>
      ) : null}
    </Card>
  );
}
