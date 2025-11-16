import { and, desc, eq, ilike, or, type SQL, sql } from "drizzle-orm";

import { categories, db, products, productVariants } from "@/lib/schema";

type AdminProductFilters = {
  search?: string | null;
  status?: "draft" | "active" | "archived" | null;
  limit?: number;
};

export type AdminProductRow = {
  id: string;
  name: string;
  slug: string;
  status: "draft" | "active" | "archived";
  price: number;
  currency: string;
  updatedAt: Date | null;
  categoryName?: string | null;
  categorySlug?: string | null;
  inventory: number;
  variantCount: number;
};

export const getAdminProducts = async ({
  search,
  status,
  limit = 25,
}: AdminProductFilters = {}): Promise<AdminProductRow[]> => {
  const filters: SQL<unknown>[] = [];

  const trimmed = search?.trim();
  if (trimmed && trimmed.length > 0) {
    const searchExpression = or(
      ilike(products.name, `%${trimmed}%`),
      ilike(products.slug, `%${trimmed}%`),
    );
    filters.push(searchExpression!);
  }

  if (status && ["draft", "active", "archived"].includes(status)) {
    filters.push(eq(products.status, status));
  }

  const buildQuery = () =>
    db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        status: products.status,
        price: products.price,
        currency: products.currency,
        updatedAt: products.updatedAt,
        categoryName: categories.name,
        categorySlug: categories.slug,
        inventory: sql<number>`coalesce(sum(${productVariants.stock}), 0)`,
        variantCount: sql<number>`count(${productVariants.id})`,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(productVariants, eq(productVariants.productId, products.id));

  const filterExpression =
    filters.length === 0
      ? null
      : filters.length === 1
        ? filters[0]!
        : and(filters[0]!, filters[1]!, ...filters.slice(2));

  const rows = await (
    filterExpression ? buildQuery().where(filterExpression) : buildQuery()
  )
    .groupBy(products.id, categories.name, categories.slug)
    .orderBy(desc(products.updatedAt))
    .limit(limit);

  return rows.map((row) => ({
    ...row,
    inventory: Number(row.inventory ?? 0),
    variantCount: Number(row.variantCount ?? 0),
  }));
};

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
