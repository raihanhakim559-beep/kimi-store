"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { logActivationEvent } from "@/lib/activation-events";
import { sendActivationEmail } from "@/lib/email/send-activation-email";
import { db, users } from "@/lib/schema";

const customerStatusSchema = z.object({
  locale: z.string().min(2),
  customerId: z.string().min(1),
  isActive: z.enum(["true", "false"]),
  reason: z.string().optional(),
});

const revalidateCustomers = (locale: string) =>
  revalidatePath(`/${locale}/admin/customers`);

export const updateCustomerStatus = async (formData: FormData) => {
  const parsed = customerStatusSchema.safeParse({
    locale: formData.get("locale"),
    customerId: formData.get("customerId"),
    isActive: formData.get("isActive"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }

  const { locale, customerId, isActive, reason } = parsed.data;
  const isActiveValue = isActive === "true";
  const updateData: Partial<typeof users.$inferInsert> = {
    isActive: isActiveValue,
  };

  if (isActiveValue) {
    updateData.hasAcceptedTerms = true;
    updateData.onboardingCompletedAt = new Date();
    updateData.emailVerified = new Date();
  } else {
    updateData.onboardingCompletedAt = null;
  }

  await db.update(users).set(updateData).where(eq(users.id, customerId));

  await logActivationEvent({
    userId: customerId,
    eventType: isActiveValue
      ? "activation_override_activate"
      : "activation_override_deactivate",
    metadata: {
      reason: reason ?? "Admin override toggle",
    },
  });

  revalidateCustomers(locale);
};

const resendActivationSchema = z.object({
  locale: z.string().min(2),
  customerId: z.string().min(1),
});

export const resendCustomerActivationEmail = async (formData: FormData) => {
  const parsed = resendActivationSchema.safeParse({
    locale: formData.get("locale"),
    customerId: formData.get("customerId"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }

  const { locale, customerId } = parsed.data;
  const [customer] = await db
    .select({ id: users.id, email: users.email, name: users.name })
    .from(users)
    .where(eq(users.id, customerId))
    .limit(1);

  if (!customer || !customer.email) {
    throw new Error("Customer email unavailable");
  }

  await sendActivationEmail({
    userId: customer.id,
    email: customer.email,
    name: customer.name,
    locale,
    channel: "admin",
  });

  revalidateCustomers(locale);
};
