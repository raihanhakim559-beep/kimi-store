import { eq } from "drizzle-orm";

import { db, users } from "@/lib/schema";

export const getUserActivationState = async (userId: string) => {
  const [record] = await db
    .select({
      id: users.id,
      isActive: users.isActive,
      hasAcceptedTerms: users.hasAcceptedTerms,
      onboardingCompletedAt: users.onboardingCompletedAt,
      emailVerified: users.emailVerified,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return record ?? null;
};
