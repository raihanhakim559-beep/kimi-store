"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db, orders } from "@/lib/schema";

const ORDER_STATUS_VALUES = [
  "pending",
  "paid",
  "fulfilled",
  "cancelled",
  "refunded",
] as const;

const PAYMENT_STATUS_VALUES = [
  "pending",
  "requires_action",
  "succeeded",
  "refunded",
  "failed",
] as const;

const FULFILLMENT_STATUS_VALUES = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;

const workflowSchema = z.object({
  locale: z.string().min(2),
  orderId: z.string().min(1),
  status: z.enum(ORDER_STATUS_VALUES),
  paymentStatus: z.enum(PAYMENT_STATUS_VALUES),
  fulfillmentStatus: z.enum(FULFILLMENT_STATUS_VALUES),
  notes: z.string().optional(),
});

const revalidateOrders = (locale: string) =>
  revalidatePath(`/${locale}/admin/orders`);

export const updateOrderWorkflow = async (formData: FormData) => {
  const parsed = workflowSchema.safeParse({
    locale: formData.get("locale"),
    orderId: formData.get("orderId"),
    status: formData.get("status"),
    paymentStatus: formData.get("paymentStatus"),
    fulfillmentStatus: formData.get("fulfillmentStatus"),
    notes: formData.get("notes") ?? undefined,
  });

  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }

  const { locale, orderId, status, paymentStatus, fulfillmentStatus, notes } =
    parsed.data;

  await db
    .update(orders)
    .set({
      status,
      paymentStatus,
      fulfillmentStatus,
      notes: notes && notes.trim().length > 0 ? notes : null,
      updatedAt: new Date(),
    })
    .where(eq(orders.id, orderId));

  revalidateOrders(locale);
};
