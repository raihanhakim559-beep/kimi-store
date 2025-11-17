import { desc, eq, inArray } from "drizzle-orm";

import { activationEvents, db } from "@/lib/schema";

type ActivationEventRecord = typeof activationEvents.$inferSelect;

export type ActivationEventType = ActivationEventRecord["eventType"];

export type ActivationEventSummary = {
  userId: string;
  eventType: ActivationEventType;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
};

export const logActivationEvent = async ({
  userId,
  eventType,
  metadata,
}: {
  userId: string;
  eventType: ActivationEventType;
  metadata?: Record<string, unknown> | null;
}) => {
  await db.insert(activationEvents).values({
    userId,
    eventType,
    metadata,
  });
};

export const getActivationTimeline = async (
  userId: string,
  limit = 50,
): Promise<ActivationEventSummary[]> => {
  const rows = await db
    .select({
      userId: activationEvents.userId,
      eventType: activationEvents.eventType,
      metadata: activationEvents.metadata,
      createdAt: activationEvents.createdAt,
    })
    .from(activationEvents)
    .where(eq(activationEvents.userId, userId))
    .orderBy(desc(activationEvents.createdAt))
    .limit(limit);

  return rows.map((row) => ({
    userId: row.userId,
    eventType: row.eventType,
    metadata: (row.metadata as Record<string, unknown> | null) ?? null,
    createdAt: row.createdAt,
  }));
};

export const getActivationEventsForUsers = async (userIds: string[]) => {
  if (userIds.length === 0) {
    return [] as ActivationEventSummary[];
  }

  const rows = await db
    .select({
      userId: activationEvents.userId,
      eventType: activationEvents.eventType,
      metadata: activationEvents.metadata,
      createdAt: activationEvents.createdAt,
    })
    .from(activationEvents)
    .where(inArray(activationEvents.userId, userIds))
    .orderBy(desc(activationEvents.createdAt));

  return rows.map((row) => ({
    userId: row.userId,
    eventType: row.eventType,
    metadata: (row.metadata as Record<string, unknown> | null) ?? null,
    createdAt: row.createdAt,
  }));
};

export const getLatestActivationEvent = async (
  userId: string,
): Promise<ActivationEventSummary | null> => {
  const [event] = await db
    .select({
      userId: activationEvents.userId,
      eventType: activationEvents.eventType,
      metadata: activationEvents.metadata,
      createdAt: activationEvents.createdAt,
    })
    .from(activationEvents)
    .where(eq(activationEvents.userId, userId))
    .orderBy(desc(activationEvents.createdAt))
    .limit(1);

  if (!event) {
    return null;
  }

  return {
    userId: event.userId,
    eventType: event.eventType,
    metadata: (event.metadata as Record<string, unknown> | null) ?? null,
    createdAt: event.createdAt,
  };
};
