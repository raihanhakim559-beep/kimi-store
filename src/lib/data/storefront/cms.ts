import { and, asc, eq } from "drizzle-orm";
import { cache } from "react";

import { routing } from "@/i18n/routing";
import type { Locale } from "@/lib/i18n/copy";
import {
  cmsPageSections,
  cmsPagesTable,
  db,
  type JsonMap,
  type LocaleCopy,
} from "@/lib/schema";

import type {
  AboutContent,
  ContactChannel,
  ContactContent,
  Faq,
  FaqContent,
} from "./types";

type CmsPageRow = {
  id: string;
  slug: string;
  title: string | null;
  label: LocaleCopy | null;
  hero: LocaleCopy | null;
  description: LocaleCopy | null;
  summary: string | null;
  owner: string | null;
  status: typeof cmsPagesTable.$inferSelect.status;
  publishedAt: Date | null;
  lastEditedAt: Date | null;
};

type CmsSectionRow = {
  id: string;
  sectionType: typeof cmsPageSections.$inferSelect.sectionType;
  key: string | null;
  title: LocaleCopy | null;
  body: LocaleCopy | null;
  metadata: JsonMap | null;
  position: number;
  isActive: boolean;
};

const translateCmsCopy = (
  copy: LocaleCopy | null | undefined,
  locale: Locale,
) => {
  if (!copy) {
    return "";
  }

  return (
    copy[locale] ??
    copy[routing.defaultLocale] ??
    Object.values(copy).find((value) => Boolean(value)) ??
    ""
  );
};

const fetchCmsPageData = cache(
  async (
    slug: string,
  ): Promise<{ page: CmsPageRow; sections: CmsSectionRow[] } | null> => {
    const [page] = await db
      .select({
        id: cmsPagesTable.id,
        slug: cmsPagesTable.slug,
        title: cmsPagesTable.title,
        label: cmsPagesTable.label,
        hero: cmsPagesTable.hero,
        description: cmsPagesTable.description,
        summary: cmsPagesTable.summary,
        owner: cmsPagesTable.owner,
        status: cmsPagesTable.status,
        publishedAt: cmsPagesTable.publishedAt,
        lastEditedAt: cmsPagesTable.lastEditedAt,
      })
      .from(cmsPagesTable)
      .where(eq(cmsPagesTable.slug, slug))
      .limit(1);

    if (!page) {
      return null;
    }

    const sections = await db
      .select({
        id: cmsPageSections.id,
        sectionType: cmsPageSections.sectionType,
        key: cmsPageSections.key,
        title: cmsPageSections.title,
        body: cmsPageSections.body,
        metadata: cmsPageSections.metadata,
        position: cmsPageSections.position,
        isActive: cmsPageSections.isActive,
      })
      .from(cmsPageSections)
      .where(
        and(
          eq(cmsPageSections.pageId, page.id),
          eq(cmsPageSections.isActive, true),
        ),
      )
      .orderBy(asc(cmsPageSections.position), asc(cmsPageSections.id));

    return { page, sections };
  },
);

const extractCmsSectionValue = (
  metadata: JsonMap | null | undefined,
): string => {
  if (!metadata || typeof metadata !== "object") {
    return "";
  }
  const rawValue = (metadata as { value?: unknown }).value;
  return typeof rawValue === "string" ? rawValue : "";
};

const filterSectionsByType = (
  sections: CmsSectionRow[],
  type: CmsSectionRow["sectionType"],
) =>
  sections.filter(
    (section) => section.sectionType === type && section.isActive,
  );

export const getFaqContent = cache(
  async (locale: Locale): Promise<FaqContent> => {
    const cmsData = await fetchCmsPageData("faq");
    if (!cmsData) {
      return {
        label: "FAQ",
        title: "Frequently Asked Questions",
        description: "",
        entries: [],
      } satisfies FaqContent;
    }

    const entries = filterSectionsByType(cmsData.sections, "faq")
      .map(
        (section): Faq => ({
          question: translateCmsCopy(section.title, locale),
          answer: translateCmsCopy(section.body, locale),
        }),
      )
      .filter((entry) => entry.question || entry.answer);

    return {
      label: translateCmsCopy(cmsData.page.label, locale) || "FAQ",
      title:
        translateCmsCopy(cmsData.page.hero, locale) || cmsData.page.title || "",
      description:
        translateCmsCopy(cmsData.page.description, locale) ||
        cmsData.page.summary ||
        "",
      entries,
    } satisfies FaqContent;
  },
);

export const getContactContent = cache(
  async (locale: Locale): Promise<ContactContent> => {
    const cmsData = await fetchCmsPageData("contact");
    if (!cmsData) {
      return { hero: "", channels: [] } satisfies ContactContent;
    }

    const channels = filterSectionsByType(cmsData.sections, "contact_channel")
      .map(
        (section): ContactChannel => ({
          label: translateCmsCopy(section.title, locale),
          description: translateCmsCopy(section.body, locale),
          value: extractCmsSectionValue(section.metadata),
        }),
      )
      .filter(
        (channel) => channel.label || channel.description || channel.value,
      );

    return {
      hero:
        translateCmsCopy(cmsData.page.hero, locale) || cmsData.page.title || "",
      channels,
    } satisfies ContactContent;
  },
);

export const getAboutContent = cache(
  async (locale: Locale): Promise<AboutContent> => {
    const cmsData = await fetchCmsPageData("about");
    if (!cmsData) {
      return { label: "About", hero: "", description: "", pillars: [] };
    }

    const pillars = filterSectionsByType(cmsData.sections, "pillar")
      .map((section) => ({
        title: translateCmsCopy(section.title, locale),
        detail: translateCmsCopy(section.body, locale),
      }))
      .filter((pillar) => pillar.title || pillar.detail);

    return {
      label: translateCmsCopy(cmsData.page.label, locale) || "About",
      hero:
        translateCmsCopy(cmsData.page.hero, locale) || cmsData.page.title || "",
      description:
        translateCmsCopy(cmsData.page.description, locale) ||
        cmsData.page.summary ||
        "",
      pillars,
    } satisfies AboutContent;
  },
);
