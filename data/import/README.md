# Licensed content import (review-first, currently dormant)

This folder is the staging area for **future** third-party content that you have
a **written licence** to digitise, store in Supabase, and display in Clearband.

**Nothing here is imported automatically, and no Kaplan (or other third-party)
content is included.** The pipeline stays dormant until you drop in an approved,
licensed manifest.

## Copyright rule (enforced in code)

`src/lib/content/import-schema.ts` refuses to import a batch unless **all** of
these are true:

- `source.is_licensed = true`
- `source.written_licence_reference` is set (a reference to your written licence
  agreement — not just book ownership)
- each item has `licence_status = "licensed"`, `review_status = "approved"`,
  and `approved_for_import = true`

Owning or having read a book is **not** a licence to reproduce it. Do not place
content here unless a written licence permits digitising, database storage, and
in-app display.

## Pipeline

```
your licensed source → manifest.json (review_status: pending)
   → manual review (set approved items to approved / approved_for_import)
   → npm run import:licensed -- data/import/<source>/manifest.json --dry-run
   → npm run import:licensed -- data/import/<source>/manifest.json   (inserts approved items only)
```

- `--dry-run` validates and prints what *would* import without writing.
- Personal-use-only sources import as `access_scope = "admin_only"`, so RLS keeps
  them visible to admins only, never the public GT path.
- Academic items import with `module_type = "academic"` and never enter the
  Express Entry path or readiness scores.

## Files

- `manifest.template.json` — the shape a real manifest must follow (empty items).
- `example-empty/manifest.json` — a valid manifest with zero items, used by tests
  and as a copy-me starting point.

Do not commit the source PDF/book here, and never store it in public Supabase
storage or expose it in the app.
