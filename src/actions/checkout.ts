"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

import { env } from "@/env.mjs";
import { auth } from "@/lib/auth";
import { getCartSummary } from "@/lib/cart";
import { persistPendingOrder } from "@/lib/order-persistence";
import { db, orders } from "@/lib/schema";
import { stripeServer } from "@/lib/stripe";
import { getUserActivationState } from "@/lib/user-status";

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

  const userId = session.user.id;
  const userStatus = await getUserActivationState(userId);

  if (!userStatus?.isActive) {
    redirect(`/${locale}/account/profile?activation=1`);
  }
  const { cart, items, totals } = await getCartSummary();

  if (!cart || items.length === 0) {
    redirect(`/${locale}/cart`);
  }
  const currency = cart.currency ?? "USD";
  const discountTotal = cart.discountTotal ?? 0;
  const taxTotal = cart.taxTotal ?? 0;

  const { orderId, orderNumber } = await persistPendingOrder({
    cartId: cart.id,
    userId,
    currency,
    discountTotal,
    taxTotal,
    totals,
    items,
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
      userId,
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
