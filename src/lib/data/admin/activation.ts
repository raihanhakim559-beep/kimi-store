import {
  type ActivationEventSummary,
  getActivationEventsForUsers,
} from "@/lib/activation-events";

import type { ActivationStats } from "./types";

export const createEmptyActivationStats = (): ActivationStats => ({
  emailsSent: 0,
  remindersSent: 0,
  lastEmailAt: null,
  lastEventAt: null,
  lastEventType: null,
  completedAt: null,
  firstInviteAt: null,
});

export const summarizeActivationEvents = (
  events: ActivationEventSummary[],
): ActivationStats => {
  const summary = createEmptyActivationStats();

  for (const event of events) {
    if (!summary.lastEventAt || event.createdAt > summary.lastEventAt) {
      summary.lastEventAt = event.createdAt;
      summary.lastEventType = event.eventType;
    }

    if (event.eventType === "activation_invite") {
      summary.emailsSent += 1;
      summary.lastEmailAt = event.createdAt;
      summary.firstInviteAt = summary.firstInviteAt ?? event.createdAt;
    } else if (event.eventType === "activation_reminder") {
      summary.emailsSent += 1;
      summary.remindersSent += 1;
      summary.lastEmailAt = event.createdAt;
    } else if (
      event.eventType === "activation_completed" ||
      event.eventType === "activation_override_activate"
    ) {
      summary.completedAt = event.createdAt;
    }
  }

  return summary;
};

export const buildActivationStatsMap = async (userIds: string[]) => {
  if (userIds.length === 0) {
    return new Map<string, ActivationStats>();
  }

  const events = await getActivationEventsForUsers(userIds);
  const grouped = new Map<string, ActivationEventSummary[]>();

  for (const event of events) {
    const bucket = grouped.get(event.userId);
    if (bucket) {
      bucket.push(event);
    } else {
      grouped.set(event.userId, [event]);
    }
  }

  const stats = new Map<string, ActivationStats>();
  for (const [userId, bucket] of grouped.entries()) {
    stats.set(userId, summarizeActivationEvents(bucket));
  }

  return stats;
};
