import { and, desc, eq, ilike, or, type SQL, sql } from "drizzle-orm";

import { db, orders, users } from "@/lib/schema";

import {
  buildActivationStatsMap,
  createEmptyActivationStats,
} from "./activation";
import type { AdminCustomerFilters, AdminCustomerRow } from "./types";

const lastInteractionExpr = sql<Date | null>`coalesce(
  max(${orders.placedAt}),
  max(${orders.updatedAt}),
  max(${users.emailVerified})
)`;

export const getAdminCustomers = async ({
  search,
  status,
  limit = 50,
}: AdminCustomerFilters = {}): Promise<AdminCustomerRow[]> => {
  const filters: SQL<unknown>[] = [];

  const trimmed = search?.trim();
  if (trimmed && trimmed.length > 0) {
    const searchExpression = or(
      ilike(users.name, `%${trimmed}%`),
      ilike(users.email, `%${trimmed}%`),
    );
    filters.push(searchExpression!);
  }

  if (status === "active") {
    filters.push(eq(users.isActive, true));
  } else if (status === "inactive") {
    filters.push(eq(users.isActive, false));
  }

  const filterExpression =
    filters.length === 0
      ? null
      : filters.length === 1
        ? filters[0]!
        : and(filters[0]!, filters[1]!, ...filters.slice(2));

  const query = db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      isActive: users.isActive,
      emailVerified: users.emailVerified,
      orderCount: sql<number>`count(${orders.id})`,
      totalSpent: sql<number>`coalesce(sum(${orders.total}), 0)`,
      lastOrderAt: sql<Date | null>`max(${orders.placedAt})`,
      lastInteractionAt: lastInteractionExpr,
    })
    .from(users)
    .leftJoin(orders, eq(orders.userId, users.id))
    .groupBy(
      users.id,
      users.name,
      users.email,
      users.isActive,
      users.emailVerified,
    )
    .orderBy(desc(lastInteractionExpr))
    .limit(limit);

  const rows = await (filterExpression ? query.where(filterExpression) : query);
  const activationStatsMap = await buildActivationStatsMap(
    rows.map((row) => row.id),
  );

  return rows.map((row) => ({
    id: row.id,
    name: row.name ?? null,
    email: row.email ?? null,
    isActive: row.isActive,
    emailVerified: row.emailVerified ?? null,
    orderCount: Number(row.orderCount ?? 0),
    totalSpent: Number(row.totalSpent ?? 0),
    lastOrderAt: row.lastOrderAt ?? null,
    activation: activationStatsMap.get(row.id) ?? createEmptyActivationStats(),
  }));
};
