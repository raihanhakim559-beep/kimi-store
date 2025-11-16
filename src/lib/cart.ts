import { desc, eq, sql } from "drizzle-orm";
import { cookies } from "next/headers";

import { auth } from "@/lib/auth";
import {
  cartItems,
  carts,
  categories,
  db,
  products,
  productVariants,
} from "@/lib/schema";

const CART_SESSION_COOKIE = "kimistore_cart";
const CART_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

const getExistingCartBySession = async (sessionId: string) => {
  const result = await db
    .select({
      id: carts.id,
      userId: carts.userId,
      sessionId: carts.sessionId,
      subtotal: carts.subtotal,
      discountTotal: carts.discountTotal,
      taxTotal: carts.taxTotal,
      shippingTotal: carts.shippingTotal,
      currency: carts.currency,
      updatedAt: carts.updatedAt,
    })
    .from(carts)
    .where(eq(carts.sessionId, sessionId))
    .limit(1);

  return result[0] ?? null;
};

const getExistingCartByUser = async (userId: string) => {
  const result = await db
    .select({
      id: carts.id,
      userId: carts.userId,
      sessionId: carts.sessionId,
      subtotal: carts.subtotal,
      discountTotal: carts.discountTotal,
      taxTotal: carts.taxTotal,
      shippingTotal: carts.shippingTotal,
      currency: carts.currency,
      updatedAt: carts.updatedAt,
    })
    .from(carts)
    .where(eq(carts.userId, userId))
    .orderBy(desc(carts.updatedAt))
    .limit(1);

  return result[0] ?? null;
};

const getCartSessionToken = async () =>
  (await cookies()).get(CART_SESSION_COOKIE)?.value ?? null;

const ensureCartSessionToken = async () => {
  const store = await cookies();
  let token = store.get(CART_SESSION_COOKIE)?.value;

  if (!token) {
    token = crypto.randomUUID();
    store.set(CART_SESSION_COOKIE, token, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: CART_COOKIE_MAX_AGE,
    });
  }

  return token;
};

export const getOrCreateCart = async (userId?: string | null) => {
  const sessionToken = await ensureCartSessionToken();
  const existingCart = await getExistingCartBySession(sessionToken);

  if (existingCart) {
    if (userId && !existingCart.userId) {
      await db
        .update(carts)
        .set({ userId })
        .where(eq(carts.id, existingCart.id));
      return { ...existingCart, userId };
    }

    return existingCart;
  }

  const [cart] = await db
    .insert(carts)
    .values({
      sessionId: sessionToken,
      userId: userId ?? null,
    })
    .returning({
      id: carts.id,
      userId: carts.userId,
      sessionId: carts.sessionId,
      subtotal: carts.subtotal,
      discountTotal: carts.discountTotal,
      taxTotal: carts.taxTotal,
      shippingTotal: carts.shippingTotal,
      currency: carts.currency,
    });

  return cart;
};

export const recalculateCartTotals = async (cartId: string) => {
  const [totals] = await db
    .select({
      subtotal: sql<number>`coalesce(sum(${cartItems.lineTotal}), 0)`,
    })
    .from(cartItems)
    .where(eq(cartItems.cartId, cartId));

  const subtotal = totals?.subtotal ?? 0;
  const shippingThreshold = 15000; // $150.00
  const shipping = subtotal >= shippingThreshold || subtotal === 0 ? 0 : 1200; // $12
  await db
    .update(carts)
    .set({
      subtotal,
      shippingTotal: shipping,
      discountTotal: 0,
      taxTotal: 0,
      updatedAt: new Date(),
    })
    .where(eq(carts.id, cartId));

  return { subtotal, shipping, total: subtotal + shipping };
};

export const getCartSummary = async () => {
  const session = await auth();
  const sessionToken = await getCartSessionToken();

  let cart = sessionToken ? await getExistingCartBySession(sessionToken) : null;

  if (!cart && session?.user?.id) {
    cart = await getExistingCartByUser(session.user.id);
  }

  if (!cart) {
    return {
      cart: null,
      items: [],
      totals: {
        subtotal: 0,
        shipping: 0,
        total: 0,
      },
    };
  }

  const items = await db
    .select({
      id: cartItems.id,
      quantity: cartItems.quantity,
      unitPrice: cartItems.unitPrice,
      lineTotal: cartItems.lineTotal,
      productId: products.id,
      productSlug: products.slug,
      productVariantId: productVariants.id,
      title: products.name,
      description: products.summary,
      category: categories.slug,
      sku: productVariants.sku,
      size: productVariants.size,
      color: productVariants.color,
    })
    .from(cartItems)
    .innerJoin(
      productVariants,
      eq(productVariants.id, cartItems.productVariantId),
    )
    .innerJoin(products, eq(products.id, productVariants.productId))
    .innerJoin(categories, eq(categories.id, products.categoryId))
    .where(eq(cartItems.cartId, cart.id))
    .orderBy(desc(cartItems.createdAt));

  const totals = await recalculateCartTotals(cart.id);

  return {
    cart,
    items,
    totals,
  };
};
