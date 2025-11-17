import { notFound } from "next/navigation";

import { saveBlogWorkflow } from "@/actions/admin/blog";
import { AdminModuleTemplate } from "@/components/admin-module-template";
import { buttonVariants } from "@/components/ui/button";
import { getAdminBlogPosts } from "@/lib/data/admin";
import { getAdminModuleBySlug } from "@/lib/data/storefront";

const statusOptions = [
  { value: "all", label: "All statuses" },
  { value: "draft", label: "Draft" },
  { value: "scheduled", label: "Scheduled" },
  { value: "published", label: "Published" },
];

const statusFilterValues = ["all", "draft", "scheduled", "published"] as const;
type StatusFilter = (typeof statusFilterValues)[number];
const isStatusFilter = (value: string): value is StatusFilter =>
  statusFilterValues.includes(value as StatusFilter);

const statusBadgeStyles: Record<string, string> = {
  draft: "bg-amber-500/20 text-amber-200",
  scheduled: "bg-sky-500/20 text-sky-200",
  published: "bg-emerald-500/20 text-emerald-100",
};

const formatDate = (
  date?: Date | null,
  opts: Intl.DateTimeFormatOptions = {},
) => {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: opts.timeStyle ?? undefined,
  }).format(date);
};

type AdminBlogPageProps = {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const AdminBlogPage = async ({ params, searchParams }: AdminBlogPageProps) => {
  const { locale } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const query =
    typeof resolvedSearchParams.query === "string"
      ? resolvedSearchParams.query
      : "";
  const rawStatus =
    typeof resolvedSearchParams.status === "string"
      ? resolvedSearchParams.status
      : "all";
  const normalizedStatus: StatusFilter = isStatusFilter(rawStatus)
    ? rawStatus
    : "all";

  const [adminModule, posts, allPosts] = await Promise.all([
    getAdminModuleBySlug("blog"),
    getAdminBlogPosts({ search: query, status: normalizedStatus, limit: 100 }),
    getAdminBlogPosts({ status: "all", limit: 100 }),
  ]);

  if (!adminModule) {
    notFound();
  }

  const statusTally = allPosts.reduce(
    (acc, post) => {
      acc[post.status] = (acc[post.status] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <AdminModuleTemplate module={adminModule}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-white">
              Editorial calendar
            </h2>
            <p className="text-sm text-slate-300">
              Draft, schedule, and publish blog stories with full visibility.
            </p>
          </div>
          <form
            method="get"
            className="flex flex-col gap-3 md:flex-row md:items-center"
          >
            <input
              type="text"
              name="query"
              placeholder="Search title or author"
              defaultValue={query}
              className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-2 text-sm text-white placeholder:text-slate-500"
            />
            <select
              name="status"
              defaultValue={rawStatus}
              className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <button
                type="submit"
                className={buttonVariants({
                  size: "sm",
                  className: "bg-white/90 text-slate-900",
                })}
              >
                Apply filters
              </button>
              <a
                href={`/${locale}/admin/blog`}
                className={buttonVariants({
                  variant: "ghost",
                  size: "sm",
                  className: "border border-white/20 text-white",
                })}
              >
                Reset
              </a>
            </div>
          </form>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {(["published", "scheduled", "draft"] as const).map((key) => (
            <div
              key={key}
              className="rounded-2xl border border-white/10 bg-slate-900/40 p-4"
            >
              <p className="text-xs text-slate-400 uppercase">{key}</p>
              <p className="text-2xl font-semibold text-white">
                {statusTally[key] ?? 0}
              </p>
            </div>
          ))}
        </div>

        <section className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">
              Editorial queue
            </h3>
            <p className="text-xs text-slate-400">
              {posts.length} result{posts.length === 1 ? "" : "s"}
            </p>
          </div>
          <div className="mt-4 overflow-x-auto">
            {posts.length === 0 ? (
              <p className="text-sm text-slate-400">
                No stories match the filters.
              </p>
            ) : (
              <table className="w-full border-collapse text-sm text-slate-200">
                <thead>
                  <tr className="border-b border-white/10 text-xs text-slate-400 uppercase">
                    <th className="py-2 pr-4 text-left">Story</th>
                    <th className="py-2 pr-4 text-left">Status</th>
                    <th className="py-2 pr-4 text-left">Timeline</th>
                    <th className="py-2 pr-4 text-left">Author</th>
                    <th className="py-2 pr-4 text-left">Read time</th>
                    <th className="py-2 pr-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map((post) => (
                    <tr
                      key={post.slug}
                      className="border-b border-white/5 last:border-0"
                    >
                      <td className="py-3 pr-4 align-top">
                        <p className="font-semibold text-white">{post.title}</p>
                        <p className="text-xs text-slate-400">{post.excerpt}</p>
                      </td>
                      <td className="py-3 pr-4 align-top">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-semibold ${statusBadgeStyles[post.status]}`}
                        >
                          {post.status}
                        </span>
                      </td>
                      <td className="space-y-1 py-3 pr-4 align-top text-xs text-slate-300">
                        <p>
                          {post.status === "scheduled"
                            ? `Publishes ${formatDate(post.scheduledAt)}`
                            : `Published ${formatDate(post.publishedAt)}`}
                        </p>
                        <p>Edited {formatDate(post.lastEditedAt)}</p>
                      </td>
                      <td className="py-3 pr-4 align-top text-slate-300">
                        {post.author}
                      </td>
                      <td className="py-3 pr-4 align-top text-slate-300">
                        {post.minutesToRead} min
                      </td>
                      <td className="py-3 pr-0 text-right align-top">
                        <div className="flex justify-end gap-2">
                          <a
                            href={`/${locale}/blog/${post.slug}`}
                            className={buttonVariants({
                              variant: "ghost",
                              size: "sm",
                              className: "border border-white/20 text-white",
                            })}
                          >
                            Preview
                          </a>
                          <button
                            className={buttonVariants({
                              variant: "outline",
                              size: "sm",
                              className: "border-white/30 text-white",
                            })}
                          >
                            Edit brief
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
            <h3 className="text-lg font-semibold text-white">
              Schedule a story
            </h3>
            <p className="text-sm text-slate-400">
              Save a draft or schedule a publish date. Content syncs to the blog
              once approved.
            </p>
            <form action={saveBlogWorkflow} className="mt-4 space-y-3">
              <input type="hidden" name="locale" value={locale} />
              <label className="text-xs text-slate-400 uppercase">Title</label>
              <input
                name="title"
                required
                className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white"
              />
              <label className="text-xs text-slate-400 uppercase">Slug</label>
              <input
                name="slug"
                required
                className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white"
              />
              <label className="text-xs text-slate-400 uppercase">Status</label>
              <select
                name="status"
                className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white"
              >
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="published">Publish now</option>
              </select>
              <label className="text-xs text-slate-400 uppercase">
                Scheduled publish date
              </label>
              <input
                type="date"
                name="scheduledAt"
                className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white"
              />
              <label className="text-xs text-slate-400 uppercase">
                Excerpt
              </label>
              <textarea
                name="excerpt"
                rows={3}
                className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white"
              />
              <button
                className={buttonVariants({
                  size: "sm",
                  className: "w-full bg-white/90 text-slate-900",
                })}
              >
                Save workflow
              </button>
            </form>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
            <h3 className="text-lg font-semibold text-white">
              Editorial guardrails
            </h3>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-slate-300">
              <li>
                Ensure every scheduled story has product links within sections.
              </li>
              <li>
                Pair each post with localized hero imagery before publishing.
              </li>
              <li>Double-check tone & voice guidelines in the brand manual.</li>
            </ul>
            <p className="mt-4 text-xs text-slate-400">
              Need a copy review? Tag @editorial before moving items to
              scheduled.
            </p>
          </div>
        </section>
      </div>
    </AdminModuleTemplate>
  );
};

export default AdminBlogPage;
