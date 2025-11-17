"use server";

import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";

import { env } from "@/env.mjs";
import { auth } from "@/lib/auth";
import { getCartSummary } from "@/lib/cart";
import { db, orderItems, orders } from "@/lib/schema";
import { stripeServer } from "@/lib/stripe";

const ORDER_PREFIX = "KS";

const generateOrderNumber = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  return `${ORDER_PREFIX}-${timestamp}`;
};

export const createCheckoutSession = async (formData: FormData) => {
  const localeInput = formData.get("locale");
  const locale =
    typeof localeInput === "string" && /^[a-z]{2}$/i.test(localeInput)
      ? localeInput
      : "en";

  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/${locale}/account/login`);
  }

  if (!session.user.isActive) {
    redirect(`/${locale}/account/profile?activation=1`);
  }
  const { cart, items, totals } = await getCartSummary();

  if (!cart || items.length === 0) {
    redirect(`/${locale}/cart`);
  }

  const userId = session?.user?.id ?? null;

  const { orderId, orderNumber } = await db.transaction(async (tx) => {
    const [existingOrder] = await tx
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
      })
      .from(orders)
      .where(and(eq(orders.cartId, cart.id), eq(orders.status, "pending")))
      .limit(1);

    let targetOrderId = existingOrder?.id;
    const nextOrderNumber = existingOrder?.orderNumber ?? generateOrderNumber();

    if (existingOrder) {
      await tx
        .delete(orderItems)
        .where(eq(orderItems.orderId, existingOrder.id));
      await tx
        .update(orders)
        .set({
          userId,
          subtotal: totals.subtotal,
          shippingTotal: totals.shipping,
          discountTotal: cart.discountTotal,
          taxTotal: cart.taxTotal,
          total: totals.total,
          currency: cart.currency,
          updatedAt: new Date(),
        })
        .where(eq(orders.id, existingOrder.id));
    } else {
      const [created] = await tx
        .insert(orders)
        .values({
          orderNumber: nextOrderNumber,
          cartId: cart.id,
          userId,
          subtotal: totals.subtotal,
          shippingTotal: totals.shipping,
          discountTotal: cart.discountTotal,
          taxTotal: cart.taxTotal,
          total: totals.total,
          currency: cart.currency,
        })
        .returning({ id: orders.id });

      targetOrderId = created?.id;
    }

    if (!targetOrderId) {
      throw new Error("Unable to create order");
    }

    if (items.length) {
      await tx.insert(orderItems).values(
        items.map((item) => ({
          orderId: targetOrderId!,
          productId: item.productId,
          productVariantId: item.productVariantId,
          name: item.title,
          sku: item.sku ?? null,
          size: item.size ?? null,
          color: item.color ?? null,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          lineTotal: item.lineTotal,
          snapshot: {
            slug: item.productSlug,
            description: item.description,
          },
        })),
      );
    }

    return { orderId: targetOrderId!, orderNumber: nextOrderNumber };
  });

  const baseUrl = env.APP_URL.endsWith("/")
    ? env.APP_URL.slice(0, -1)
    : env.APP_URL;
  const checkoutPath = `/${locale}/checkout`;

  const checkoutSession = await stripeServer.checkout.sessions.create({
    mode: "payment",
    customer: session?.user?.stripeCustomerId || undefined,
    customer_email: session?.user?.email || undefined,
    client_reference_id: orderNumber,
    metadata: {
      orderId,
      cartId: cart.id,
      userId: userId ?? "",
    },
    line_items: items.map((item) => ({
      quantity: item.quantity,
      price_data: {
        currency: cart.currency.toLowerCase(),
        unit_amount: item.unitPrice,
        product_data: {
          name: item.title,
          description: item.description ?? undefined,
        },
      },
      adjustable_quantity: {
        enabled: false,
      },
    })),
    shipping_address_collection: {
      allowed_countries: ["MY", "SG", "US"],
    },
    success_url: `${baseUrl}${checkoutPath}?success=1`,
    cancel_url: `${baseUrl}${checkoutPath}?cancelled=1`,
  });

  await db
    .update(orders)
    .set({ stripeCheckoutSessionId: checkoutSession.id })
    .where(eq(orders.id, orderId));

  if (!checkoutSession.url) {
    throw new Error("Stripe session missing redirect URL");
  }

  redirect(checkoutSession.url);
};
