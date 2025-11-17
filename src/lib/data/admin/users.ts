import { and, eq, ilike, or, type SQL } from "drizzle-orm";

import { adminUsersTable, db } from "@/lib/schema";

import type {
  AdminTeamRole,
  AdminUserFilters,
  AdminUserRow,
  AdminUserStatus,
} from "./types";

export const getAdminUsers = async ({
  search,
  role,
  status,
  limit = 25,
}: AdminUserFilters = {}): Promise<AdminUserRow[]> => {
  const filters: SQL<unknown>[] = [];

  const normalizedRole = role && role !== "all" ? role : undefined;
  const normalizedStatus = status && status !== "all" ? status : undefined;

  if (normalizedRole) {
    filters.push(eq(adminUsersTable.role, normalizedRole));
  }

  if (normalizedStatus) {
    filters.push(eq(adminUsersTable.status, normalizedStatus));
  }

  const trimmed = search?.trim();
  if (trimmed && trimmed.length > 0) {
    const like = `%${trimmed}%`;
    filters.push(
      or(
        ilike(adminUsersTable.name, like),
        ilike(adminUsersTable.email, like),
        ilike(adminUsersTable.location, like),
      )!,
    );
  }

  const query = db
    .select({
      id: adminUsersTable.id,
      name: adminUsersTable.name,
      email: adminUsersTable.email,
      role: adminUsersTable.role,
      status: adminUsersTable.status,
      lastLoginAt: adminUsersTable.lastLoginAt,
      location: adminUsersTable.location,
      mfaEnabled: adminUsersTable.mfaEnabled,
      teams: adminUsersTable.teams,
      invitedAt: adminUsersTable.invitedAt,
      updatedAt: adminUsersTable.updatedAt,
    })
    .from(adminUsersTable);

  const filterExpression =
    filters.length === 0
      ? null
      : filters.length === 1
        ? filters[0]!
        : and(filters[0]!, filters[1]!, ...filters.slice(2));

  const rows = await (filterExpression ? query.where(filterExpression) : query);

  rows.sort((a, b) => {
    if (a.status === b.status) {
      const aTime = a.lastLoginAt ? a.lastLoginAt.getTime() : 0;
      const bTime = b.lastLoginAt ? b.lastLoginAt.getTime() : 0;
      return bTime - aTime;
    }
    const order: AdminUserStatus[] = ["active", "pending", "disabled"];
    return (
      order.indexOf(a.status as AdminUserStatus) -
      order.indexOf(b.status as AdminUserStatus)
    );
  });

  return rows.slice(0, limit).map((row) => ({
    id: row.id,
    name: row.name ?? "Admin",
    email: row.email ?? "",
    role: row.role as AdminTeamRole,
    status: row.status as AdminUserStatus,
    lastLoginAt: row.lastLoginAt ?? null,
    location: row.location ?? null,
    mfaEnabled: row.mfaEnabled,
    teams: Array.isArray(row.teams) ? row.teams : [],
    invitedAt: row.invitedAt ?? row.updatedAt ?? new Date(),
  }));
};
