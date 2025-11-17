import { and, eq } from "drizzle-orm";

import { db, orderItems, orders } from "@/lib/schema";

type CheckoutItemInput = {
  productId: string;
  productVariantId: string | null;
  title: string;
  description?: string | null;
  category?: string | null;
  sku?: string | null;
  size?: string | null;
  color?: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  id?: string;
  productSlug?: string | null;
};

type PersistPendingOrderArgs = {
  cartId: string;
  userId: string;
  currency: string;
  discountTotal: number;
  taxTotal: number;
  totals: {
    subtotal: number;
    shipping: number;
    total: number;
  };
  items: CheckoutItemInput[];
  orderNumberFactory?: () => string;
};

const ORDER_PREFIX = "KS";

export const generateOrderNumber = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  return `${ORDER_PREFIX}-${timestamp}`;
};

export const persistPendingOrder = async ({
  cartId,
  userId,
  currency,
  discountTotal,
  taxTotal,
  totals,
  items,
  orderNumberFactory = generateOrderNumber,
}: PersistPendingOrderArgs) => {
  const [existingOrder] = await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
    })
    .from(orders)
    .where(and(eq(orders.cartId, cartId), eq(orders.status, "pending")))
    .limit(1);

  const orderNumber = existingOrder?.orderNumber ?? orderNumberFactory();
  let orderId = existingOrder?.id ?? null;
  const now = new Date();

  if (existingOrder) {
    await db.delete(orderItems).where(eq(orderItems.orderId, existingOrder.id));
    await db
      .update(orders)
      .set({
        userId,
        subtotal: totals.subtotal,
        shippingTotal: totals.shipping,
        discountTotal,
        taxTotal,
        total: totals.total,
        currency,
        updatedAt: now,
      })
      .where(eq(orders.id, existingOrder.id));
  } else {
    const [created] = await db
      .insert(orders)
      .values({
        orderNumber,
        cartId,
        userId,
        subtotal: totals.subtotal,
        shippingTotal: totals.shipping,
        discountTotal,
        taxTotal,
        total: totals.total,
        currency,
        updatedAt: now,
      })
      .returning({ id: orders.id });

    orderId = created?.id ?? null;
  }

  if (!orderId) {
    throw new Error("Unable to create order");
  }

  if (items.length) {
    await db.insert(orderItems).values(
      items.map((item) => ({
        orderId,
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

  return { orderId, orderNumber };
};
