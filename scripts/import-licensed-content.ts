/**
 * Review-first licensed-content importer (dormant by default).
 *
 * Usage:
 *   npm run import:licensed -- data/import/<source>/manifest.json --dry-run
 *   npm run import:licensed -- data/import/<source>/manifest.json
 *
 * It refuses to write anything unless the manifest passes evaluateImportGate:
 * the source must be licensed with a written_licence_reference, and each item
 * must be licence_status=licensed, review_status=approved, approved_for_import.
 * No third-party content ships with the repo; this only runs on manifests you
 * are licensed to import.
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import {
  accessScopeForSource,
  evaluateImportGate,
  importManifestSchema,
  type ImportItem,
} from "../src/lib/content/import-schema";
import { skillTagToSkill } from "../src/lib/content/classification";

const args = process.argv.slice(2);
const manifestPath = args.find((a) => !a.startsWith("--"));
const dryRun = args.includes("--dry-run");

if (!manifestPath) {
  console.error("Usage: import-licensed-content.ts <manifest.json> [--dry-run]");
  process.exit(1);
}

const manifestRaw = JSON.parse(readFileSync(manifestPath, "utf8"));
const parsed = importManifestSchema.safeParse(manifestRaw);
if (!parsed.success) {
  console.error("Manifest failed validation:");
  for (const issue of parsed.error.issues) {
    console.error(` - ${issue.path.join(".")}: ${issue.message}`);
  }
  process.exit(1);
}
const manifest = parsed.data;

const gate = evaluateImportGate(manifest);
console.log(`Source: ${manifest.source.name}`);
console.log(`Items in manifest: ${manifest.items.length}`);
console.log(`Approved for import: ${gate.approvedItems.length}`);
if (gate.reasons.length) {
  console.log("Gate notes:");
  gate.reasons.forEach((r) => console.log(` - ${r}`));
}

if (!gate.ok) {
  console.error(
    "\nImport blocked. Nothing was written. Resolve the notes above (a written licence and approved items are required).",
  );
  process.exit(gate.approvedItems.length === 0 && manifest.items.length === 0 ? 0 : 1);
}

if (dryRun) {
  console.log("\n--dry-run: would import the following approved items:");
  gate.approvedItems.forEach((item) =>
    console.log(` - [${item.module_type}/${item.skill}] ${item.external_ref}`),
  );
  process.exit(0);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}
const supabase = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main(approved: ImportItem[]) {
  const accessScope = accessScopeForSource(manifest.source.personal_use_only);

  const { data: sourceRow, error: sourceErr } = await supabase
    .from("content_sources")
    .upsert(
      {
        name: manifest.source.name,
        publisher: manifest.source.publisher ?? null,
        edition: manifest.source.edition ?? null,
        source_year: manifest.source.source_year ?? null,
        is_licensed: manifest.source.is_licensed,
        personal_use_only: manifest.source.personal_use_only,
        licence_note: manifest.source.licence_note ?? null,
        attribution: manifest.source.attribution ?? null,
      },
      { onConflict: "name" },
    )
    .select("id")
    .single();
  if (sourceErr) throw sourceErr;

  const { data: batchRow, error: batchErr } = await supabase
    .from("imported_content_batches")
    .insert({
      source_id: sourceRow.id,
      name: manifest.batch.name,
      status: "imported",
      item_count: approved.length,
      notes: manifest.batch.notes ?? null,
    })
    .select("id")
    .single();
  if (batchErr) throw batchErr;

  // Only practice_question items are inserted into practice_questions here;
  // other source_types would route to their tables in the same pattern.
  const questionRows = approved
    .filter((item) => item.source_type === "practice_question")
    .map((item) => ({
      skill: skillTagToSkill(item.skill) ?? "reading",
      question_type: (item.payload.question_type as string) ?? "short_answer",
      topic: (item.payload.topic as string) ?? "imported",
      difficulty: (item.payload.difficulty as number) ?? 3,
      prompt: item.prompt,
      payload: item.payload,
      answer_key: item.answer_key ?? {},
      explanation: item.explanation ?? "",
      published: true,
      module_type: item.module_type,
      express_entry_relevant: item.module_type !== "academic",
      canada_path_eligible: item.module_type === "general_training" || item.module_type === "shared",
      access_scope: accessScope,
      review_status: "approved",
      source_id: sourceRow.id,
      import_batch_id: batchRow.id,
      source_page_start: item.source_page_start ?? null,
      source_page_end: item.source_page_end ?? null,
      imported_from: manifest.source.name,
    }));

  if (questionRows.length) {
    const { error } = await supabase
      .from("practice_questions")
      .upsert(questionRows, { onConflict: "skill,question_type,prompt" });
    if (error) throw error;
  }

  console.log(
    `\nImported ${questionRows.length} practice question(s) as ${accessScope} from "${manifest.source.name}".`,
  );
}

main(gate.approvedItems).catch((error) => {
  console.error("Import failed:", error);
  process.exit(1);
});
