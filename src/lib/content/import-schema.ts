import { z } from "zod";

// Validation for the review-first licensed-content import pipeline.
// Nothing is inserted unless review_status === "approved" AND
// approved_for_import === true AND licence_status === "licensed".

export const moduleTypeSchema = z.enum([
  "general_training",
  "academic",
  "shared",
  "unknown",
]);

export const importSkillSchema = z.enum([
  "listening",
  "reading",
  "writing_task_1",
  "writing_task_2",
  "speaking",
  "vocabulary",
  "grammar",
  "strategy",
]);

export const importSourceTypeSchema = z.enum([
  "lesson",
  "practice_question",
  "mock_test",
  "transcript",
  "answer_key",
  "explanation",
  "prompt",
]);

export const importItemSchema = z.object({
  external_ref: z.string().min(1),
  module_type: moduleTypeSchema,
  skill: importSkillSchema,
  source_type: importSourceTypeSchema,
  prompt: z.string().min(1),
  payload: z.record(z.string(), z.unknown()).default({}),
  answer_key: z.record(z.string(), z.unknown()).nullable().optional(),
  explanation: z.string().optional(),
  source_page_start: z.number().int().nonnegative().optional(),
  source_page_end: z.number().int().nonnegative().optional(),
  licence_status: z.enum(["licensed", "unlicensed", "unknown"]),
  review_status: z.enum(["pending", "approved", "rejected"]),
  approved_for_import: z.boolean(),
});

export const importManifestSchema = z.object({
  source: z.object({
    name: z.string().min(1),
    publisher: z.string().optional(),
    edition: z.string().optional(),
    source_year: z.number().int().optional(),
    is_licensed: z.boolean(),
    personal_use_only: z.boolean(),
    licence_note: z.string().optional(),
    attribution: z.string().optional(),
    // A written licence reference is required before any import can run.
    written_licence_reference: z.string().optional(),
  }),
  batch: z.object({
    name: z.string().min(1),
    notes: z.string().optional(),
  }),
  items: z.array(importItemSchema),
});

export type ImportItem = z.infer<typeof importItemSchema>;
export type ImportManifest = z.infer<typeof importManifestSchema>;

export interface ImportGateResult {
  ok: boolean;
  reasons: string[];
  approvedItems: ImportItem[];
}

// Central gate: decides whether a manifest may be imported at all, and which
// items pass. Refuses the whole batch if the source is not licensed with a
// written reference, mirroring the app's copyright rule.
export function evaluateImportGate(manifest: ImportManifest): ImportGateResult {
  const reasons: string[] = [];

  // Hard blockers — any of these fails the whole batch.
  let blockedByLicence = false;
  if (!manifest.source.is_licensed) {
    reasons.push("source.is_licensed is false — cannot import unlicensed content.");
    blockedByLicence = true;
  }
  if (!manifest.source.written_licence_reference) {
    reasons.push(
      "source.written_licence_reference is missing — a written licence permitting digitising, storage and in-app display is required before import.",
    );
    blockedByLicence = true;
  }

  const approvedItems = manifest.items.filter(
    (item) =>
      item.licence_status === "licensed" &&
      item.review_status === "approved" &&
      item.approved_for_import === true,
  );

  // Informational only — the approved subset still imports.
  const skipped = manifest.items.length - approvedItems.length;
  if (skipped > 0) {
    reasons.push(
      `${skipped} item(s) skipped (need licence_status=licensed, review_status=approved, approved_for_import=true).`,
    );
  }
  if (approvedItems.length === 0) {
    reasons.push("No approved items to import.");
  }

  return {
    ok: !blockedByLicence && approvedItems.length > 0,
    reasons,
    approvedItems,
  };
}

// Personal-use-only sources are inserted as admin_only so RLS keeps them off
// the public path.
export function accessScopeForSource(personalUseOnly: boolean): "public" | "admin_only" {
  return personalUseOnly ? "admin_only" : "public";
}
