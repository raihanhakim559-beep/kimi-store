"use server";

import { desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  cmsPageSections,
  cmsPagesTable,
  db,
  type JsonMap,
  type LocaleCopy,
} from "@/lib/schema";

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

const cmsContactChannelSchema = z.object({
  locale: z.string().min(2),
  label: z.string().min(2),
  value: z.string().min(2),
  description: z.string().min(4),
});

const cmsSectionUpdateSchema = z.object({
  locale: z.string().min(2),
  sectionId: z.string().min(1),
  title: z.string().optional(),
  body: z.string().optional(),
  metadataValue: z.string().optional(),
});

const cmsSectionDeleteSchema = z.object({
  locale: z.string().min(2),
  sectionId: z.string().min(1),
});

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);

const revalidateCms = (locale: string, slug: string) => {
  revalidatePath(`/${locale}/admin/cms`);
  revalidatePath(`/${locale}/${slug}`);
};

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

  const { locale, page, headline, summary } = parsed.data;

  const [record] = await db
    .select({
      id: cmsPagesTable.id,
      hero: cmsPagesTable.hero,
      description: cmsPagesTable.description,
      summary: cmsPagesTable.summary,
    })
    .from(cmsPagesTable)
    .where(eq(cmsPagesTable.slug, page))
    .limit(1);

  if (!record) {
    throw new Error(`CMS page "${page}" was not found`);
  }

  const nextHero: LocaleCopy = {
    ...(record.hero ?? {}),
    [locale]: headline,
  };

  const nextDescription =
    summary && summary.length > 0
      ? ({
          ...(record.description ?? {}),
          [locale]: summary,
        } satisfies LocaleCopy)
      : (record.description ?? null);

  await db
    .update(cmsPagesTable)
    .set({
      hero: nextHero,
      description: nextDescription,
      summary: summary ?? record.summary ?? "",
      updatedAt: new Date(),
      lastEditedAt: new Date(),
      publishedAt: new Date(),
      status: "published",
    })
    .where(eq(cmsPagesTable.id, record.id));

  revalidateCms(locale, page);
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

  const { locale, question, answer } = parsed.data;

  const [faqPage] = await db
    .select({ id: cmsPagesTable.id })
    .from(cmsPagesTable)
    .where(eq(cmsPagesTable.slug, "faq"))
    .limit(1);

  if (!faqPage) {
    throw new Error("FAQ page has not been created yet.");
  }

  const [lastSection] = await db
    .select({ position: cmsPageSections.position })
    .from(cmsPageSections)
    .where(eq(cmsPageSections.pageId, faqPage.id))
    .orderBy(desc(cmsPageSections.position))
    .limit(1);

  const nextPosition = (lastSection?.position ?? 0) + 1;

  await db.insert(cmsPageSections).values({
    pageId: faqPage.id,
    sectionType: "faq",
    key: slugify(question),
    title: { [locale]: question } satisfies LocaleCopy,
    body: { [locale]: answer } satisfies LocaleCopy,
    position: nextPosition,
    isActive: true,
  });

  revalidateCms(locale, "faq");
};

export const addContactChannel = async (formData: FormData) => {
  const parsed = cmsContactChannelSchema.safeParse({
    locale: formData.get("locale"),
    label: formData.get("label"),
    value: formData.get("value"),
    description: formData.get("description"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }

  const { locale, label, value, description } = parsed.data;

  const [contactPage] = await db
    .select({ id: cmsPagesTable.id })
    .from(cmsPagesTable)
    .where(eq(cmsPagesTable.slug, "contact"))
    .limit(1);

  if (!contactPage) {
    throw new Error("Contact page has not been created yet.");
  }

  const [lastSection] = await db
    .select({ position: cmsPageSections.position })
    .from(cmsPageSections)
    .where(eq(cmsPageSections.pageId, contactPage.id))
    .orderBy(desc(cmsPageSections.position))
    .limit(1);

  const nextPosition = (lastSection?.position ?? 0) + 1;

  await db.insert(cmsPageSections).values({
    pageId: contactPage.id,
    sectionType: "contact_channel",
    key: slugify(label),
    title: { [locale]: label } satisfies LocaleCopy,
    body: { [locale]: description } satisfies LocaleCopy,
    metadata: { value } satisfies JsonMap,
    position: nextPosition,
    isActive: true,
  });

  revalidateCms(locale, "contact");
};

export const updateCmsSection = async (formData: FormData) => {
  const parsed = cmsSectionUpdateSchema.safeParse({
    locale: formData.get("locale"),
    sectionId: formData.get("sectionId"),
    title: formData.get("title") ?? undefined,
    body: formData.get("body") ?? undefined,
    metadataValue: formData.get("metadataValue") ?? undefined,
  });

  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }

  const { locale, sectionId, title, body, metadataValue } = parsed.data;

  const [section] = await db
    .select({
      id: cmsPageSections.id,
      title: cmsPageSections.title,
      body: cmsPageSections.body,
      metadata: cmsPageSections.metadata,
      slug: cmsPagesTable.slug,
    })
    .from(cmsPageSections)
    .innerJoin(cmsPagesTable, eq(cmsPageSections.pageId, cmsPagesTable.id))
    .where(eq(cmsPageSections.id, sectionId))
    .limit(1);

  if (!section) {
    throw new Error("Section not found");
  }

  let nextTitle = section.title;
  if (title !== undefined) {
    nextTitle = { ...(section.title ?? {}), [locale]: title };
  }

  let nextBody = section.body;
  if (body !== undefined) {
    nextBody = { ...(section.body ?? {}), [locale]: body };
  }

  let nextMetadata = section.metadata;
  if (metadataValue !== undefined) {
    const existing = (section.metadata ?? {}) as JsonMap;
    nextMetadata = { ...existing, value: metadataValue };
  }

  await db
    .update(cmsPageSections)
    .set({
      title: nextTitle,
      body: nextBody,
      metadata: nextMetadata,
      updatedAt: new Date(),
    })
    .where(eq(cmsPageSections.id, sectionId));

  revalidateCms(locale, section.slug);
};

export const deleteCmsSection = async (formData: FormData) => {
  const parsed = cmsSectionDeleteSchema.safeParse({
    locale: formData.get("locale"),
    sectionId: formData.get("sectionId"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }

  const { locale, sectionId } = parsed.data;

  const [section] = await db
    .select({
      id: cmsPageSections.id,
      slug: cmsPagesTable.slug,
    })
    .from(cmsPageSections)
    .innerJoin(cmsPagesTable, eq(cmsPageSections.pageId, cmsPagesTable.id))
    .where(eq(cmsPageSections.id, sectionId))
    .limit(1);

  if (!section) {
    throw new Error("Section not found");
  }

  await db
    .update(cmsPageSections)
    .set({ isActive: false, updatedAt: new Date() })
    .where(eq(cmsPageSections.id, sectionId));

  revalidateCms(locale, section.slug);
};
