"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

const blogWorkflowSchema = z.object({
  locale: z.string().min(2),
  title: z.string().min(4),
  slug: z.string().min(2),
  status: z.enum(["draft", "scheduled", "published"]),
  scheduledAt: z.string().optional(),
  excerpt: z.string().optional(),
});

const blogActionDelay = () =>
  new Promise((resolve) => setTimeout(resolve, 200));

export const saveBlogWorkflow = async (formData: FormData) => {
  const parsed = blogWorkflowSchema.safeParse({
    locale: formData.get("locale"),
    title: formData.get("title"),
    slug: formData.get("slug"),
    status: formData.get("status"),
    scheduledAt: formData.get("scheduledAt") || undefined,
    excerpt: formData.get("excerpt") || undefined,
  });

  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }

  const { locale } = parsed.data;

  await blogActionDelay();
  revalidatePath(`/${locale}/admin/blog`);
};
