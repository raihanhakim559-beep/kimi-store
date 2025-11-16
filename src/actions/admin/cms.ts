"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

const cmsPageUpdateSchema = z.object({
  locale: z.string().min(2),
  page: z.enum(["about", "contact", "faq"]),
  headline: z.string().min(3),
  summary: z.string().optional(),
});

const cmsFaqSchema = z.object({
  locale: z.string().min(2),
  question: z.string().min(4),
  answer: z.string().min(6),
});

const simulateCmsWrite = () =>
  new Promise((resolve) => setTimeout(resolve, 200));

export const updateCmsPageContent = async (formData: FormData) => {
  const parsed = cmsPageUpdateSchema.safeParse({
    locale: formData.get("locale"),
    page: formData.get("page"),
    headline: formData.get("headline"),
    summary: formData.get("summary") || undefined,
  });

  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }

  const { locale } = parsed.data;
  await simulateCmsWrite();
  revalidatePath(`/${locale}/admin/cms`);
};

export const addFaqEntry = async (formData: FormData) => {
  const parsed = cmsFaqSchema.safeParse({
    locale: formData.get("locale"),
    question: formData.get("question"),
    answer: formData.get("answer"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }

  const { locale } = parsed.data;
  await simulateCmsWrite();
  revalidatePath(`/${locale}/admin/cms`);
};
