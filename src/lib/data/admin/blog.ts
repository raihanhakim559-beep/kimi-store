import { and, desc, eq, ilike, or, type SQL } from "drizzle-orm";

import { blogPostsTable, db } from "@/lib/schema";

import type {
  AdminBlogPostFilters,
  AdminBlogPostRow,
  AdminBlogStatus,
} from "./types";

export const getAdminBlogPosts = async ({
  search,
  status,
  limit = 50,
}: AdminBlogPostFilters = {}): Promise<AdminBlogPostRow[]> => {
  const filters: SQL<unknown>[] = [];

  const normalizedStatus =
    status && status !== "all" ? (status as AdminBlogStatus) : undefined;
  if (normalizedStatus) {
    filters.push(eq(blogPostsTable.status, normalizedStatus));
  }

  const trimmed = search?.trim();
  if (trimmed && trimmed.length > 0) {
    const like = `%${trimmed}%`;
    filters.push(
      or(
        ilike(blogPostsTable.title, like),
        ilike(blogPostsTable.author, like),
        ilike(blogPostsTable.excerpt, like),
      )!,
    );
  }

  const query = db
    .select({
      slug: blogPostsTable.slug,
      title: blogPostsTable.title,
      author: blogPostsTable.author,
      excerpt: blogPostsTable.excerpt,
      minutesToRead: blogPostsTable.minutesToRead,
      status: blogPostsTable.status,
      publishedAt: blogPostsTable.publishedAt,
      scheduledAt: blogPostsTable.scheduledAt,
      lastEditedAt: blogPostsTable.lastEditedAt,
      updatedAt: blogPostsTable.updatedAt,
      createdAt: blogPostsTable.createdAt,
    })
    .from(blogPostsTable)
    .orderBy(desc(blogPostsTable.lastEditedAt), desc(blogPostsTable.updatedAt));

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
    author: row.author,
    excerpt: row.excerpt,
    minutesToRead: row.minutesToRead,
    status: row.status as AdminBlogStatus,
    publishedAt: row.publishedAt,
    scheduledAt: row.scheduledAt,
    lastEditedAt:
      row.lastEditedAt ?? row.updatedAt ?? row.createdAt ?? new Date(),
  }));
};
