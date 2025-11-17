import { fireEvent, render, screen } from "@testing-library/react";
import type { Session } from "next-auth";
import React from "react";

import { AuthControls } from "@/components/auth-controls";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => "en",
}));

jest.mock("@/i18n/navigation", () => ({
  Link: ({
    children,
    ...props
  }: React.PropsWithChildren<Record<string, unknown>>) => (
    <a {...props}>{children}</a>
  ),
}));

jest.mock("next-auth/react", () => ({
  signIn: jest.fn(),
  signOut: jest.fn(),
}));

describe("AuthControls", () => {
  it("shows a sign-in action when no session is present", () => {
    render(<AuthControls session={null} />);

    expect(screen.getByRole("link", { name: /signIn/i })).toBeInTheDocument();
  });

  it("displays the user's info inside the dropdown", async () => {
    const session: Session = {
      user: {
        id: "user_123",
        name: "Kai Brennan",
        email: "kai@example.com",
        stripeCustomerId: "cus_123",
        isActive: true,
      },
      expires: new Date().toISOString(),
    };

    render(<AuthControls session={session} />);

    const trigger = screen.getByRole("button", { name: /open account menu/i });
    fireEvent.pointerDown(trigger);
    fireEvent.pointerUp(trigger);
    fireEvent.click(trigger);

    expect(await screen.findByText("Kai Brennan")).toBeInTheDocument();
    expect(await screen.findByText("kai@example.com")).toBeInTheDocument();
    expect(
      await screen.findByRole("menuitem", { name: /profile/i }),
    ).toBeInTheDocument();
  });
});
