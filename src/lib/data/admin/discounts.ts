import { and, desc, ilike, or, type SQL } from "drizzle-orm";

import { formatCurrency } from "@/lib/formatters";
import { db, promoCodes } from "@/lib/schema";

import type {
  AdminDiscountFilters,
  AdminDiscountRow,
  AdminDiscountStatus,
} from "./types";

const getDiscountStatus = (
  row: Pick<AdminDiscountRow, "isActive" | "startsAt" | "endsAt">,
  now: Date,
): AdminDiscountStatus => {
  if (!row.isActive) return "inactive";
  if (row.startsAt && row.startsAt > now) return "scheduled";
  if (row.endsAt && row.endsAt < now) return "expired";
  return "active";
};

export const getAdminDiscounts = async ({
  search,
  status,
  limit = 50,
}: AdminDiscountFilters = {}): Promise<AdminDiscountRow[]> => {
  const filters: SQL<unknown>[] = [];

  const trimmed = search?.trim();
  if (trimmed && trimmed.length > 0) {
    const searchExpression = or(
      ilike(promoCodes.code, `%${trimmed}%`),
      ilike(promoCodes.description, `%${trimmed}%`),
    );
    filters.push(searchExpression!);
  }

  const filterExpression =
    filters.length === 0
      ? null
      : filters.length === 1
        ? filters[0]!
        : and(filters[0]!, filters[1]!, ...filters.slice(2));

  const query = db
    .select({
      id: promoCodes.id,
      code: promoCodes.code,
      description: promoCodes.description,
      discountType: promoCodes.discountType,
      value: promoCodes.value,
      isActive: promoCodes.isActive,
      maxRedemptions: promoCodes.maxRedemptions,
      redemptionCount: promoCodes.redemptionCount,
      startsAt: promoCodes.startsAt,
      endsAt: promoCodes.endsAt,
      createdAt: promoCodes.createdAt,
      updatedAt: promoCodes.updatedAt,
    })
    .from(promoCodes)
    .orderBy(desc(promoCodes.updatedAt))
    .limit(limit * 2);

  const rows = await (filterExpression ? query.where(filterExpression) : query);

  const now = new Date();
  const normalizedStatus = status && status !== "all" ? status : undefined;

  const mapped = rows
    .map((row) => {
      const statusLabel = getDiscountStatus(row, now);
      const valueLabel =
        row.discountType === "percentage"
          ? `${row.value}%`
          : formatCurrency(row.value / 100, {
              locale: "en-MY",
              currency: "MYR",
              maximumFractionDigits: 2,
            });
      return {
        ...row,
        valueLabel,
        status: statusLabel,
        maxRedemptions: row.maxRedemptions ?? null,
        redemptionCount: row.redemptionCount ?? 0,
      } satisfies AdminDiscountRow;
    })
    .filter((row) =>
      normalizedStatus ? row.status === normalizedStatus : true,
    )
    .slice(0, limit);

  return mapped;
};
