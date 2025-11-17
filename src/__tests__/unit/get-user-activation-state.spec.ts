jest.mock("@/lib/schema", () => {
  const select = jest.fn();
  return {
    db: {
      select,
    },
    users: {
      id: "id",
      isActive: "isActive",
      hasAcceptedTerms: "hasAcceptedTerms",
      onboardingCompletedAt: "onboardingCompletedAt",
      emailVerified: "emailVerified",
    },
  };
});

jest.mock("drizzle-orm", () => ({
  eq: jest.fn(() => "eq-condition"),
}));

import { db } from "@/lib/schema";
import { getUserActivationState } from "@/lib/user-status";

type MockedSelect = jest.MockedFunction<typeof db.select>;

const queueSelectResult = (rows: unknown[]) => {
  (db.select as MockedSelect).mockReturnValueOnce({
    from: () => ({
      where: () => ({
        limit: () => Promise.resolve(rows),
      }),
    }),
  } as unknown as ReturnType<typeof db.select>);
};

describe("getUserActivationState", () => {
  beforeEach(() => {
    (db.select as MockedSelect).mockReset();
  });

  it("returns the activation record when the user exists", async () => {
    queueSelectResult([
      {
        id: "user_123",
        isActive: true,
        hasAcceptedTerms: true,
        onboardingCompletedAt: new Date("2024-01-01T00:00:00.000Z"),
        emailVerified: new Date("2024-01-01T00:00:00.000Z"),
      },
    ]);

    const result = await getUserActivationState("user_123");

    expect(result).toEqual(
      expect.objectContaining({
        id: "user_123",
        isActive: true,
        hasAcceptedTerms: true,
      }),
    );
  });

  it("returns null when the user cannot be found", async () => {
    queueSelectResult([]);

    const result = await getUserActivationState("missing_user");

    expect(result).toBeNull();
  });
});
