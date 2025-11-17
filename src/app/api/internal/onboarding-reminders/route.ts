import { and, eq, isNotNull } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { env } from "@/env.mjs";
import { getActivationEventsForUsers } from "@/lib/activation-events";
import { sendActivationEmail } from "@/lib/email/send-activation-email";
import { db, users } from "@/lib/schema";

const REMINDER_WINDOWS = [
  { stage: "24h", hours: 24 },
  { stage: "72h", hours: 72 },
] as const;

const MAX_BATCH = 100;

const isAuthorized = (req: NextRequest) => {
  const secret = env.ONBOARDING_CRON_SECRET;
  if (!secret) {
    return true;
  }
  const header = req.headers.get("authorization") ?? "";
  return header === `Bearer ${secret}`;
};

const pickStageForUser = (
  events: Awaited<ReturnType<typeof getActivationEventsForUsers>>,
  userId: string,
) => {
  const userEvents = events.filter((event) => event.userId === userId);
  if (userEvents.length === 0) {
    return null;
  }

  const completionEvent = userEvents.find(
    (event) =>
      event.eventType === "activation_completed" ||
      event.eventType === "activation_override_activate",
  );
  if (completionEvent) {
    return null;
  }

  const sentStages = new Set<string>();
  userEvents.forEach((event) => {
    if (
      event.eventType === "activation_reminder" &&
      event.metadata &&
      typeof event.metadata === "object"
    ) {
      const stage = (event.metadata as { stage?: unknown }).stage;
      if (typeof stage === "string") {
        sentStages.add(stage);
      }
    }
  });

  const inviteEvents = userEvents.filter(
    (event) => event.eventType === "activation_invite",
  );
  const inviteDate =
    inviteEvents.length > 0
      ? (inviteEvents[inviteEvents.length - 1]?.createdAt ?? null)
      : null;
  if (!inviteDate) {
    return null;
  }

  const inviteTimestamp = inviteDate.getTime();
  const hoursSinceInvite = (Date.now() - inviteTimestamp) / (1000 * 60 * 60);

  for (const window of REMINDER_WINDOWS) {
    if (hoursSinceInvite >= window.hours && !sentStages.has(window.stage)) {
      return window.stage;
    }
  }

  return null;
};

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pendingUsers = await db
    .select({ id: users.id, email: users.email, name: users.name })
    .from(users)
    .where(and(eq(users.isActive, false), isNotNull(users.email)))
    .limit(MAX_BATCH);

  if (pendingUsers.length === 0) {
    return NextResponse.json({ triggered: 0 });
  }

  const events = await getActivationEventsForUsers(
    pendingUsers.map((user) => user.id),
  );
  const dueUsers = [] as {
    userId: string;
    stage: string;
    email: string;
    name?: string | null;
  }[];

  for (const user of pendingUsers) {
    const stage = pickStageForUser(events, user.id);
    if (stage && user.email) {
      dueUsers.push({
        userId: user.id,
        stage,
        email: user.email,
        name: user.name,
      });
    }
  }

  await Promise.all(
    dueUsers.map((user) =>
      sendActivationEmail({
        userId: user.userId,
        email: user.email,
        name: user.name,
        channel: "drip",
        metadata: { stage: user.stage },
      }),
    ),
  );

  return NextResponse.json({ triggered: dueUsers.length });
}

export async function GET(req: NextRequest) {
  return POST(req);
}
