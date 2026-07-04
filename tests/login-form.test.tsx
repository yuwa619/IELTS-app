import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
  vi.restoreAllMocks();
});

describe("LoginForm", () => {
  it("sends magic links to the exact configured auth callback URL", async () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://clearband.netlify.app/");

    const signInWithOtp = vi.fn(async () => ({ error: null }));

    vi.doMock("next/navigation", () => ({
      useSearchParams: () => new URLSearchParams("next=/dashboard"),
    }));
    vi.doMock("@/lib/supabase/client", () => ({
      createClient: () => ({
        auth: { signInWithOtp },
      }),
    }));

    const { LoginForm } = await import("@/app/(auth)/login/login-form");

    render(<LoginForm mockMode={false} />);
    await userEvent.type(screen.getByLabelText(/email/i), "learner@example.com");
    await userEvent.click(
      screen.getByRole("button", { name: /continue with email/i }),
    );

    expect(signInWithOtp).toHaveBeenCalledWith({
      email: "learner@example.com",
      options: {
        emailRedirectTo: "https://clearband.netlify.app/auth/callback",
      },
    });
  });

  it("hides Google and Apple buttons in Supabase mode until providers are enabled", async () => {
    vi.stubEnv("NEXT_PUBLIC_OAUTH_PROVIDERS", "");
    vi.doMock("next/navigation", () => ({
      useSearchParams: () => new URLSearchParams(),
    }));
    vi.doMock("@/lib/supabase/client", () => ({
      createClient: () => ({ auth: {} }),
    }));

    const { LoginForm } = await import("@/app/(auth)/login/login-form");

    render(<LoginForm mockMode={false} />);

    expect(screen.queryByRole("button", { name: /google/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /apple/i })).not.toBeInTheDocument();
  });

  it("shows enabled OAuth providers in Supabase mode", async () => {
    vi.stubEnv("NEXT_PUBLIC_OAUTH_PROVIDERS", "google");
    vi.doMock("next/navigation", () => ({
      useSearchParams: () => new URLSearchParams(),
    }));
    vi.doMock("@/lib/supabase/client", () => ({
      createClient: () => ({ auth: {} }),
    }));

    const { LoginForm } = await import("@/app/(auth)/login/login-form");

    render(<LoginForm mockMode={false} />);

    expect(screen.getByRole("button", { name: /google/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /apple/i })).not.toBeInTheDocument();
  });

  it("shows callback failure messages on the login page", async () => {
    vi.doMock("next/navigation", () => ({
      useSearchParams: () => new URLSearchParams("error=expired_link"),
    }));

    const { LoginForm } = await import("@/app/(auth)/login/login-form");

    render(<LoginForm mockMode={false} />);

    expect(screen.getByText(/expired or was already used/i)).toBeInTheDocument();
  });
});
