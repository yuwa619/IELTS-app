# Clearband Netlify Deployment

Clearband can run on Netlify as a safe MVP with Supabase Auth and the current mock-first learner content. Netlify supports Next.js App Router, Route Handlers, middleware, SSR, and static assets through its Next.js runtime, so this app does not need Vercel-specific configuration.

## Deployment Mode

Production should normally run in Supabase mode:

- `NEXT_PUBLIC_SUPABASE_URL` is set.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set.
- Magic-link auth redirects through `/auth/callback`.
- Protected app routes require a Supabase session.
- Onboarding writes to Supabase.
- Current lessons, practice, AI feedback, mocks, and most learner content remain deterministic mock MVP content.

If the Supabase public env vars are missing, the app deliberately falls back to mock mode. That is useful for local demos, but it should not be the intended production state.

## 1. Push To GitHub

Commit the app and push it to a GitHub repository.

Do not commit `.env.local`, service-role keys, database passwords, or Supabase access tokens.

## 2. Create The Netlify Site

1. In Netlify, choose **Add new site** → **Import an existing project**.
2. Connect the GitHub repository.
3. If the repository root is this `clearband` folder, leave Base directory empty.
4. If the repository root is the parent workspace, set Base directory to `clearband`.
5. Use these build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
6. Deploy the site.

The committed `netlify.toml` already sets the same build command and publish directory.

## 3. Netlify Environment Variables

Add these in Netlify → Site configuration → Environment variables.

Required for Supabase mode:

```text
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
NEXT_PUBLIC_APP_URL=https://YOUR-NETLIFY-SITE.netlify.app
AI_PROVIDER=mock
```

Optional:

```text
NEXT_PUBLIC_SHOW_DATA_MODE=true
```

Use `NEXT_PUBLIC_SHOW_DATA_MODE=true` only temporarily if you want to visually confirm Supabase mode after deploy. Remove it after checking.

Do not add `SUPABASE_SERVICE_ROLE_KEY` to Netlify unless you later add a server-only job that genuinely needs it. The current deployed MVP does not need the service role key at runtime. Use it locally for seeding and migrations.

## 4. Supabase Project Setup

1. Create a Supabase project.
2. Copy the Project URL into `NEXT_PUBLIC_SUPABASE_URL`.
3. Copy the anon public key into `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. Keep the service-role key private and local for seed/migration work.

## 5. Run Migrations

Migration order (they build on each other):

1. `0001_clearband_schema.sql` — all core tables, enums, RLS policies.
2. `0002_auth_storage_seed_support.sql` — first-login trigger, storage buckets.
3. `0003_onboarding_test_details.sql` — test format/location, overall band.
4. `0004_learner_persistence.sql` — lesson_progress, revision uniqueness, indexes.

Option A — Supabase CLI:

```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

Option B — SQL Editor (no CLI needed): open the Supabase dashboard → SQL
Editor → paste the whole of `supabase/PRODUCTION_BOOTSTRAP.sql` and run it.
It is generated from all four migrations with idempotency guards, so it is
safe to run on a fresh **or** partially migrated project — it never drops
tables or deletes user data.

### Check which tables exist

```sql
select table_name from information_schema.tables
where table_schema = 'public' order by table_name;
```

You should see (checklist): `user_profiles`, `onboarding_goals`,
`clb_targets`, `study_plans`, `daily_tasks`, `lesson_progress`,
`practice_attempts`, `writing_attempts`, `speaking_attempts`,
`mock_attempts`, `revision_items`, `error_logs`, `xp_events`, `badges`,
`user_badges`, `user_vocabulary_progress`, plus the content tables
(`lessons`, `lesson_sections`, `practice_questions`, `writing_prompts`,
`speaking_prompts`, `vocabulary_items`, `grammar_items`, `mock_exams`,
`mock_sections`, `subscriptions`, `admin_users`, `diagnostic_attempts`,
`diagnostic_answers`).

### Check RLS policies exist

```sql
select tablename, policyname from pg_policies
where schemaname = 'public' order by tablename;
```

Every user-owned table above must have an "own ..." policy. To test RLS
end-to-end: sign in as two different emails, complete a practice question as
user A, then as user B open `/progress` — B must never see A's attempts.

## 6. Seed Original Content

Create a local `.env.local` with:

```text
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
```

Then run:

```bash
npm run seed:supabase
```

The seed script only uses original IELTS-style Clearband content. Do not import official IELTS questions, model answers, audio, logos, or trademarks.

## 7. Supabase Auth Redirect URLs

In Supabase → Authentication → URL Configuration:

Site URL:

```text
https://YOUR-NETLIFY-SITE.netlify.app
```

Redirect URLs:

```text
http://localhost:3000/auth/callback
https://YOUR-NETLIFY-SITE.netlify.app/auth/callback
```

Use the exact `/auth/callback` URL. Do not include `?next=...` in the Supabase allow-list; Clearband decides whether to send the user to `/onboarding` or `/dashboard` after the callback succeeds.

If the redirect URL is missing from this allow-list, Supabase silently falls back to the Site URL, so magic links land on `/` and the user never gets a session. Clearband's proxy now rescues auth codes that land on `/` or `/login` by forwarding them to `/auth/callback`, but the allow-list should still be correct.

If you add a custom domain later, add:

```text
https://YOUR-CUSTOM-DOMAIN/auth/callback
```

### Recommended: token_hash email template (works across devices)

The default `{{ .ConfirmationURL }}` magic-link template uses the PKCE `?code=` flow, which only works in the same browser that requested the link. For links that also work when opened on another device or browser, change the **Magic Link** email template in Supabase → Authentication → Email Templates to:

```html
<a href="{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=email">Sign in to Clearband</a>
```

`/auth/callback` supports both `?code=` and `?token_hash=` links.

Google and Apple buttons are hidden until you enable the provider in Supabase Auth **and** set `NEXT_PUBLIC_OAUTH_PROVIDERS` (for example `NEXT_PUBLIC_OAUTH_PROVIDERS=google,apple`) in Netlify.

## 8. Test Magic-Link Login On Netlify

1. Open `https://YOUR-NETLIFY-SITE.netlify.app/login`.
2. Enter your email.
3. Click the magic link in your email.
4. Confirm the browser lands on `/auth/callback` briefly, then redirects to `/onboarding` or the requested `next` path.
5. Complete onboarding.
6. Confirm `/dashboard` opens.

## 9. Confirm Supabase Mode

Recommended temporary check:

1. Set `NEXT_PUBLIC_SHOW_DATA_MODE=true` in Netlify.
2. Redeploy.
3. Confirm the top banner says **Supabase mode**.
4. Remove `NEXT_PUBLIC_SHOW_DATA_MODE`.
5. Redeploy again.

If the banner says **Mock mode** in production, the Supabase public env vars are missing or misspelled.

## 9b. Test Returning-User Persistence (cross-device)

This is the primary success condition:

1. On your laptop, sign in and complete onboarding.
2. Complete at least one daily task on `/today` and one practice question.
3. Open Settings → the **Data status** panel must show `Supabase mode`,
   `signed in`, profile/onboarding/plan all `yes`, and a recent
   "last saved activity" time.
4. Sign out (`/auth/logout`), close the browser, reopen, sign in with the
   same email → you must land on `/dashboard` (NOT onboarding) with the same
   XP, tasks, and progress.
5. On your phone, sign in with the same email → same dashboard, same
   progress. (With the default `?code=` email flow, request the magic link
   from the phone itself; with the `token_hash` template, any device works.)

If the app ever shows mock-user data ("Amir", 12-day streak) while you are
signed in on production, the Supabase env vars are missing at build time —
check section 3 and redeploy. Mock mode is only for local dev without env
vars; production writes fail loudly with a visible error instead of
pretending to save.

## 10. Post-Deploy Smoke Checklist

- Open the Netlify URL on a laptop.
- Open the Netlify URL on a phone.
- Open the Netlify URL on an iPad/tablet.
- Go to `/login`.
- Request a magic link.
- Click the email link.
- Confirm `/auth/callback` works.
- Complete onboarding.
- Confirm `/dashboard` opens.
- Open `/today`.
- Open `/practice/writing/task-2`.
- Open `/practice/speaking`.
- Open `/mocks/mini-mock-1`.
- Open `/settings`.
- Logout and login again.

## Production Safety Notes

- Admin pages are protected by Supabase middleware in Supabase mode. In mock mode they display mock/admin demo content only.
- The app does not call live AI APIs.
- AI feedback remains deterministic and labelled as an estimated practice score, not an official IELTS score.
- Stripe is not implemented.
- Speaking recording upload is not live.
- Service-role keys must remain server-only/local and must never use a `NEXT_PUBLIC_` prefix.
- Keep mock mode available as a safe fallback, but do not rely on it for production learner accounts.
