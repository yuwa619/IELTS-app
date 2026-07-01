# Clearband MVP

Clearband is a mobile-first PWA for IELTS General Training preparation for Canadian Express Entry. It is Canada-first, calm, exam-oriented, and mock-data safe by default.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Mock mode

If Supabase environment variables are missing, the app runs with isolated mock data and deterministic services. No live AI, Stripe, audio upload, or billing dependency is required.

## Environment

Copy `.env.example` to `.env.local`.

```bash
cp .env.example .env.local
```

Required for live Supabase:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` for migrations/seeding/admin scripts only
- `NEXT_PUBLIC_APP_URL`, usually `http://localhost:3000` locally or your Netlify URL in production
- `NEXT_PUBLIC_SHOW_DATA_MODE=true` only if you want the mode banner visible in production

Keep service-role keys server-only. Never expose them to client components.

For Netlify production setup, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## Key routes

- `/` landing
- `/login`
- `/onboarding`
- `/diagnostic`
- `/dashboard`
- `/today`
- `/lessons`
- `/practice/listening`
- `/practice/reading`
- `/practice/writing/task-1`
- `/practice/writing/task-2`
- `/practice/speaking`
- `/mocks`
- `/review`
- `/progress`
- `/settings`
- `/admin`

## Supabase

Schema and RLS files live in `supabase/migrations/`.

- `0001_clearband_schema.sql` creates Clearband domain tables, enums, content tables, RLS, and admin helper policies.
- `0002_auth_storage_seed_support.sql` adds first-login profile creation, seed-friendly constraints, indexes, `updated_at` triggers, and the private `speaking-recordings` storage bucket with per-user object policies.

User-owned tables enforce `user_id = auth.uid()`. Published content is readable; content writes are guarded by `admin_users` and `is_admin()`.

Admin UI/API runs only in mock mode by default. If Supabase env vars are configured, ungated admin is blocked until real `admin_users` auth checks are wired. For a temporary local demo with Supabase env vars present, set `CLEARBAND_ALLOW_UNGATED_ADMIN=true`.

### Data mode pattern

The app uses an explicit data mode check:

- Missing Supabase env vars → `mock` mode with deterministic local services.
- Supabase env vars present → `supabase` mode, where write routes must require an authenticated Supabase user and write rows scoped to that user id.

`POST /api/onboarding` is the first live-write example. In mock mode it returns the existing mock goal/target response. In Supabase mode it requires `supabase.auth.getUser()`, then upserts `user_profiles`, `onboarding_goals`, and `clb_targets`. Use this route as the pattern for gradually migrating the remaining write APIs.

The development data-mode banner appears by default outside production:

- Mock mode: Supabase vars are missing and all screens use local mock data.
- Supabase mode: Supabase vars are present, route protection is active, and onboarding writes to Supabase.

In production the banner is hidden unless `NEXT_PUBLIC_SHOW_DATA_MODE=true`.

### Local Supabase

Install and log in to the Supabase CLI, then:

```bash
supabase init
supabase start
supabase db reset
```

Copy the local API URL and anon key printed by the CLI into `.env.local`. Use the local service role key for `SUPABASE_SERVICE_ROLE_KEY` only on your machine.

Run the original IELTS-style seed content:

```bash
npm run seed:supabase
```

### Cloud Supabase

1. Create a Supabase project.
2. In Project Settings → API, copy the project URL and anon public key into `.env.local` or your hosting env vars.
3. Add the service role key only to server-side/local migration environments.
4. Link the CLI and push migrations:

```bash
supabase link --project-ref <your-project-ref>
supabase db push
npm run seed:supabase
```

### Auth setup

Email magic links are wired through `/auth/callback`.

In Supabase Auth → URL Configuration:

- Site URL: `http://localhost:3000` locally, or your production URL.
- Redirect URLs:
  - `http://localhost:3000/auth/callback`
  - `https://YOUR-NETLIFY-SITE.netlify.app/auth/callback`
  - `https://your-domain.com/auth/callback` if you add a custom domain

Google and Apple buttons are provider-ready. Enable each provider in Supabase Auth → Providers, add provider client credentials, and keep the same callback URL. In mock mode these buttons show setup placeholder text and do not leave the app.

To test magic-link auth locally:

1. Run Supabase locally or configure a cloud project.
2. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to `.env.local`.
3. Run `npm run dev`.
4. Open `/login`, enter an email, and submit.
5. Open the email link or, for local Supabase, inspect the Inbucket/Mailpit URL printed by `supabase start`.
6. The callback should land on `/onboarding` or the `next` route from the original login redirect.

In Supabase mode, app routes such as `/dashboard`, `/today`, `/practice/*`, `/mocks/*`, `/settings`, and `/admin` redirect unauthenticated users to `/login?next=...`. In mock mode these routes remain open for demo use.

### Storage setup

Migration `0002_auth_storage_seed_support.sql` creates these private buckets:

| Bucket | Purpose | Read access | Write/delete access |
|---|---|---|---|
| `speaking-recordings` | User-owned speaking practice audio | Owning authenticated user only | Owning authenticated user only |
| `listening-audio` | Original listening-practice audio assets | Authenticated learners | Admins only |
| `content-media` | Lesson media, captions/transcripts, PDFs or images | Authenticated learners | Admins only |

Speaking recordings should use per-user paths:

```text
speaking-recordings/{userId}/{attemptId}.webm
```

Listening/content media can use content-managed paths:

```text
listening-audio/{questionId}/audio.webm
content-media/{contentType}/{contentId}/{assetName}
```

The current MVP recorder keeps audio local unless live upload is wired. Future signed-upload work should call `/api/speaking/upload-url`, write to `speaking-recordings`, and ensure delete/export controls in Settings remove both DB rows and storage objects. Listening and content-media uploads should be admin-only server actions or signed uploads guarded by `admin_users`.

## AI and legal guardrails

The MVP uses `MockAIProvider` only. Writing and Speaking feedback includes: “This is an estimated practice score, not an official IELTS score.” The tutor refuses full essay/speaking answer authoring and memorisation requests.

## Checks

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

## Known limitations

- Auth UI supports mock mode, magic-link sign-in, provider-ready Google/Apple buttons, Supabase-mode route protection, and logout.
- Onboarding is the only write route currently wired to live Supabase. Other write routes remain mock-first until migrated with the same authenticated pattern.
- Speaking audio is recorded locally; signed Supabase Storage upload is scaffolded but not live.
- Stripe tables/env are stubbed only.
- Practice scoring uses deterministic mock content and approximate raw-to-band constants.
