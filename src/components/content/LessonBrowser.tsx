"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Badge, Card, EmptyState, ProgressBar } from "@/components/ui/surface";
import {
  CONTENT_FILTER_LABELS,
  DEFAULT_CONTENT_FILTERS,
  moduleTypesForFilters,
  type ContentFilter,
} from "@/lib/content/classification";
import type { Lesson, Skill } from "@/types/domain";

const FILTER_ORDER: ContentFilter[] = [
  "general_training",
  "shared",
  "academic_optional",
  "clearband_original",
  "licensed_source",
];

const SKILL_FILTERS: { value: Skill | "all"; label: string }[] = [
  { value: "all", label: "All skills" },
  { value: "listening", label: "Listening" },
  { value: "reading", label: "Reading" },
  { value: "writing", label: "Writing" },
  { value: "speaking", label: "Speaking" },
];

function difficultyLabel(difficulty?: number) {
  if (difficulty === 1) return "Foundation";
  if (difficulty === 3) return "Band 7+";
  return "Core";
}

// Lesson browser: skill + content filters, per-lesson progress, difficulty,
// CLB relevance, and a recommended next lesson. Defaults to the General
// Training path; Academic only appears when toggled on.
export function LessonBrowser({ lessons }: { lessons: (Lesson & { completed?: boolean })[] }) {
  const [filters, setFilters] = useState<ContentFilter[]>(DEFAULT_CONTENT_FILTERS);
  const [skill, setSkill] = useState<Skill | "all">("all");

  function toggle(filter: ContentFilter) {
    setFilters((current) =>
      current.includes(filter)
        ? current.filter((f) => f !== filter)
        : [...current, filter],
    );
  }

  const ordered = useMemo(() => [...lessons].sort((a, b) => a.order - b.order), [lessons]);
  const completedCount = ordered.filter((lesson) => lesson.completed).length;
  const recommended = ordered.find((lesson) => !lesson.completed) ?? null;

  const visible = useMemo(() => {
    const modules = moduleTypesForFilters(filters);
    const wantOriginal = filters.includes("clearband_original");
    const wantLicensed = filters.includes("licensed_source");
    return ordered.filter((lesson) => {
      if (skill !== "all" && lesson.skill !== skill) return false;
      if (!modules.includes(lesson.moduleType ?? "general_training")) return false;
      const isOriginal = (lesson.sourceName ?? "Clearband Original") === "Clearband Original";
      // If neither source filter is active, don't filter by source.
      if (!wantOriginal && !wantLicensed) return true;
      return isOriginal ? wantOriginal : wantLicensed;
    });
  }, [ordered, filters, skill]);

  return (
    <div className="space-y-4">
      {/* Curriculum progress */}
      <Card className="space-y-2 p-3.5">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold">Curriculum progress</span>
          <span className="font-mono text-xs text-[var(--text-muted)]">
            {completedCount} of {ordered.length} complete
          </span>
        </div>
        <ProgressBar
          value={ordered.length ? (completedCount / ordered.length) * 100 : 0}
          ariaLabel="Lessons completed"
        />
      </Card>

      {/* Recommended next lesson */}
      {recommended ? (
        <Card className="flex flex-wrap items-center gap-3 border-2 border-[var(--navy-700)]/15 p-3.5">
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
              Recommended next
            </p>
            <p className="truncate font-semibold">{recommended.title}</p>
            <p className="text-xs text-[var(--text-muted)]">
              {recommended.module} · {recommended.estMinutes} min · {difficultyLabel(recommended.difficulty)}
            </p>
          </div>
          <ButtonLink href={`/lessons/${recommended.id}`} size="sm">
            Start
            <ArrowRight className="h-4 w-4" aria-hidden />
          </ButtonLink>
        </Card>
      ) : null}

      {/* Skill filter */}
      <div className="flex flex-wrap gap-2" role="group" aria-label="Skill filters">
        {SKILL_FILTERS.map((entry) => {
          const active = skill === entry.value;
          return (
            <button
              key={entry.value}
              type="button"
              aria-pressed={active}
              onClick={() => setSkill(entry.value)}
              className={`min-h-9 rounded-full border px-3 text-sm ${active ? "border-2 border-[var(--navy-700)] bg-white font-semibold" : "border-[var(--border)] bg-white text-[var(--text-muted)]"}`}
            >
              {entry.label}
            </button>
          );
        })}
      </div>

      {/* Content classification filter */}
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
                <div className="flex items-center justify-between gap-2">
                  <Badge tone={lesson.skill}>{lesson.skill}</Badge>
                  {lesson.completed ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--success)]">
                      <CheckCircle2 className="h-4 w-4" aria-hidden />
                      Completed
                    </span>
                  ) : (
                    <span className="font-mono text-[10px] uppercase text-[var(--text-faint)]">
                      {(lesson.moduleType ?? "general_training").replace("_", " ")}
                    </span>
                  )}
                </div>
                <h2 className="text-lg font-semibold">{lesson.title}</h2>
                <p className="text-sm text-[var(--text-muted)]">{lesson.summary}</p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs text-[var(--text-muted)]">
                  <span>{lesson.estMinutes} min</span>
                  <span>{lesson.module}</span>
                  <span>{difficultyLabel(lesson.difficulty)}</span>
                  {lesson.clbFocus ? <span className="text-[var(--maple)]">{lesson.clbFocus}</span> : null}
                </div>
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
