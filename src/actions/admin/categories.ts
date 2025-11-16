"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { categories, db } from "@/lib/schema";

const CATEGORY_GENDERS = ["men", "women", "unisex"] as const;

const newCategorySchema = z.object({
  locale: z.string().min(2),
  name: z.string().min(2),
  slug: z.string().min(2),
  gender: z.enum(CATEGORY_GENDERS),
  description: z.string().optional(),
  heroCopy: z.string().optional(),
  features: z.string().optional(),
});

const statusSchema = z.object({
  locale: z.string().min(2),
  categoryId: z.string().min(1),
  isActive: z.enum(["true", "false"]),
});

const heroSchema = z.object({
  locale: z.string().min(2),
  categoryId: z.string().min(1),
  description: z.string().optional(),
  heroCopy: z.string().optional(),
  features: z.string().optional(),
});

const parseFeatures = (raw?: string | null) =>
  raw
    ? raw
        .split(/\r?\n|,/)
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

const revalidateAdminCategories = (locale: string) =>
  revalidatePath(`/${locale}/admin/categories`);

export const createAdminCategory = async (formData: FormData) => {
  const parsed = newCategorySchema.safeParse({
    locale: formData.get("locale"),
    name: formData.get("name"),
    slug: formData.get("slug"),
    gender: formData.get("gender"),
    description: formData.get("description") ?? undefined,
    heroCopy: formData.get("heroCopy") ?? undefined,
    features: formData.get("features") ?? undefined,
  });

  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }

  const { locale, name, slug, gender, description, heroCopy, features } =
    parsed.data;

  const metadata: Record<string, unknown> = {};
  if (heroCopy && heroCopy.trim().length > 0) {
    metadata.heroCopy = heroCopy.trim();
  }
  const featureList = parseFeatures(features);
  if (featureList.length > 0) {
    metadata.features = featureList;
  }

  await db.insert(categories).values({
    name,
    slug,
    gender,
    description:
      description && description.trim().length > 0 ? description : null,
    metadata: Object.keys(metadata).length > 0 ? metadata : null,
    isActive: true,
  });

  revalidateAdminCategories(locale);
};

export const updateCategoryStatus = async (formData: FormData) => {
  const parsed = statusSchema.safeParse({
    locale: formData.get("locale"),
    categoryId: formData.get("categoryId"),
    isActive: formData.get("isActive"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }

  const { locale, categoryId, isActive } = parsed.data;
  const activeValue = isActive === "true";

  await db
    .update(categories)
    .set({ isActive: activeValue, updatedAt: new Date() })
    .where(eq(categories.id, categoryId));

  revalidateAdminCategories(locale);
};

export const updateCategoryDetails = async (formData: FormData) => {
  const parsed = heroSchema.safeParse({
    locale: formData.get("locale"),
    categoryId: formData.get("categoryId"),
    description: formData.get("description") ?? undefined,
    heroCopy: formData.get("heroCopy") ?? undefined,
    features: formData.get("features") ?? undefined,
  });

  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }

  const { locale, categoryId, description, heroCopy, features } = parsed.data;
  const featureList = parseFeatures(features);

  const metadata: Record<string, unknown> = {};
  const trimmedHero = heroCopy?.trim();
  if (trimmedHero && trimmedHero.length > 0) {
    metadata.heroCopy = trimmedHero;
  }
  if (featureList.length > 0) {
    metadata.features = featureList;
  }

  await db
    .update(categories)
    .set({
      description:
        description && description.trim().length > 0 ? description : null,
      metadata: Object.keys(metadata).length > 0 ? metadata : null,
      updatedAt: new Date(),
    })
    .where(eq(categories.id, categoryId));

  revalidateAdminCategories(locale);
};
