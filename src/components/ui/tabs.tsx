"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export function Tabs({
  tabs,
  initial,
}: {
  tabs: { id: string; label: string; content: ReactNode }[];
  initial?: string;
}) {
  const [active, setActive] = useState(initial ?? tabs[0]?.id);
  const current = tabs.find((tab) => tab.id === active) ?? tabs[0];
  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto border-b border-[var(--border)]" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={cn(
              "min-h-11 shrink-0 border-b-2 px-1 text-sm font-semibold text-[var(--text-muted)]",
              active === tab.id
                ? "border-[var(--navy-700)] text-[var(--navy-700)]"
                : "border-transparent",
            )}
            onClick={() => setActive(tab.id)}
            role="tab"
            aria-selected={active === tab.id}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div>{current?.content}</div>
    </div>
  );
}
