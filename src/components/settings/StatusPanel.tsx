"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/surface";

type Status = {
  mode: string;
  label: string;
  session: string;
  profileLoaded: boolean;
  onboarded?: boolean;
  onboardingLoaded: boolean;
  planLoaded?: boolean;
  lastWriteAt?: string | null;
};

// Admin-safe status panel: mode + row presence only, never secrets or data.
export function StatusPanel() {
  const [status, setStatus] = useState<Status | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/status")
      .then((response) => response.json())
      .then((body) => setStatus(body.data))
      .catch(() => setError(true));
  }, []);

  return (
    <Card className="space-y-2">
      <h2 className="text-lg font-semibold">Data status</h2>
      {error ? <p className="text-sm text-[var(--maple)]">Status check failed.</p> : null}
      {!status && !error ? <p className="text-sm text-[var(--text-muted)]">Checking...</p> : null}
      {status ? (
        <dl className="grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-xs text-[var(--text-muted)]">
          <dt>Mode</dt>
          <dd>{status.label}</dd>
          <dt>Session</dt>
          <dd>{status.session}</dd>
          <dt>Profile loaded</dt>
          <dd>{status.profileLoaded ? "yes" : "no"}</dd>
          <dt>Onboarding saved</dt>
          <dd>{status.onboardingLoaded ? "yes" : "no"}</dd>
          {status.planLoaded !== undefined ? (
            <>
              <dt>Study plan</dt>
              <dd>{status.planLoaded ? "yes" : "no"}</dd>
            </>
          ) : null}
          {status.lastWriteAt !== undefined ? (
            <>
              <dt>Last saved activity</dt>
              <dd>{status.lastWriteAt ? new Date(status.lastWriteAt).toLocaleString() : "none yet"}</dd>
            </>
          ) : null}
        </dl>
      ) : null}
    </Card>
  );
}
