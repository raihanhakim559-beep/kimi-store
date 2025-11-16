"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import {
  ensureWishlistForUser,
  getDefaultVariantIdBySlug,
} from "@/lib/data/wishlist";
import { db, wishlistItems } from "@/lib/schema";

export const toggleWishlistItem = async (formData: FormData) => {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/account/login");
  }

  const productSlug = formData.get("productSlug");

  if (typeof productSlug !== "string" || productSlug.length === 0) {
    throw new Error("Invalid product");
  }

  const variantId = await getDefaultVariantIdBySlug(productSlug);

  if (!variantId) {
    throw new Error("Product unavailable");
  }

  const wishlistId = await ensureWishlistForUser(session.user.id);

  const existing = await db
    .select({ variantId: wishlistItems.productVariantId })
    .from(wishlistItems)
    .where(
      and(
        eq(wishlistItems.wishlistId, wishlistId),
        eq(wishlistItems.productVariantId, variantId),
      ),
    )
    .limit(1);

  if (existing.length > 0) {
    await db
      .delete(wishlistItems)
      .where(
        and(
          eq(wishlistItems.wishlistId, wishlistId),
          eq(wishlistItems.productVariantId, variantId),
        ),
      );
  } else {
    await db
      .insert(wishlistItems)
      .values({ wishlistId, productVariantId: variantId });
  }

  revalidatePath("/[locale]/(storefront)/wishlist", "page");
  revalidatePath("/[locale]/(storefront)/account/dashboard", "page");
};
