import { render, screen } from "@testing-library/react";
import { redirect } from "next/navigation";
import React from "react";

import ActivationEmailSentPage from "@/app/[locale]/(storefront)/account/onboarding/email-sent/page";
import { auth } from "@/lib/auth";
import {
  getActiveOnboardingTokenForUser,
  getUserForOnboardingToken,
} from "@/lib/onboarding";

jest.mock("@/components/resend-verification-button", () => ({
  ResendVerificationButton: ({ locale }: { locale: string }) => (
    <div data-testid="resend-button">locale:{locale}</div>
  ),
}));

jest.mock("@/components/ui/button", () => ({
  buttonVariants: () => "btn",
}));

jest.mock("@/i18n/navigation", () => ({
  Link: ({
    children,
    ...props
  }: React.PropsWithChildren<Record<string, unknown>>) => (
    <a {...props}>{children}</a>
  ),
}));

jest.mock("@/lib/auth", () => ({
  auth: jest.fn(),
}));

jest.mock("@/lib/onboarding", () => ({
  getActiveOnboardingTokenForUser: jest.fn(),
  getUserForOnboardingToken: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

describe("ActivationEmailSentPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows the email sent notice without exposing the onboarding form", async () => {
    (auth as jest.Mock).mockResolvedValue({
      user: { id: "user_1", isActive: false, email: "kai@example.com" },
    });
    (getActiveOnboardingTokenForUser as jest.Mock).mockResolvedValue(
      "token_abc",
    );
    (getUserForOnboardingToken as jest.Mock).mockResolvedValue({
      email: "kai@example.com",
    });

    const page = await ActivationEmailSentPage({ params: { locale: "en" } });

    render(page as React.ReactElement);

    expect(
      screen.getByText(/We're sending a secure onboarding link/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/kai@example.com/)).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /Continue to onboarding/i }),
    ).toBeNull();
    expect(screen.getByRole("link", { name: /Return home/i })).toHaveAttribute(
      "href",
      "/en",
    );
    expect(screen.getByTestId("resend-button")).toHaveAttribute(
      "data-testid",
      "resend-button",
    );
  });

  it("redirects active users back to the storefront", async () => {
    (auth as jest.Mock).mockResolvedValue({
      user: { id: "user_1", isActive: true },
    });

    await ActivationEmailSentPage({ params: { locale: "en" } });

    expect(redirect).toHaveBeenCalledWith("/en");
  });
});
