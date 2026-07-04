# CLEARBAND_AUTH_HANDOFF_FOR_CLAUDE.md

## 1. Project Overview

App name: **Clearband**

Product: Mobile-first Progressive Web App for IELTS General Training preparation for Canadian Express Entry.

Tech stack:

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase Auth / Postgres / Storage scaffolding
- Netlify deployment
- Deterministic mock AI provider only
- Stripe-ready architecture only; no live Stripe

Production URL:

```text
https://clearband.netlify.app
```

Current auth callback route:

```text
/auth/callback
https://clearband.netlify.app/auth/callback
```

Deployment platform: Netlify.

Supabase setup:

- Public env vars are expected in Netlify.
- Supabase Auth magic-link email sends successfully in production.
- App has mock mode fallback when public Supabase vars are missing.
- Onboarding API has the first real authenticated Supabase write path.

Intended auth method:

- Primary: Supabase magic-link email.
- Google and Apple buttons exist as provider-ready UI, but only work after providers are enabled in Supabase.
- Google previously returned “Unsupported provider: provider is not enabled”, which is expected if Google is disabled in Supabase Auth providers.

## 2. Current Intended Auth Behaviour

The intended login flow is:

1. User opens `/login`.
2. User enters email.
3. `src/app/(auth)/login/login-form.tsx` calls `supabase.auth.signInWithOtp`.
4. Supabase sends a magic-link email.
5. User clicks magic link.
6. Supabase redirects browser to:

```text
https://clearband.netlify.app/auth/callback?code=...
```

7. `src/app/auth/callback/route.ts` reads `code`.
8. Callback calls:

```ts
supabase.auth.exchangeCodeForSession(code)
```

9. Supabase SSR client writes session cookies.
10. Callback creates or updates `user_profiles` through `ensureUserProfile`.
11. Callback checks `user_profiles.onboarded`.
12. Callback redirects:

- `/onboarding` if onboarding is incomplete.
- `/dashboard` if onboarding is complete.

13. Middleware should then recognise the Supabase session cookie on protected app routes.

Successful login should never redirect to `/`.

## 3. Current Bug

Observed in production:

- Clearband is live at `https://clearband.netlify.app`.
- Supabase is connected.
- Magic-link email sends successfully.
- Clicking the email link opens the app.
- User is not logged in.
- User ends up on landing page `/`.
- Expected route is `/onboarding` or `/dashboard`.

Earlier Google login behaviour:

- Google button returned:

```text
Unsupported provider: provider is not enabled
```

This indicates Google OAuth provider is not enabled/configured in Supabase, not necessarily a Clearband code issue.

## 4. Files Involved In Auth

### `src/app/(auth)/login/login-form.tsx`

Client component for magic-link and OAuth provider sign-in.

Responsibilities:

- Reads `next` query param.
- Builds callback URL using `buildAuthCallbackUrl`.
- Calls `supabase.auth.signInWithOtp`.
- Calls `supabase.auth.signInWithOAuth` for Google/Apple.
- Displays callback/auth errors.
- Falls back to local mock navigation in mock mode.

### `src/app/(auth)/login/page.tsx`

Server page for `/login`.

Responsibilities:

- Determines mock vs Supabase mode using `isMockMode`.
- Renders `LoginForm` inside `Suspense`.
- Shows “mock mode” or “Supabase Auth configured” alert.

### `src/app/auth/callback/route.ts`

Route Handler for `/auth/callback`.

Responsibilities:

- Reads Supabase callback `code`.
- Handles provider/callback errors.
- Exchanges code for session.
- Creates/updates profile.
- Redirects to `/onboarding` or `/dashboard`.
- Adds safe debug logging.

### `src/app/auth/logout/route.ts`

Route Handler for logout.

Responsibilities:

- Calls `supabase.auth.signOut`.
- Redirects to `/login`.

### `middleware.ts`

Root Next.js middleware.

Responsibilities:

- Delegates to `updateSession`.
- Matches all paths except static Next assets and favicon.

### `src/lib/supabase/env.ts`

Supabase environment/data-mode detection.

Responsibilities:

- Detects public Supabase vars.
- Determines mock mode.
- Builds public site URL fallback.

### `src/lib/supabase/client.ts`

Browser Supabase client.

Responsibilities:

- Returns `null` in mock mode.
- Uses `createBrowserClient` from `@supabase/ssr` in Supabase mode.

### `src/lib/supabase/server.ts`

Server Supabase client and profile helper.

Responsibilities:

- Returns `null` in mock mode.
- Uses `createServerClient` from `@supabase/ssr`.
- Reads/writes cookies using Next App Router `cookies()`.
- Provides `getCurrentUser`.
- Provides `ensureUserProfile`.

### `src/lib/supabase/middleware.ts`

Middleware Supabase client/session refresh and route protection.

Responsibilities:

- Skips `/auth/callback`.
- Returns open routes in mock mode.
- Refreshes Supabase user in Supabase mode.
- Protects `/dashboard`, `/today`, `/practice`, `/mocks`, `/settings`, `/admin`, and other app routes.
- Redirects unauthenticated protected routes to `/login?next=...`.
- Redirects authenticated `/login` to `/dashboard`.

### `src/lib/supabase/auth-redirects.ts`

Auth helper added during the last attempted fix.

Responsibilities:

- Builds exact callback URL.
- Maps auth errors to user-facing messages.
- Classifies callback/provider errors.
- Determines post-auth redirect based on `user_profiles.onboarded`.

### `src/app/api/onboarding/route.ts`

Onboarding API.

Responsibilities:

- In mock mode: writes through mock onboarding service.
- In Supabase mode: requires authenticated user.
- Upserts `user_profiles`, `onboarding_goals`, and `clb_targets`.
- Sets `user_profiles.onboarded = true`.

### Auth/session/profile tests

Relevant tests:

- `tests/auth-callback.test.ts`
- `tests/login-form.test.tsx`
- `tests/supabase-mode.test.ts`
- `tests/onboarding-api.test.ts`

## 5. Environment Variables

Expected Netlify environment variables:

```text
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_APP_URL=https://clearband.netlify.app
AI_PROVIDER=mock
```

Optional:

```text
NEXT_PUBLIC_SHOW_DATA_MODE=true
```

Local/admin only:

```text
SUPABASE_SERVICE_ROLE_KEY=...
```

Do not expose service role key to the browser. It must never use a `NEXT_PUBLIC_` prefix.

Mock mode vs Supabase mode:

- `hasSupabaseEnv()` returns true only when both:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `isMockMode()` is `!hasSupabaseEnv()`.
- In mock mode, login uses local fallback and routes remain open.
- In Supabase mode, protected routes require session.

Current `.env.example`:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
CLEARBAND_ALLOW_UNGATED_ADMIN=
NEXT_PUBLIC_SHOW_DATA_MODE=

# MVP stays deterministic. Do not set a live provider until guardrails,
# retention, consent, and cost controls are implemented.
AI_PROVIDER=mock

# Stripe architecture is stubbed in the MVP.
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

## 6. Supabase Configuration Expected

Expected Supabase Auth URL Configuration:

Site URL:

```text
https://clearband.netlify.app
```

Redirect URLs:

```text
https://clearband.netlify.app/auth/callback
http://localhost:3000/auth/callback
```

Important:

- The redirect URL should be exact `/auth/callback`.
- Do not include `?next=...` in the allow-list.
- If a custom domain is added later, also add `https://CUSTOM_DOMAIN/auth/callback`.

Auth providers:

- Email magic link must be enabled.
- Google is currently not enabled/configured, based on “Unsupported provider: provider is not enabled”.
- Apple is provider-ready in UI but should not be expected to work unless enabled/configured in Supabase.

Magic-link email settings:

- Supabase sends the magic-link email correctly.
- Earlier there was a Supabase “email rate limit exceeded” error. That is Supabase email rate limiting, not a Clearband code issue.
- For production testing, custom SMTP should be configured if rate limits are a problem.

Tables involved in auth/profile/onboarding:

- `auth.users`
- `public.user_profiles`
- `public.onboarding_goals`
- `public.clb_targets`
- `public.subscriptions`

Relevant profile table:

```sql
create table public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  locale text not null default 'en-CA',
  onboarded boolean not null default false,
  daily_minutes int not null default 30 check (daily_minutes between 10 and 90),
  consent_audio boolean not null default false,
  consent_samples boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

Relevant RLS:

```sql
alter table public.user_profiles enable row level security;
alter table public.onboarding_goals enable row level security;
alter table public.clb_targets enable row level security;

create policy "own rows" on public.user_profiles
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "own goals" on public.onboarding_goals
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "own targets" on public.clb_targets
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
```

First-login trigger from migration `0002_auth_storage_seed_support.sql`:

```sql
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_profiles (user_id, display_name, locale)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', new.raw_user_meta_data ->> 'full_name'),
    coalesce(new.raw_user_meta_data ->> 'locale', 'en-CA')
  )
  on conflict (user_id) do nothing;

  insert into public.subscriptions (user_id, plan, status, entitlements)
  values (new.id, 'free', 'active', '{"mock_limit": true}'::jsonb)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

Storage:

- Not directly relevant to login.
- `speaking-recordings`, `listening-audio`, and `content-media` buckets are scaffolded.
- Speaking upload is not live.

## 7. Netlify Configuration

Current `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "20"
  AI_PROVIDER = "mock"

[dev]
  command = "npm run dev"
  targetPort = 3000
  port = 8888
  framework = "#auto"
```

Build command:

```text
npm run build
```

Publish directory:

```text
.next
```

Node version:

```text
20
```

Netlify/Next assumptions:

- Netlify Next runtime handles App Router.
- App Route Handlers under `/app/api/*` are expected to deploy as Netlify Functions.
- Next middleware is expected to deploy as Netlify middleware/proxy.
- `/auth/callback` is a dynamic Route Handler.
- The callback and middleware rely on `@supabase/ssr` cookies working correctly on Netlify.

Netlify-specific auth/cookie concerns for Claude to investigate:

- Whether cookies set by `exchangeCodeForSession` in a Route Handler are persisted in Netlify production.
- Whether `NextResponse.redirect` from the callback carries `Set-Cookie` correctly.
- Whether the callback route needs a different Supabase SSR adapter pattern for Netlify.
- Whether middleware skipping `/auth/callback` prevents necessary PKCE code verifier cookies from being read/refreshed.
- Whether Netlify cache/CDN behaviour affects auth callback responses.

## 8. Recent Fixes Already Attempted

Recent attempted auth fixes:

1. Added `NEXT_PUBLIC_APP_URL` support.
2. Changed magic-link callback URL to exact:

```text
https://clearband.netlify.app/auth/callback
```

Previously callback URL included dynamic `?next=...`, which may have caused Supabase redirect allow-list mismatch.

3. Added `src/lib/supabase/auth-redirects.ts`.
4. Changed login form to use `buildAuthCallbackUrl`.
5. Changed callback route to:
   - read `code`
   - call `exchangeCodeForSession(code)`
   - require `data.session` and `data.user`
   - call `ensureUserProfile`
   - redirect to `/onboarding` or `/dashboard`
   - redirect callback failures to `/login?error=...`
6. Added safe debug logs:

```text
[clearband-auth-callback]
```

These logs intentionally do not include tokens, magic links, access tokens, refresh tokens, or secrets.

7. Updated middleware to skip `/auth/callback`.
8. Updated middleware to apply Supabase SSR cache headers passed to `setAll`.
9. Added tests for callback route and login form.
10. Updated deployment docs to warn not to include query params in Supabase redirect allow-list.

Important: The user reports the live production bug still exists. It is possible these changes were not deployed, or they were deployed and did not solve the underlying Netlify/Supabase cookie/session issue.

## 9. Tests And Verification

Latest local verification after the attempted fix:

```text
npm run typecheck  -> passed
npm run lint       -> passed
npm test           -> passed, 8 files, 21 tests
npm run build      -> passed
```

Auth-related tests:

### `tests/auth-callback.test.ts`

Asserts:

- Missing code redirects to `/login?error=missing_code`.
- Failed exchange redirects to `/login?error=expired_link`.
- Successful exchange with incomplete onboarding redirects to `/onboarding`.
- Successful exchange with completed onboarding redirects to `/dashboard`.
- Successful exchange does not redirect to `/`.

### `tests/login-form.test.tsx`

Asserts:

- Magic-link request uses:

```text
https://clearband.netlify.app/auth/callback
```

- Login form shows callback failure messages.

### `tests/supabase-mode.test.ts`

Asserts:

- Missing Supabase env vars means mock mode.
- Present public Supabase env vars means Supabase mode.
- `NEXT_PUBLIC_APP_URL` builds callback URL.
- Protected routes are classified correctly.
- `/auth/callback` is not classified as protected.

### `tests/onboarding-api.test.ts`

Asserts:

- Mock onboarding works without Supabase env vars.
- Supabase mode requires authenticated user.
- Supabase onboarding writes `user_profiles`, `onboarding_goals`, and `clb_targets`.

## 10. Suspected Causes

Best technical suspects for Claude:

1. **Production has not deployed the latest auth fix.**
   - The user may still be seeing the pre-fix version where `emailRedirectTo` included `?next=...`.
   - Check GitHub commit deployed by Netlify.
   - Check Netlify deploy logs and timestamp.

2. **Supabase redirect allow-list mismatch.**
   - If the deployed app still sends `https://clearband.netlify.app/auth/callback?next=...`, Supabase may fall back to Site URL `/`.
   - Confirm actual magic-link URL or Supabase redirect logs.
   - Supabase redirect URL should be exact `/auth/callback`.

3. **`exchangeCodeForSession` is not receiving `code`.**
   - If Supabase sends the user to `/` instead of `/auth/callback`, callback never runs.
   - Check Netlify function logs for `[clearband-auth-callback]`.
   - If no logs exist after clicking email link, Supabase is not redirecting to callback.

4. **`exchangeCodeForSession` fails on Netlify because cookies/PKCE verifier are missing.**
   - Supabase magic links with PKCE can depend on verifier state.
   - Confirm whether passwordless OTP link flow requires browser storage/cookie from the same device/browser where request started.
   - If user requests magic link on one device/browser and opens it on another, PKCE can fail depending on configuration/client flow.

5. **Netlify/Next Route Handler is not persisting cookies after `exchangeCodeForSession`.**
   - Current server client uses `cookies()` and `setAll`.
   - Need compare against working app.
   - Route Handler returns `NextResponse.redirect`; verify `Set-Cookie` headers survive.

6. **Middleware behaviour.**
   - Middleware now skips `/auth/callback`.
   - Need verify this is correct.
   - Alternative: Supabase examples often let middleware run everywhere and refresh session, but callback route must still exchange code.

7. **App thinks it is in mock/logged-out mode after callback.**
   - If cookies are not written, protected route redirects back to `/login`.
   - However user reports landing page `/`, which suggests Supabase redirect fallback or old code rather than protected-route redirect.

8. **Netlify env vars missing or stale.**
   - `NEXT_PUBLIC_APP_URL` must be set to:

```text
https://clearband.netlify.app
```

   - If not set, login form falls back to `window.location.origin`, which should still be `https://clearband.netlify.app` in production.
   - Public Supabase env vars must be set at build time and runtime.

9. **Supabase Auth Site URL is set to landing page and callback URL is not accepted.**
   - If callback URL is rejected, Supabase may redirect to Site URL, which is `https://clearband.netlify.app`.

10. **Google provider is simply disabled.**
   - “Unsupported provider: provider is not enabled” means enable/configure Google in Supabase Auth Providers or hide the Google button until configured.

## 11. Canada Express Entry Tracker Comparison Request

The user has another working app called **Canada Express Entry Tracker** whose login works correctly.

Claude should compare Clearband auth against the working app if that code is available.

Please specifically compare:

- Supabase browser client setup.
- Supabase server client setup.
- Supabase middleware client setup.
- Auth callback route.
- Login form `signInWithOtp` implementation.
- `redirectTo` / `emailRedirectTo` construction.
- Cookie handling in Route Handlers.
- Cookie handling in middleware.
- Route protection.
- Environment variable names.
- Netlify settings.
- Supabase Auth URL settings.
- Whether working app uses OTP with PKCE, implicit flow, or a different magic-link exchange pattern.
- Whether working app uses `@supabase/ssr` or `@supabase/auth-helpers-nextjs`.

Likely useful command if both apps are local:

```bash
rg -n "signInWithOtp|exchangeCodeForSession|createServerClient|createBrowserClient|auth/callback|middleware|NEXT_PUBLIC_SUPABASE|NEXT_PUBLIC_APP_URL|SITE_URL|redirectTo|emailRedirectTo" /path/to/clearband /path/to/canada-express-entry-tracker
```

## 12. Important Constraints

Claude must preserve these constraints:

- Do not remove mock mode.
- Do not add Stripe.
- Do not add real AI.
- Do not expose secrets.
- Do not commit service role keys.
- Do not break local development.
- Preserve Supabase mode and mock fallback.
- Fix auth in the smallest safe way.
- Keep user-owned tables protected by RLS.
- Do not log tokens, magic links, access tokens, refresh tokens, or service role keys.
- Google/Apple should remain provider-ready but should not be treated as working unless enabled in Supabase.

## 13. Exact Current Code Snippets

### `src/app/(auth)/login/login-form.tsx`

```tsx
"use client";

import { Mail } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button, ButtonLink, Input, Label } from "@/components/ui";
import {
  buildAuthCallbackUrl,
  classifyAuthError,
  loginErrorMessage,
  safeLocalPath,
} from "@/lib/supabase/auth-redirects";
import { createClient } from "@/lib/supabase/client";

export function LoginForm({ mockMode }: { mockMode: boolean }) {
  const searchParams = useSearchParams();
  const requestedNext = searchParams.get("next") ?? "/onboarding";
  const nextPath = safeLocalPath(requestedNext, "/onboarding");
  const callbackError = loginErrorMessage(searchParams.get("error"));
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(callbackError);
  const [loading, setLoading] = useState(false);

  function authCallbackUrl() {
    return buildAuthCallbackUrl(window.location.origin);
  }

  async function signInWithEmail() {
    setError(null);

    if (mockMode) {
      window.location.href = nextPath;
      return;
    }

    const supabase = createClient();
    if (!supabase) {
      setError("Supabase is not configured. Use mock mode or add env vars.");
      return;
    }

    setLoading(true);
    const redirectTo = authCallbackUrl();
    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo,
      },
    });
    setLoading(false);

    if (authError) {
      setError(loginErrorMessage(classifyAuthError(authError.message)));
      return;
    }

    setStatus("Check your inbox for the Clearband sign-in link.");
  }

  async function signInWithProvider(provider: "google" | "apple") {
    setError(null);

    if (mockMode) {
      setStatus(`${provider === "google" ? "Google" : "Apple"} sign-in is a setup placeholder in mock mode.`);
      return;
    }

    const supabase = createClient();
    if (!supabase) {
      setError("Supabase is not configured. Use mock mode or add env vars.");
      return;
    }

    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: authCallbackUrl(),
      },
    });

    if (authError) {
      setError(loginErrorMessage(classifyAuthError(authError.message)));
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
        />
      </div>
      {mockMode ? (
        <ButtonLink
          href={nextPath}
          className="w-full"
          icon={<Mail className="h-4 w-4" />}
        >
          Continue in mock mode
        </ButtonLink>
      ) : (
        <Button
          className="w-full"
          icon={<Mail className="h-4 w-4" />}
          disabled={loading || !email}
          onClick={signInWithEmail}
        >
          {loading ? "Sending link..." : "Continue with email"}
        </Button>
      )}
      <div className="grid grid-cols-2 gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => signInWithProvider("google")}
        >
          Google
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => signInWithProvider("apple")}
        >
          Apple
        </Button>
      </div>
      {status ? <p className="text-sm text-[var(--success)]">{status}</p> : null}
      {error ? <p className="text-sm text-[var(--maple)]">{error}</p> : null}
    </div>
  );
}
```

### `src/app/(auth)/login/page.tsx`

```tsx
import { Suspense } from "react";
import { AuthShell } from "@/components/layout/shells";
import { Alert, Card } from "@/components/ui";
import { isMockMode } from "@/lib/supabase/env";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  const mockMode = isMockMode();

  return (
    <AuthShell>
      <Card className="space-y-5">
        <div>
          <h1 className="font-serif text-[34px] leading-tight">
            Create your account
          </h1>
          <p className="mt-2 text-[var(--text-muted)]">
            Use a magic link to reach the diagnostic quickly. Google and Apple
            are wired as provider-ready buttons once enabled in Supabase.
          </p>
        </div>
        <Suspense fallback={<p className="text-sm text-[var(--text-muted)]">Loading sign-in options...</p>}>
          <LoginForm mockMode={mockMode} />
        </Suspense>
        {mockMode ? (
          <Alert tone="info">
            Local mock mode is active because Supabase credentials are missing.
            Continue safely without external auth.
          </Alert>
        ) : (
          <Alert tone="success">
            Supabase Auth is configured. Magic links and enabled OAuth providers
            will redirect through <code>/auth/callback</code>.
          </Alert>
        )}
      </Card>
    </AuthShell>
  );
}
```

### `src/app/auth/callback/route.ts`

```ts
import { NextResponse, type NextRequest } from "next/server";
import {
  classifyAuthError,
  postAuthRedirectPath,
} from "@/lib/supabase/auth-redirects";
import {
  createServerSupabaseClient,
  ensureUserProfile,
} from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function callbackRedirect(requestUrl: URL, path: string) {
  const response = NextResponse.redirect(new URL(path, requestUrl.origin));
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

function callbackErrorRedirect(requestUrl: URL, error: string) {
  return callbackRedirect(requestUrl, `/login?error=${encodeURIComponent(error)}`);
}

function logCallbackStep(
  step: string,
  details: Record<string, boolean | string> = {},
) {
  console.info("[clearband-auth-callback]", { step, ...details });
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const providerError =
    requestUrl.searchParams.get("error_code") ??
    requestUrl.searchParams.get("error") ??
    null;

  logCallbackStep("received", {
    hasCode: String(Boolean(code)),
    hasProviderError: String(Boolean(providerError)),
  });

  if (providerError) {
    const error = classifyAuthError(providerError);
    logCallbackStep("provider-error", { error });
    return callbackErrorRedirect(requestUrl, error);
  }

  if (!code) {
    logCallbackStep("missing-code");
    return callbackErrorRedirect(requestUrl, "missing_code");
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    logCallbackStep("supabase-unavailable");
    return callbackErrorRedirect(requestUrl, "auth_callback_failed");
  }

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.session || !data.user) {
    const authError = classifyAuthError(error?.message);
    logCallbackStep("exchange-failed", { error: authError });
    return callbackErrorRedirect(requestUrl, authError);
  }

  logCallbackStep("exchange-succeeded", { hasUser: "true" });

  const profileResult = await ensureUserProfile(data.user);
  if (!profileResult.ok) {
    logCallbackStep("profile-upsert-failed");
  }

  const redirectPath = await postAuthRedirectPath(supabase, data.user.id);
  logCallbackStep("redirecting", { redirectPath });

  return callbackRedirect(requestUrl, redirectPath);
}
```

### `src/app/auth/logout/route.ts`

```ts
import { NextResponse, type NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const supabase = await createServerSupabaseClient();

  await supabase?.auth.signOut();

  return NextResponse.redirect(new URL("/login", requestUrl.origin));
}
```

### `middleware.ts`

```ts
import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
```

### `src/lib/supabase/env.ts`

```ts
export function hasSupabaseEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export function hasSupabaseAdminEnv() {
  return Boolean(hasSupabaseEnv() && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function isMockMode() {
  return !hasSupabaseEnv();
}

export function getDataModeLabel() {
  return isMockMode() ? "Mock mode" : "Supabase mode";
}

export function shouldShowDataModeIndicator() {
  return (
    process.env.NODE_ENV !== "production" ||
    process.env.NEXT_PUBLIC_SHOW_DATA_MODE === "true"
  );
}

export function getSiteUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000"
  ).replace(/\/$/, "");
}
```

### `src/lib/supabase/client.ts`

```ts
import { createBrowserClient } from "@supabase/ssr";
import { hasSupabaseEnv } from "./env";

export function createClient() {
  if (!hasSupabaseEnv()) return null;
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
```

### `src/lib/supabase/server.ts`

```ts
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { hasSupabaseEnv } from "./env";
import type { User } from "@supabase/supabase-js";

export async function createServerSupabaseClient() {
  if (!hasSupabaseEnv()) return null;
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        },
      },
    },
  );
}

export async function getCurrentUser() {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function ensureUserProfile(user: User) {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return { ok: false, skipped: true };

  const profile = await supabase.from("user_profiles").upsert(
    {
      user_id: user.id,
      display_name:
        user.user_metadata?.name ??
        user.user_metadata?.full_name ??
        user.email ??
        null,
      locale: user.user_metadata?.locale ?? "en-CA",
    },
    { onConflict: "user_id" },
  );

  if (profile.error) return { ok: false, error: profile.error.message };

  const subscription = await supabase.from("subscriptions").upsert(
    {
      user_id: user.id,
      plan: "free",
      status: "active",
      entitlements: { mock_limit: true },
    },
    { onConflict: "user_id" },
  );

  if (subscription.error) {
    return { ok: false, error: subscription.error.message };
  }

  return { ok: true };
}
```

### `src/lib/supabase/middleware.ts`

```ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { hasSupabaseEnv } from "./env";

const protectedPrefixes = [
  "/admin",
  "/dashboard",
  "/diagnostic",
  "/grammar",
  "/lessons",
  "/mocks",
  "/onboarding",
  "/practice",
  "/progress",
  "/review",
  "/settings",
  "/today",
  "/vocabulary",
];

export function isProtectedAppPath(pathname: string) {
  return protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function isAuthCallbackPath(pathname: string) {
  return pathname === "/auth/callback";
}

export function loginRedirectUrl(request: NextRequest) {
  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = "/login";
  redirectUrl.searchParams.set(
    "next",
    `${request.nextUrl.pathname}${request.nextUrl.search}`,
  );
  return redirectUrl;
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  if (isAuthCallbackPath(request.nextUrl.pathname)) return response;
  if (!hasSupabaseEnv()) return response;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
          Object.entries(headers).forEach(([key, value]) =>
            response.headers.set(key, value),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && isProtectedAppPath(request.nextUrl.pathname)) {
    return NextResponse.redirect(loginRedirectUrl(request));
  }

  if (user && request.nextUrl.pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}
```

### `src/lib/supabase/auth-redirects.ts`

```ts
import type { SupabaseClient } from "@supabase/supabase-js";

export type LoginErrorCode =
  | "auth_callback_failed"
  | "expired_link"
  | "missing_code"
  | "provider_not_enabled"
  | "rate_limit";

const loginErrorMessages: Record<LoginErrorCode, string> = {
  auth_callback_failed:
    "We could not finish signing you in. Please request a fresh magic link.",
  expired_link:
    "That sign-in link has expired or was already used. Please request a new magic link.",
  missing_code:
    "The sign-in link was missing its auth code. Please request a new magic link.",
  provider_not_enabled:
    "That sign-in provider is not enabled yet. Use email magic link for now.",
  rate_limit:
    "Too many sign-in emails were requested. Please wait a little while before trying again.",
};

export function safeLocalPath(value: string | null, fallback: string) {
  return value?.startsWith("/") && !value.startsWith("//") ? value : fallback;
}

export function buildAuthCallbackUrl(origin: string) {
  const configuredOrigin = process.env.NEXT_PUBLIC_APP_URL || origin;
  return `${configuredOrigin.replace(/\/$/, "")}/auth/callback`;
}

export function loginErrorMessage(code: string | null) {
  if (!code) return null;
  return loginErrorMessages[code as LoginErrorCode] ?? loginErrorMessages.auth_callback_failed;
}

export function classifyAuthError(message?: string | null): LoginErrorCode {
  const text = message?.toLowerCase() ?? "";
  if (text.includes("expired") || text.includes("invalid")) return "expired_link";
  if (text.includes("rate") || text.includes("too many")) return "rate_limit";
  if (text.includes("provider") || text.includes("enabled")) {
    return "provider_not_enabled";
  }
  return "auth_callback_failed";
}

export async function postAuthRedirectPath(
  supabase: SupabaseClient,
  userId: string,
) {
  const { data, error } = await supabase
    .from("user_profiles")
    .select("onboarded")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) return "/onboarding";
  return data?.onboarded ? "/dashboard" : "/onboarding";
}
```

### `src/app/api/onboarding/route.ts`

```ts
import { targetForClb } from "@/lib/scoring/clb";
import { getDataMode } from "@/lib/services/data-mode";
import { saveOnboarding } from "@/lib/services/onboarding";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { fail, ok, validationError } from "@/lib/validation/api";
import { onboardingSchema } from "@/lib/validation/schemas";

export async function POST(request: Request) {
  const parsed = onboardingSchema.safeParse(await request.json());
  if (!parsed.success) return validationError(parsed.error);

  if (getDataMode() === "mock") {
    return ok(await saveOnboarding(parsed.data));
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return fail("supabase_unavailable", "Supabase is configured incorrectly.", 500);
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return fail("unauthorized", "Sign in before saving onboarding.", 401);
  }

  const target = targetForClb(parsed.data.targetClb, user.id);

  // This route is the MVP's first live-write pattern:
  // validate input, branch mock vs Supabase mode, require auth in Supabase mode,
  // then write only rows scoped to auth.uid() so existing RLS remains the safety net.
  const writes = [
    supabase.from("user_profiles").upsert(
      {
        user_id: user.id,
        display_name: user.user_metadata?.name ?? user.email ?? null,
        locale: user.user_metadata?.locale ?? "en-CA",
        onboarded: true,
        daily_minutes: parsed.data.dailyMinutes,
      },
      { onConflict: "user_id" },
    ),
    supabase.from("onboarding_goals").upsert(
      {
        user_id: user.id,
        goal_mode: parsed.data.goalMode,
        test_date: parsed.data.testDate ?? null,
        confidence: parsed.data.confidence,
      },
      { onConflict: "user_id" },
    ),
    supabase.from("clb_targets").upsert(
      {
        user_id: user.id,
        target_clb: parsed.data.targetClb,
        listening: target.listening,
        reading: target.reading,
        writing: target.writing,
        speaking: target.speaking,
      },
      { onConflict: "user_id" },
    ),
  ];

  for (const write of writes) {
    const { error } = await write;
    if (error) return fail("supabase_write_failed", error.message, 500);
  }

  return ok({
    mode: "supabase",
    goal: {
      userId: user.id,
      goalMode: parsed.data.goalMode,
      testDate: parsed.data.testDate ?? null,
      confidence: parsed.data.confidence,
    },
    targets: target,
  });
}
```

### `netlify.toml`

```toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "20"
  AI_PROVIDER = "mock"

[dev]
  command = "npm run dev"
  targetPort = 3000
  port = 8888
  framework = "#auto"
```

## 14. Suggested Investigation Steps For Claude

1. Confirm whether current production deploy includes the latest code above.
2. In Netlify logs, click a new magic link and look for:

```text
[clearband-auth-callback]
```

3. If no callback logs appear, Supabase is not redirecting to `/auth/callback`; inspect Supabase URL Configuration and the magic-link redirect URL.
4. If callback logs show `missing-code`, inspect the actual callback URL.
5. If callback logs show `exchange-failed`, inspect whether this is a PKCE/code-verifier/cookie issue.
6. If callback logs show `exchange-succeeded` but user is not logged in, inspect `Set-Cookie` headers on the callback response and subsequent request cookies.
7. Compare Clearband against Canada Express Entry Tracker auth code.
8. If needed, temporarily add safe diagnostic response headers or logs, never tokens.
9. Preserve all constraints listed above.
