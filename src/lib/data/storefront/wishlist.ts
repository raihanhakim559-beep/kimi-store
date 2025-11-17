import { and, desc, eq } from "drizzle-orm";
import { cache } from "react";

import {
  categories,
  db,
  products,
  productVariants,
  wishlistItems,
  wishlists,
} from "@/lib/schema";

export type WishlistEntry = {
  variantId: string;
  productSlug: string;
  title: string;
  description: string;
  category: string;
  price: number;
  size?: string | null;
  color?: string | null;
};

export const ensureWishlistForUser = async (userId: string) => {
  const existing = await db
    .select({ id: wishlists.id })
    .from(wishlists)
    .where(eq(wishlists.userId, userId))
    .limit(1);

  if (existing.length > 0) {
    return existing[0].id;
  }

  const [inserted] = await db
    .insert(wishlists)
    .values({ userId })
    .returning({ id: wishlists.id });

  return inserted.id;
};

export const getWishlistEntries = cache(async (userId: string) => {
  const rows = await db
    .select({
      variantId: wishlistItems.productVariantId,
      productSlug: products.slug,
      productName: products.name,
      summary: products.summary,
      description: products.description,
      price: products.price,
      categorySlug: categories.slug,
      size: productVariants.size,
      color: productVariants.color,
    })
    .from(wishlists)
    .where(eq(wishlists.userId, userId))
    .innerJoin(wishlistItems, eq(wishlistItems.wishlistId, wishlists.id))
    .innerJoin(
      productVariants,
      eq(productVariants.id, wishlistItems.productVariantId),
    )
    .innerJoin(products, eq(products.id, productVariants.productId))
    .innerJoin(categories, eq(categories.id, products.categoryId))
    .orderBy(desc(wishlistItems.addedAt));

  return rows.map(
    (row) =>
      ({
        variantId: row.variantId,
        productSlug: row.productSlug,
        title: row.productName,
        description: row.summary ?? row.description ?? "",
        category: row.categorySlug,
        price: row.price / 100,
        size: row.size,
        color: row.color,
      }) satisfies WishlistEntry,
  );
});

export const getDefaultVariantIdBySlug = async (productSlug: string) => {
  const productRows = await db
    .select({ id: products.id })
    .from(products)
    .where(eq(products.slug, productSlug))
    .limit(1);

  if (productRows.length === 0) {
    return null;
  }

  const productId = productRows[0].id;

  const defaultVariant = await db
    .select({ id: productVariants.id })
    .from(productVariants)
    .where(
      and(
        eq(productVariants.productId, productId),
        eq(productVariants.isDefault, true),
      ),
    )
    .limit(1);

  if (defaultVariant.length > 0) {
    return defaultVariant[0].id;
  }

  const fallbackVariant = await db
    .select({ id: productVariants.id })
    .from(productVariants)
    .where(eq(productVariants.productId, productId))
    .limit(1);

  if (fallbackVariant.length === 0) {
    return null;
  }

  return fallbackVariant[0].id;
};
