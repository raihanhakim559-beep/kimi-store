"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db, promoCodes } from "@/lib/schema";

const createDiscountSchema = z.object({
  locale: z.string().min(2),
  code: z.string().trim().min(3).max(32),
  description: z.string().trim().min(4).max(160),
  discountType: z.enum(["percentage", "fixed"]),
  value: z.coerce.number().min(1),
  maxRedemptions: z.coerce.number().int().positive().optional(),
  startsAt: z.string().optional(),
  endsAt: z.string().optional(),
});

const toggleDiscountSchema = z.object({
  locale: z.string().min(2),
  discountId: z.string().min(1),
  isActive: z.enum(["true", "false"]),
});

const toDate = (value?: string | null) => (value ? new Date(value) : null);

const revalidateDiscounts = (locale: string) =>
  revalidatePath(`/${locale}/admin/discounts`);

export const createDiscount = async (formData: FormData) => {
  const parsed = createDiscountSchema.safeParse({
    locale: formData.get("locale"),
    code: formData.get("code"),
    description: formData.get("description") ?? "",
    discountType: formData.get("discountType"),
    value: formData.get("value"),
    maxRedemptions: formData.get("maxRedemptions") ?? undefined,
    startsAt: formData.get("startsAt") ?? undefined,
    endsAt: formData.get("endsAt") ?? undefined,
  });

  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }

  const {
    locale,
    code,
    description,
    discountType,
    value,
    maxRedemptions,
    startsAt,
    endsAt,
  } = parsed.data;

  const normalizedValue =
    discountType === "fixed" ? Math.round(value * 100) : Math.round(value);

  await db.insert(promoCodes).values({
    code: code.toUpperCase(),
    description,
    discountType,
    value: normalizedValue,
    maxRedemptions: maxRedemptions ?? null,
    redemptionCount: 0,
    startsAt: toDate(startsAt),
    endsAt: toDate(endsAt),
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  revalidateDiscounts(locale);
};

export const toggleDiscountStatus = async (formData: FormData) => {
  const parsed = toggleDiscountSchema.safeParse({
    locale: formData.get("locale"),
    discountId: formData.get("discountId"),
    isActive: formData.get("isActive"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }

  const { locale, discountId, isActive } = parsed.data;
  const isActiveBool = isActive === "true";

  await db
    .update(promoCodes)
    .set({ isActive: isActiveBool, updatedAt: new Date() })
    .where(eq(promoCodes.id, discountId));

  revalidateDiscounts(locale);
};
