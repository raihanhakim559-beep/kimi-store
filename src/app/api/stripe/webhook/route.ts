import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

import { env } from "@/env.mjs";
import { cartItems, carts, db, orders, users } from "@/lib/schema";
import { stripeServer } from "@/lib/stripe";

const webhookHandler = async (req: NextRequest) => {
  try {
    const buf = await req.text();
    const sig = req.headers.get("stripe-signature")!;

    let event: Stripe.Event;

    try {
      event = stripeServer.webhooks.constructEvent(
        buf,
        sig,
        env.STRIPE_WEBHOOK_SECRET_KEY,
      );
    } catch (err) {
      return NextResponse.json(
        {
          error: {
            message: `Webhook Error - ${err}`,
          },
        },
        { status: 400 },
      );
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const sessionData = event.data.object as Stripe.Checkout.Session;
        const metadata = sessionData.metadata ?? {};
        const orderId = metadata.orderId;
        const cartId = metadata.cartId;

        if (orderId) {
          await db.transaction(async (tx) => {
            await tx
              .update(orders)
              .set({
                status: "paid",
                paymentStatus: "succeeded",
                fulfillmentStatus: "processing",
                stripePaymentIntentId:
                  typeof sessionData.payment_intent === "string"
                    ? sessionData.payment_intent
                    : (sessionData.payment_intent?.id ?? null),
                placedAt: new Date(),
                updatedAt: new Date(),
              })
              .where(eq(orders.id, orderId));

            if (cartId) {
              await tx
                .update(carts)
                .set({ status: "converted", updatedAt: new Date() })
                .where(eq(carts.id, cartId));

              await tx.delete(cartItems).where(eq(cartItems.cartId, cartId));
            }
          });
        }
        break;
      }
      case "checkout.session.expired": {
        const sessionData = event.data.object as Stripe.Checkout.Session;
        const orderId = sessionData.metadata?.orderId;

        if (orderId) {
          await db
            .update(orders)
            .set({
              status: "cancelled",
              paymentStatus: "failed",
              fulfillmentStatus: "cancelled",
              updatedAt: new Date(),
            })
            .where(eq(orders.id, orderId));
        }
        break;
      }
      case "customer.subscription.created":
        const subscription = event.data.object as Stripe.Subscription;
        await db
          .update(users)
          .set({ isActive: true })
          .where(eq(users.stripeCustomerId, subscription.customer as string));
        break;
      default:
        break;
    }
    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json(
      {
        error: {
          message: "Method Not Allowed",
        },
      },
      { status: 405 },
    ).headers.set("Allow", "POST");
  }
};

export { webhookHandler as POST };
