import { notFound } from "next/navigation";

import { addFaqEntry, updateCmsPageContent } from "@/actions/admin/cms";
import { AdminModuleTemplate } from "@/components/admin-module-template";
import { buttonVariants } from "@/components/ui/button";
import { getAdminCmsPages } from "@/lib/data/admin";
import { getAdminModuleBySlug } from "@/lib/data/storefront";

const statusOptions = [
  { value: "all", label: "All statuses" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
];

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(date);

type AdminCmsPageProps = {
  params: { locale: string };
  searchParams?: Record<string, string | string[] | undefined>;
};

const AdminCmsPage = async ({ params, searchParams }: AdminCmsPageProps) => {
  const locale = params.locale ?? "en";
  const query =
    typeof searchParams?.query === "string" ? searchParams.query : "";
  const rawStatus =
    typeof searchParams?.status === "string" ? searchParams.status : "all";
  const normalizedStatus =
    rawStatus === "draft" || rawStatus === "published" ? rawStatus : "all";

  const [adminModule, pages, allPages] = await Promise.all([
    getAdminModuleBySlug("cms"),
    getAdminCmsPages({ search: query, status: normalizedStatus, limit: 50 }),
    getAdminCmsPages({ status: "all", limit: 50 }),
  ]);

  if (!adminModule) {
    notFound();
  }

  const totalBlocks = allPages.reduce((sum, page) => sum + page.blocks, 0);
  const pageCount = allPages.length;
  const lastPublishedAt = allPages.reduce<Date | null>((latest, page) => {
    if (!latest || page.lastPublishedAt > latest) {
      return page.lastPublishedAt;
    }
    return latest;
  }, null);

  return (
    <AdminModuleTemplate module={adminModule}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-white">
              Content surface area
            </h2>
            <p className="text-sm text-slate-300">
              Keep About, Contact, and FAQ copy synced with the storefront
              experience.
            </p>
          </div>
          <form
            method="get"
            className="flex flex-col gap-3 md:flex-row md:items-center"
          >
            <input
              type="text"
              name="query"
              placeholder="Search page or owner"
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
                href={`/${locale}/admin/cms`}
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
          <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4">
            <p className="text-xs text-slate-400 uppercase">Pages live</p>
            <p className="text-2xl font-semibold text-white">{pageCount}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4">
            <p className="text-xs text-slate-400 uppercase">Blocks managed</p>
            <p className="text-2xl font-semibold text-white">{totalBlocks}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4">
            <p className="text-xs text-slate-400 uppercase">Last update</p>
            <p className="text-2xl font-semibold text-white">
              {lastPublishedAt ? formatDate(lastPublishedAt) : "—"}
            </p>
          </div>
        </div>

        <section className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Page registry</h3>
            <p className="text-xs text-slate-400">
              {pages.length} result{pages.length === 1 ? "" : "s"}
            </p>
          </div>
          <div className="mt-4 overflow-x-auto">
            {pages.length === 0 ? (
              <p className="text-sm text-slate-400">
                No pages match the filters.
              </p>
            ) : (
              <table className="w-full border-collapse text-sm text-slate-200">
                <thead>
                  <tr className="border-b border-white/10 text-xs text-slate-400 uppercase">
                    <th className="py-2 pr-4 text-left">Page</th>
                    <th className="py-2 pr-4 text-left">Owner</th>
                    <th className="py-2 pr-4 text-left">Blocks</th>
                    <th className="py-2 pr-4 text-left">Status</th>
                    <th className="py-2 pr-4 text-left">Last published</th>
                    <th className="py-2 pr-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pages.map((page) => {
                    const previewPathMap = {
                      about: `/${locale}/about`,
                      contact: `/${locale}/contact`,
                      faq: `/${locale}/faq`,
                    } as const;
                    const previewPath =
                      previewPathMap[page.slug as keyof typeof previewPathMap];
                    return (
                      <tr
                        key={page.slug}
                        className="border-b border-white/5 last:border-0"
                      >
                        <td className="py-3 pr-4 align-top">
                          <p className="font-semibold text-white">
                            {page.title}
                          </p>
                          <p className="text-xs text-slate-400">
                            {page.summary}
                          </p>
                        </td>
                        <td className="py-3 pr-4 align-top text-slate-300">
                          {page.owner}
                        </td>
                        <td className="py-3 pr-4 align-top text-slate-300">
                          {page.blocks}
                        </td>
                        <td className="py-3 pr-4 align-top">
                          <span className="rounded-full bg-emerald-500/20 px-2 py-1 text-xs font-semibold text-emerald-100">
                            {page.status}
                          </span>
                        </td>
                        <td className="py-3 pr-4 align-top text-slate-300">
                          {formatDate(page.lastPublishedAt)}
                        </td>
                        <td className="py-3 pr-0 text-right align-top">
                          <div className="flex justify-end gap-2">
                            {previewPath && (
                              <a
                                href={previewPath}
                                className={buttonVariants({
                                  variant: "ghost",
                                  size: "sm",
                                  className:
                                    "border border-white/20 text-white",
                                })}
                              >
                                Preview
                              </a>
                            )}
                            <button
                              className={buttonVariants({
                                variant: "outline",
                                size: "sm",
                                className: "border-white/30 text-white",
                              })}
                            >
                              Edit blocks
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
            <h3 className="text-lg font-semibold text-white">
              Update hero copy
            </h3>
            <p className="text-sm text-slate-400">
              Push refreshed headlines live across About, Contact, or FAQ pages.
            </p>
            <form action={updateCmsPageContent} className="mt-4 space-y-3">
              <input type="hidden" name="locale" value={locale} />
              <label className="text-xs text-slate-400 uppercase">Page</label>
              <select
                name="page"
                className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white"
              >
                <option value="about">About</option>
                <option value="contact">Contact</option>
                <option value="faq">FAQ</option>
              </select>
              <label className="text-xs text-slate-400 uppercase">
                Headline
              </label>
              <input
                name="headline"
                required
                className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white"
              />
              <label className="text-xs text-slate-400 uppercase">
                Summary
              </label>
              <textarea
                name="summary"
                rows={3}
                className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white"
              />
              <button
                className={buttonVariants({
                  size: "sm",
                  className: "w-full bg-white/90 text-slate-900",
                })}
              >
                Publish update
              </button>
            </form>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
            <h3 className="text-lg font-semibold text-white">Add FAQ entry</h3>
            <p className="text-sm text-slate-400">
              Capture trending support tickets and surface them instantly.
            </p>
            <form action={addFaqEntry} className="mt-4 space-y-3">
              <input type="hidden" name="locale" value={locale} />
              <label className="text-xs text-slate-400 uppercase">
                Question
              </label>
              <input
                name="question"
                required
                className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white"
              />
              <label className="text-xs text-slate-400 uppercase">Answer</label>
              <textarea
                name="answer"
                rows={4}
                required
                className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white"
              />
              <button
                className={buttonVariants({
                  size: "sm",
                  className: "w-full bg-white/90 text-slate-900",
                })}
              >
                Save FAQ
              </button>
            </form>
          </div>
        </section>
      </div>
    </AdminModuleTemplate>
  );
};

export default AdminCmsPage;
