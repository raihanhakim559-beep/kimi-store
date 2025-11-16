"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db, users } from "@/lib/schema";

const customerStatusSchema = z.object({
  locale: z.string().min(2),
  customerId: z.string().min(1),
  isActive: z.enum(["true", "false"]),
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

  const { locale, customerId, isActive } = parsed.data;
  const isActiveValue = isActive === "true";

  await db
    .update(users)
    .set({ isActive: isActiveValue })
    .where(eq(users.id, customerId));

  revalidateCustomers(locale);
};
