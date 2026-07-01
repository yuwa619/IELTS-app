"use client";

import { Button, ErrorState } from "@/components/ui";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="space-y-4">
      <ErrorState message={error.message} />
      <Button onClick={reset}>Retry</Button>
    </div>
  );
}
