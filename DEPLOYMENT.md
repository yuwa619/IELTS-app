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

Install and authenticate the Supabase CLI locally, then link the project:

```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

The migrations create the MVP tables, indexes, RLS policies, auth profile trigger, and private storage buckets.

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

If you add a custom domain later, add:

```text
https://YOUR-CUSTOM-DOMAIN/auth/callback
```

Google and Apple buttons are provider-ready only. To activate them later, enable the providers in Supabase Auth and use the same app callback URL pattern.

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
