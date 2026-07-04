"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Badge, Card, EmptyState } from "@/components/ui/surface";
import {
  CONTENT_FILTER_LABELS,
  DEFAULT_CONTENT_FILTERS,
  moduleTypesForFilters,
  type ContentFilter,
} from "@/lib/content/classification";
import type { Lesson } from "@/types/domain";

const FILTER_ORDER: ContentFilter[] = [
  "general_training",
  "shared",
  "academic_optional",
  "clearband_original",
  "licensed_source",
];

// Client-side content filter bar. Defaults to the General Training path;
// Academic content only appears when "Academic (optional extra)" is toggled on.
export function LessonBrowser({ lessons }: { lessons: (Lesson & { completed?: boolean })[] }) {
  const [filters, setFilters] = useState<ContentFilter[]>(DEFAULT_CONTENT_FILTERS);

  function toggle(filter: ContentFilter) {
    setFilters((current) =>
      current.includes(filter)
        ? current.filter((f) => f !== filter)
        : [...current, filter],
    );
  }

  const visible = useMemo(() => {
    const modules = moduleTypesForFilters(filters);
    const wantOriginal = filters.includes("clearband_original");
    const wantLicensed = filters.includes("licensed_source");
    return lessons.filter((lesson) => {
      if (!modules.includes(lesson.moduleType ?? "general_training")) return false;
      const isOriginal = (lesson.sourceName ?? "Clearband Original") === "Clearband Original";
      // If neither source filter is active, don't filter by source.
      if (!wantOriginal && !wantLicensed) return true;
      return isOriginal ? wantOriginal : wantLicensed;
    });
  }, [lessons, filters]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Content filters">
        {FILTER_ORDER.map((filter) => {
          const active = filters.includes(filter);
          return (
            <button
              key={filter}
              type="button"
              aria-pressed={active}
              onClick={() => toggle(filter)}
              className={`min-h-9 rounded-full border px-3 text-sm ${active ? "border-2 border-[var(--navy-700)] bg-white font-semibold" : "border-[var(--border)] bg-white text-[var(--text-muted)]"}`}
            >
              {CONTENT_FILTER_LABELS[filter]}
            </button>
          );
        })}
      </div>
      {filters.includes("academic_optional") ? (
        <p className="text-xs text-[var(--text-muted)]">
          Academic items are optional extra practice and do not count toward your
          Canada Express Entry readiness.
        </p>
      ) : null}
      {visible.length ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((lesson) => (
            <Link href={`/lessons/${lesson.id}`} key={lesson.id} className="focus-visible:cb-focus">
              <Card className="h-full space-y-3">
                <div className="flex items-center justify-between">
                  <Badge tone={lesson.skill}>{lesson.skill}</Badge>
                  <span className="font-mono text-[10px] uppercase text-[var(--text-faint)]">
                    {(lesson.moduleType ?? "general_training").replace("_", " ")}
                  </span>
                </div>
                <h2 className="text-lg font-semibold">{lesson.title}</h2>
                <p className="text-sm text-[var(--text-muted)]">{lesson.summary}</p>
                <p className="font-mono text-xs text-[var(--text-muted)]">{lesson.estMinutes} min · {lesson.module}</p>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState title="No lessons match" body="Adjust the filters to see more content." />
      )}
    </div>
  );
}
