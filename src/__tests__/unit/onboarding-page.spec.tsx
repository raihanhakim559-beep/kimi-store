import { render, screen } from "@testing-library/react";
import React from "react";

import AccountOnboardingPage from "@/app/[locale]/(storefront)/account/onboarding/page";
import { auth } from "@/lib/auth";
import {
  getActiveOnboardingTokenForUser,
  getUserForOnboardingToken,
} from "@/lib/onboarding";

jest.mock("@/actions/onboarding", () => ({
  completeOnboarding: jest.fn(),
}));

jest.mock("@/lib/auth", () => ({
  auth: jest.fn(),
}));

jest.mock("@/lib/onboarding", () => ({
  getActiveOnboardingTokenForUser: jest.fn(),
  getUserForOnboardingToken: jest.fn(),
}));

jest.mock("@/i18n/navigation", () => ({
  Link: ({
    children,
    ...props
  }: React.PropsWithChildren<Record<string, unknown>>) => (
    <a {...props}>{children}</a>
  ),
}));

jest.mock("@/components/ui/button", () => ({
  buttonVariants: () => "btn",
}));

describe("AccountOnboardingPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("requires the secure token link when opening onboarding", async () => {
    (auth as jest.Mock).mockResolvedValue({ user: { id: "user_1" } });

    const page = await AccountOnboardingPage({
      params: { locale: "en" },
      searchParams: {},
    });

    render(page as React.ReactElement);

    expect(screen.getByText(/Activation link missing/i)).toBeInTheDocument();
    expect(getActiveOnboardingTokenForUser).not.toHaveBeenCalled();
  });

  it("displays an activation notice when redirected from the storefront", async () => {
    (auth as jest.Mock).mockResolvedValue({ user: { id: "user_1" } });
    (getActiveOnboardingTokenForUser as jest.Mock).mockResolvedValue(
      "token_xyz",
    );
    (getUserForOnboardingToken as jest.Mock).mockResolvedValue({
      id: "user_1",
      name: "Kai Brennan",
      email: "kai@example.com",
    });

    const page = await AccountOnboardingPage({
      params: { locale: "en" },
      searchParams: { notice: "activation", token: "token_xyz" },
    });

    render(page as React.ReactElement);

    expect(screen.getByText(/Activation email sent/i)).toBeInTheDocument();
    expect(screen.getByText(/kai@example.com/i)).toBeInTheDocument();
  });

  it("shows recovery notice when an expired link is refreshed", async () => {
    (auth as jest.Mock).mockResolvedValue({ user: { id: "user_2" } });
    (getActiveOnboardingTokenForUser as jest.Mock).mockResolvedValue(
      "token_fresh",
    );
    (getUserForOnboardingToken as jest.Mock)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        id: "user_2",
        name: "Eve",
        email: "eve@example.com",
      });

    const page = await AccountOnboardingPage({
      params: { locale: "en" },
      searchParams: { token: "stale" },
    });

    render(page as React.ReactElement);

    expect(getUserForOnboardingToken).toHaveBeenNthCalledWith(1, "stale");
    expect(getUserForOnboardingToken).toHaveBeenNthCalledWith(2, "token_fresh");
    expect(
      screen.getByText(/previous activation link expired, but we restored/i),
    ).toBeInTheDocument();
  });
});
