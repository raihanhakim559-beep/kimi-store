"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { getOrCreateCart, recalculateCartTotals } from "@/lib/cart";
import { cartItems, db, products, productVariants } from "@/lib/schema";

const CART_PAGE_PATH = "/[locale]/(storefront)/cart";

const normalizeQuantity = (value: unknown) => {
  const parsed = Number(value);
  if (Number.isNaN(parsed) || parsed < 1) return 1;
  return Math.min(10, Math.floor(parsed));
};

export const addToCart = async (formData: FormData) => {
  const session = await auth();
  const cart = await getOrCreateCart(session?.user?.id);

  const productSlug = formData.get("productSlug");
  const quantity = normalizeQuantity(formData.get("quantity") ?? 1);
  const variantId = formData.get("variantId");

  if (typeof productSlug !== "string" || productSlug.length === 0) {
    throw new Error("Invalid product");
  }

  const isExplicitVariant =
    typeof variantId === "string" && variantId.length > 0;

  const variantSelector = isExplicitVariant
    ? eq(productVariants.id, variantId as string)
    : eq(productVariants.isDefault, true);

  let [variant] = await db
    .select({
      variantId: productVariants.id,
      productId: products.id,
      basePrice: products.price,
      overridePrice: productVariants.price,
    })
    .from(products)
    .innerJoin(productVariants, eq(productVariants.productId, products.id))
    .where(and(eq(products.slug, productSlug), variantSelector))
    .limit(1);

  if (!variant && isExplicitVariant) {
    throw new Error("Variant unavailable");
  }

  if (!variant) {
    const [fallbackVariant] = await db
      .select({
        variantId: productVariants.id,
        productId: products.id,
        basePrice: products.price,
        overridePrice: productVariants.price,
      })
      .from(products)
      .innerJoin(productVariants, eq(productVariants.productId, products.id))
      .where(eq(products.slug, productSlug))
      .limit(1);

    variant = fallbackVariant;
  }

  if (!variant) {
    throw new Error("Variant unavailable");
  }

  const unitPrice = variant.overridePrice ?? variant.basePrice;
  const lineDelta = unitPrice * quantity;

  const existing = await db
    .select({ id: cartItems.id, quantity: cartItems.quantity })
    .from(cartItems)
    .where(
      and(
        eq(cartItems.cartId, cart.id),
        eq(cartItems.productVariantId, variant.variantId),
      ),
    )
    .limit(1);

  if (existing.length > 0) {
    const nextQuantity = Math.min(10, existing[0].quantity + quantity);
    await db
      .update(cartItems)
      .set({
        quantity: nextQuantity,
        lineTotal: unitPrice * nextQuantity,
      })
      .where(eq(cartItems.id, existing[0].id));
  } else {
    await db.insert(cartItems).values({
      cartId: cart.id,
      productVariantId: variant.variantId,
      quantity,
      unitPrice,
      lineTotal: lineDelta,
    });
  }

  await recalculateCartTotals(cart.id);
  revalidatePath(CART_PAGE_PATH, "page");
};

export const updateCartItemQuantity = async (formData: FormData) => {
  const session = await auth();
  const cart = await getOrCreateCart(session?.user?.id);

  const cartItemId = formData.get("cartItemId");
  const quantity = normalizeQuantity(formData.get("quantity") ?? 1);

  if (typeof cartItemId !== "string") {
    throw new Error("Invalid cart item");
  }

  const [item] = await db
    .select({ id: cartItems.id, unitPrice: cartItems.unitPrice })
    .from(cartItems)
    .where(and(eq(cartItems.id, cartItemId), eq(cartItems.cartId, cart.id)))
    .limit(1);

  if (!item) {
    return;
  }

  await db
    .update(cartItems)
    .set({
      quantity,
      lineTotal: item.unitPrice * quantity,
    })
    .where(eq(cartItems.id, item.id));

  await recalculateCartTotals(cart.id);
  revalidatePath(CART_PAGE_PATH, "page");
};

export const removeCartItem = async (formData: FormData) => {
  const session = await auth();
  const cart = await getOrCreateCart(session?.user?.id);

  const cartItemId = formData.get("cartItemId");

  if (typeof cartItemId !== "string") {
    throw new Error("Invalid cart item");
  }

  await db
    .delete(cartItems)
    .where(and(eq(cartItems.id, cartItemId), eq(cartItems.cartId, cart.id)));

  await recalculateCartTotals(cart.id);
  revalidatePath(CART_PAGE_PATH, "page");
};
