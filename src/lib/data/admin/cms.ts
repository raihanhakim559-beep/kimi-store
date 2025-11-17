import { and, asc, desc, eq, ilike, or, type SQL, sql } from "drizzle-orm";

import { cmsPageSections, cmsPagesTable, db } from "@/lib/schema";

import type {
  AdminCmsFilters,
  AdminCmsPageRow,
  AdminCmsSectionRow,
  AdminCmsStatus,
} from "./types";

export const getAdminCmsPages = async ({
  search,
  status,
  limit = 25,
}: AdminCmsFilters = {}): Promise<AdminCmsPageRow[]> => {
  const filters: SQL<unknown>[] = [];

  const normalizedStatus =
    status && status !== "all" ? (status as AdminCmsStatus) : undefined;
  if (normalizedStatus) {
    filters.push(eq(cmsPagesTable.status, normalizedStatus));
  }

  const trimmed = search?.trim();
  if (trimmed && trimmed.length > 0) {
    const like = `%${trimmed}%`;
    filters.push(
      or(
        ilike(cmsPagesTable.title, like),
        ilike(cmsPagesTable.owner, like),
        ilike(cmsPagesTable.summary, like),
      )!,
    );
  }

  const query = db
    .select({
      slug: cmsPagesTable.slug,
      title: cmsPagesTable.title,
      status: cmsPagesTable.status,
      owner: cmsPagesTable.owner,
      summary: cmsPagesTable.summary,
      updatedAt: cmsPagesTable.updatedAt,
      publishedAt: cmsPagesTable.publishedAt,
      blockCount: sql<number>`count(${cmsPageSections.id})`,
    })
    .from(cmsPagesTable)
    .leftJoin(
      cmsPageSections,
      and(
        eq(cmsPageSections.pageId, cmsPagesTable.id),
        eq(cmsPageSections.isActive, true),
      ),
    )
    .groupBy(
      cmsPagesTable.id,
      cmsPagesTable.slug,
      cmsPagesTable.title,
      cmsPagesTable.status,
      cmsPagesTable.owner,
      cmsPagesTable.summary,
      cmsPagesTable.publishedAt,
      cmsPagesTable.updatedAt,
    )
    .orderBy(desc(cmsPagesTable.updatedAt), desc(cmsPagesTable.publishedAt));

  const filterExpression =
    filters.length === 0
      ? null
      : filters.length === 1
        ? filters[0]!
        : and(filters[0]!, filters[1]!, ...filters.slice(2));

  const rows = await (
    filterExpression ? query.where(filterExpression) : query
  ).limit(limit);

  return rows.map((row) => ({
    slug: row.slug,
    title: row.title,
    status: row.status as AdminCmsStatus,
    owner: row.owner ?? "Unassigned",
    blocks: Number(row.blockCount ?? 0),
    lastPublishedAt: row.publishedAt ?? row.updatedAt ?? new Date(),
    summary: row.summary ?? "",
  }));
};

export const getAdminCmsSections = async (
  slug: string,
): Promise<AdminCmsSectionRow[]> => {
  const rows = await db
    .select({
      id: cmsPageSections.id,
      pageSlug: cmsPagesTable.slug,
      pageTitle: cmsPagesTable.title,
      sectionType: cmsPageSections.sectionType,
      title: cmsPageSections.title,
      body: cmsPageSections.body,
      metadata: cmsPageSections.metadata,
      position: cmsPageSections.position,
      isActive: cmsPageSections.isActive,
    })
    .from(cmsPageSections)
    .innerJoin(cmsPagesTable, eq(cmsPageSections.pageId, cmsPagesTable.id))
    .where(
      and(eq(cmsPagesTable.slug, slug), eq(cmsPageSections.isActive, true)),
    )
    .orderBy(asc(cmsPageSections.position), desc(cmsPageSections.updatedAt));

  return rows;
};
