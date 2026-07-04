import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";

afterEach(() => {
  vi.restoreAllMocks();
});

function isoDateFromToday(offsetDays: number) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
}

async function goToTargetStep() {
  const user = userEvent.setup();
  render(<OnboardingWizard />);
  await user.click(screen.getByRole("button", { name: /let's start/i }));
  await user.click(screen.getByRole("button", { name: /continue/i }));
  return user;
}

describe("OnboardingWizard", () => {
  it("lets the target slider go above 7.0 up to 9.0 and maps CLB correctly", async () => {
    await goToTargetStep();

    const slider = screen.getByLabelText(/target overall ielts band/i);
    expect(slider).toHaveAttribute("min", "5");
    expect(slider).toHaveAttribute("max", "9");
    expect(slider).toHaveAttribute("step", "0.5");

    fireEvent.change(slider, { target: { value: "8.5" } });

    // Overall 8.5 plus the CLB 10 Listening card also reading 8.5
    expect(screen.getAllByText("8.5").length).toBe(2);
    expect(screen.getByText(/clb 10 · maximum language target/i)).toBeInTheDocument();
    // CLB 10 per-skill bands: L8.5 R8.0 W7.5 S7.5
    expect(screen.getAllByText("8.0").length).toBeGreaterThan(0);
    expect(screen.getAllByText("7.5").length).toBe(2);
  });

  it("shows CLB 9 bands for an overall 7.0 target", async () => {
    await goToTargetStep();

    const slider = screen.getByLabelText(/target overall ielts band/i);
    fireEvent.change(slider, { target: { value: "7" } });

    expect(screen.getByText(/clb 9 · crs-competitive/i)).toBeInTheDocument();
    expect(screen.getByText("8.0")).toBeInTheDocument();
    expect(screen.getAllByText("7.0").length).toBeGreaterThanOrEqual(3);
  });

  it("lets the user change test date, format, and location, and validates past dates", async () => {
    const user = await goToTargetStep();
    await user.click(screen.getByRole("button", { name: /continue/i }));

    // Unbooked is the default and Continue stays enabled.
    expect(
      screen.getByText(/default planning mode/i),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /continue/i })).toBeEnabled();

    await user.click(screen.getByRole("button", { name: /i have a date booked/i }));
    expect(screen.getByRole("button", { name: /continue/i })).toBeDisabled();

    const dateInput = screen.getByLabelText(/test date/i);
    fireEvent.change(dateInput, { target: { value: isoDateFromToday(-2) } });
    expect(screen.getByRole("alert")).toHaveTextContent(/in the past/i);
    expect(screen.getByRole("button", { name: /continue/i })).toBeDisabled();

    fireEvent.change(dateInput, { target: { value: isoDateFromToday(21) } });
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /continue/i })).toBeEnabled();

    await user.click(screen.getByRole("button", { name: /paper-based/i }));
    await user.type(screen.getByLabelText(/test location/i), "Vancouver");
    expect(screen.getByLabelText(/test location/i)).toHaveValue("Vancouver");
  });

  it("submits the selected plan to the onboarding API before finishing", async () => {
    const fetchMock = vi.fn(async () => ({ ok: true, json: async () => ({}) }));
    vi.stubGlobal("fetch", fetchMock);

    const user = await goToTargetStep();
    const slider = screen.getByLabelText(/target overall ielts band/i);
    fireEvent.change(slider, { target: { value: "8" } });
    await user.click(screen.getByRole("button", { name: /continue/i }));

    await user.click(screen.getByRole("button", { name: /i have a date booked/i }));
    const testDate = isoDateFromToday(30);
    fireEvent.change(screen.getByLabelText(/test date/i), {
      target: { value: testDate },
    });
    await user.click(screen.getByRole("button", { name: /computer-delivered/i }));
    await user.type(screen.getByLabelText(/test location/i), "Toronto");
    await user.click(screen.getByRole("button", { name: /continue/i }));

    await user.click(screen.getByRole("button", { name: /continue/i }));

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/onboarding",
      expect.objectContaining({ method: "POST" }),
    );
    const [, requestInit] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    const payload = JSON.parse(String(requestInit.body));
    expect(payload).toMatchObject({
      goalMode: "crs",
      targetClb: 10,
      targetOverallBand: 8,
      testDate,
      testFormat: "computer",
      testLocation: "Toronto",
      dailyMinutes: 30,
    });

    expect(
      await screen.findByText(/start with a short diagnostic/i),
    ).toBeInTheDocument();

    vi.unstubAllGlobals();
  });
});
