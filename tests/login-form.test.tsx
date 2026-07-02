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

  it("shows callback failure messages on the login page", async () => {
    vi.doMock("next/navigation", () => ({
      useSearchParams: () => new URLSearchParams("error=expired_link"),
    }));

    const { LoginForm } = await import("@/app/(auth)/login/login-form");

    render(<LoginForm mockMode={false} />);

    expect(screen.getByText(/expired or was already used/i)).toBeInTheDocument();
  });
});
