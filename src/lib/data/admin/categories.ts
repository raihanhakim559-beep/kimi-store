import { and, desc, eq, ilike, or, type SQL, sql } from "drizzle-orm";

import { categories, db, products } from "@/lib/schema";

import type { AdminCategoryFilters, AdminCategoryRow } from "./types";

export const getAdminCategories = async () =>
  db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
    })
    .from(categories)
    .where(eq(categories.isActive, true))
    .orderBy(desc(categories.updatedAt));

type CategorySelect = typeof categories.$inferSelect;

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

const parseCategoryMetadata = (metadata: CategorySelect["metadata"]) => {
  if (!metadata || typeof metadata !== "object") {
    return { heroCopy: undefined, features: [] as string[] };
  }

  const heroCopy =
    typeof (metadata as { heroCopy?: unknown }).heroCopy === "string"
      ? ((metadata as { heroCopy?: string }).heroCopy ?? undefined)
      : undefined;
  const rawFeatures = (metadata as { features?: unknown }).features;
  const features = isStringArray(rawFeatures) ? rawFeatures : [];

  return { heroCopy, features };
};

export const getAdminCategoryRows = async ({
  search,
  audience,
  status,
  limit = 50,
}: AdminCategoryFilters = {}): Promise<AdminCategoryRow[]> => {
  const filters: SQL<unknown>[] = [];

  const trimmed = search?.trim();
  if (trimmed && trimmed.length > 0) {
    const searchExpression = or(
      ilike(categories.name, `%${trimmed}%`),
      ilike(categories.slug, `%${trimmed}%`),
    );
    filters.push(searchExpression!);
  }

  if (audience && ["men", "women", "unisex"].includes(audience)) {
    filters.push(eq(categories.gender, audience));
  }

  if (status === "active") {
    filters.push(eq(categories.isActive, true));
  } else if (status === "inactive") {
    filters.push(eq(categories.isActive, false));
  }

  const filterExpression =
    filters.length === 0
      ? null
      : filters.length === 1
        ? filters[0]!
        : and(filters[0]!, filters[1]!, ...filters.slice(2));

  const query = db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      gender: categories.gender,
      isActive: categories.isActive,
      description: categories.description,
      metadata: categories.metadata,
      updatedAt: categories.updatedAt,
      productCount: sql<number>`count(${products.id})`,
    })
    .from(categories)
    .leftJoin(products, eq(products.categoryId, categories.id))
    .groupBy(categories.id)
    .orderBy(desc(categories.updatedAt))
    .limit(limit);

  const rows = await (filterExpression ? query.where(filterExpression) : query);

  return rows.map((row) => {
    const metadata = parseCategoryMetadata(row.metadata);
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      gender: row.gender,
      isActive: row.isActive,
      description: row.description ?? null,
      heroCopy: metadata.heroCopy,
      features: metadata.features,
      productCount: Number(row.productCount ?? 0),
      updatedAt: row.updatedAt,
    } satisfies AdminCategoryRow;
  });
};
