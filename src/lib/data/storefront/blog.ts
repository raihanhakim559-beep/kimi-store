import { and, desc, eq } from "drizzle-orm";
import { cache } from "react";

import { blogPostsTable, db } from "@/lib/schema";

import type { BlogPost, BlogPostSection } from "./types";

type BlogPostSectionRecord = {
  heading?: string | null;
  body?: string | null;
};

const normalizeBlogSections = (value: unknown): BlogPostSection[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  const sections: BlogPostSection[] = [];
  value.forEach((section) => {
    if (!section || typeof section !== "object") {
      return;
    }
    const heading =
      "heading" in section && typeof section.heading === "string"
        ? section.heading
        : undefined;
    const body =
      "body" in section && typeof section.body === "string"
        ? section.body
        : undefined;
    if (!body) {
      return;
    }
    sections.push({ heading, body });
  });
  return sections;
};

const mapBlogPostRecord = (record: {
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  minutesToRead: number;
  sections: BlogPostSectionRecord[] | null;
  publishedAt: Date | null;
}): BlogPost => ({
  slug: record.slug,
  title: record.title,
  excerpt: record.excerpt,
  author: record.author,
  minutesToRead: record.minutesToRead,
  publishedAt: (record.publishedAt ?? new Date()).toISOString(),
  sections: normalizeBlogSections(record.sections),
});

const fetchPublishedBlogPosts = cache(async (): Promise<BlogPost[]> => {
  const rows = await db
    .select({
      slug: blogPostsTable.slug,
      title: blogPostsTable.title,
      excerpt: blogPostsTable.excerpt,
      author: blogPostsTable.author,
      minutesToRead: blogPostsTable.minutesToRead,
      sections: blogPostsTable.sections,
      publishedAt: blogPostsTable.publishedAt,
    })
    .from(blogPostsTable)
    .where(eq(blogPostsTable.status, "published"))
    .orderBy(desc(blogPostsTable.publishedAt));

  return rows.map(mapBlogPostRecord);
});

export const getBlogPosts = fetchPublishedBlogPosts;

export const getBlogPostBySlug = cache(async (slug: string) => {
  const rows = await db
    .select({
      slug: blogPostsTable.slug,
      title: blogPostsTable.title,
      excerpt: blogPostsTable.excerpt,
      author: blogPostsTable.author,
      minutesToRead: blogPostsTable.minutesToRead,
      sections: blogPostsTable.sections,
      publishedAt: blogPostsTable.publishedAt,
    })
    .from(blogPostsTable)
    .where(
      and(
        eq(blogPostsTable.slug, slug),
        eq(blogPostsTable.status, "published"),
      ),
    )
    .limit(1);

  const record = rows[0];
  return record ? mapBlogPostRecord(record) : null;
});
