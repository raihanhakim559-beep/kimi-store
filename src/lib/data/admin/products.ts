import { and, desc, eq, ilike, or, type SQL, sql } from "drizzle-orm";

import {
  categories,
  db,
  productImages,
  products,
  productVariants,
} from "@/lib/schema";

import type { AdminProductFilters, AdminProductRow } from "./types";

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
        coverImageUrl: productImages.url,
        coverImageAlt: productImages.alt,
        inventory: sql<number>`coalesce(sum(${productVariants.stock}), 0)`,
        variantCount: sql<number>`count(${productVariants.id})`,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(productVariants, eq(productVariants.productId, products.id))
      .leftJoin(
        productImages,
        and(
          eq(productImages.productId, products.id),
          eq(productImages.isPrimary, true),
        ),
      );

  const filterExpression =
    filters.length === 0
      ? null
      : filters.length === 1
        ? filters[0]!
        : and(filters[0]!, filters[1]!, ...filters.slice(2));

  const rows = await (
    filterExpression ? buildQuery().where(filterExpression) : buildQuery()
  )
    .groupBy(
      products.id,
      categories.name,
      categories.slug,
      productImages.url,
      productImages.alt,
    )
    .orderBy(desc(products.updatedAt))
    .limit(limit);

  return rows.map((row) => ({
    ...row,
    inventory: Number(row.inventory ?? 0),
    variantCount: Number(row.variantCount ?? 0),
  }));
};
