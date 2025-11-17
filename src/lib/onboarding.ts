import crypto from "node:crypto";

import { desc, eq } from "drizzle-orm";

import { db, users, verificationTokens } from "@/lib/schema";

const TOKEN_TTL_HOURS = 24;

export const generateOnboardingToken = async (userId: string) => {
  const identifier = userId;
  await db
    .delete(verificationTokens)
    .where(eq(verificationTokens.identifier, identifier));

  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + TOKEN_TTL_HOURS * 60 * 60 * 1000);

  await db.insert(verificationTokens).values({
    identifier,
    token,
    expires,
  });

  return { token, expires };
};

export const getUserForOnboardingToken = async (token: string) => {
  const [record] = await db
    .select({
      token: verificationTokens.token,
      expires: verificationTokens.expires,
      user: {
        id: users.id,
        name: users.name,
        email: users.email,
        image: users.image,
        isActive: users.isActive,
        stripeCustomerId: users.stripeCustomerId,
      },
    })
    .from(verificationTokens)
    .innerJoin(users, eq(users.id, verificationTokens.identifier))
    .where(eq(verificationTokens.token, token))
    .limit(1);

  if (!record) {
    return null;
  }

  if (record.expires < new Date()) {
    await db
      .delete(verificationTokens)
      .where(eq(verificationTokens.token, token));
    return null;
  }

  if (record.user.isActive) {
    await db
      .delete(verificationTokens)
      .where(eq(verificationTokens.token, token));
    return null;
  }

  return record.user;
};

export const deleteOnboardingToken = async (token: string) => {
  await db
    .delete(verificationTokens)
    .where(eq(verificationTokens.token, token));
};

export const deleteUserOnboardingTokens = async (userId: string) => {
  await db
    .delete(verificationTokens)
    .where(eq(verificationTokens.identifier, userId));
};

export const getActiveOnboardingTokenForUser = async (userId: string) => {
  const [record] = await db
    .select({
      token: verificationTokens.token,
      expires: verificationTokens.expires,
      isActive: users.isActive,
    })
    .from(verificationTokens)
    .innerJoin(users, eq(users.id, verificationTokens.identifier))
    .where(eq(verificationTokens.identifier, userId))
    .orderBy(desc(verificationTokens.expires))
    .limit(1);

  if (!record) {
    return null;
  }

  if (record.isActive || record.expires < new Date()) {
    await deleteUserOnboardingTokens(userId);
    return null;
  }

  return record.token;
};
