import { and, desc, eq, ilike, or, type SQL, sql } from "drizzle-orm";

import { db, orderItems, orders, users } from "@/lib/schema";

import type { AdminOrderFilters, AdminOrderRow } from "./types";

export const getAdminOrders = async ({
  search,
  status,
  paymentStatus,
  fulfillmentStatus,
  limit = 50,
}: AdminOrderFilters = {}): Promise<AdminOrderRow[]> => {
  const filters: SQL<unknown>[] = [];

  const trimmed = search?.trim();
  if (trimmed && trimmed.length > 0) {
    const searchExpression = or(
      ilike(orders.orderNumber, `%${trimmed}%`),
      ilike(users.email, `%${trimmed}%`),
      ilike(users.name, `%${trimmed}%`),
    );
    filters.push(searchExpression!);
  }

  if (status && status !== "all") {
    filters.push(eq(orders.status, status));
  }
  if (paymentStatus && paymentStatus !== "all") {
    filters.push(eq(orders.paymentStatus, paymentStatus));
  }
  if (fulfillmentStatus && fulfillmentStatus !== "all") {
    filters.push(eq(orders.fulfillmentStatus, fulfillmentStatus));
  }

  const filterExpression =
    filters.length === 0
      ? null
      : filters.length === 1
        ? filters[0]!
        : and(filters[0]!, filters[1]!, ...filters.slice(2));

  const query = db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      status: orders.status,
      paymentStatus: orders.paymentStatus,
      fulfillmentStatus: orders.fulfillmentStatus,
      subtotal: orders.subtotal,
      shippingTotal: orders.shippingTotal,
      total: orders.total,
      currency: orders.currency,
      placedAt: orders.placedAt,
      updatedAt: orders.updatedAt,
      customerName: users.name,
      customerEmail: users.email,
      itemCount: sql<number>`count(${orderItems.id})`,
    })
    .from(orders)
    .leftJoin(users, eq(orders.userId, users.id))
    .leftJoin(orderItems, eq(orderItems.orderId, orders.id))
    .groupBy(orders.id, users.name, users.email)
    .orderBy(desc(orders.placedAt), desc(orders.updatedAt))
    .limit(limit);

  const rows = await (filterExpression ? query.where(filterExpression) : query);

  return rows.map((row) => ({
    ...row,
    itemCount: Number(row.itemCount ?? 0),
  }));
};
