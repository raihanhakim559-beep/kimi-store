"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db, products } from "@/lib/schema";

const STATUS_VALUES = ["draft", "active", "archived"] as const;

const newProductSchema = z.object({
  locale: z.string().min(2),
  name: z.string().min(3),
  slug: z.string().min(3),
  categoryId: z.string().min(1),
  price: z.preprocess((value) => Number(value), z.number().nonnegative()),
  currency: z.string().min(3).max(3).default("MYR"),
  status: z.enum(STATUS_VALUES).default("draft"),
});

const statusUpdateSchema = z.object({
  locale: z.string().min(2),
  productId: z.string().min(1),
  status: z.enum(STATUS_VALUES),
});

const toCents = (amount: number) => Math.round(amount * 100);

const revalidateAdminProducts = (locale: string) =>
  revalidatePath(`/${locale}/admin/products`);

export const createAdminProduct = async (formData: FormData) => {
  const currencyInput = formData.get("currency");
  const statusInput = formData.get("status");

  const parsed = newProductSchema.safeParse({
    locale: formData.get("locale"),
    name: formData.get("name"),
    slug: formData.get("slug"),
    categoryId: formData.get("categoryId"),
    price: formData.get("price"),
    currency:
      typeof currencyInput === "string" ? currencyInput.toUpperCase() : "MYR",
    status:
      typeof statusInput === "string"
        ? (statusInput as (typeof STATUS_VALUES)[number])
        : "draft",
  });

  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }

  const { locale, name, slug, categoryId, price, currency, status } =
    parsed.data;

  await db.insert(products).values({
    name,
    slug,
    categoryId,
    price: toCents(price),
    currency,
    status,
  });

  revalidateAdminProducts(locale);
};

export const updateProductStatus = async (formData: FormData) => {
  const statusInput = formData.get("status");

  const parsed = statusUpdateSchema.safeParse({
    locale: formData.get("locale"),
    productId: formData.get("productId"),
    status:
      typeof statusInput === "string"
        ? (statusInput as (typeof STATUS_VALUES)[number])
        : undefined,
  });

  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }

  const { locale, productId, status } = parsed.data;

  await db
    .update(products)
    .set({ status, updatedAt: new Date() })
    .where(eq(products.id, productId));

  revalidateAdminProducts(locale);
};
