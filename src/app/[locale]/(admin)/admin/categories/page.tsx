import { notFound } from "next/navigation";

import {
  createAdminCategory,
  updateCategoryDetails,
  updateCategoryStatus,
} from "@/actions/admin/categories";
import { AdminModuleTemplate } from "@/components/admin-module-template";
import { buttonVariants } from "@/components/ui/button";
import { getAdminCategoryRows } from "@/lib/data/admin";
import { getAdminModuleBySlug } from "@/lib/data/storefront";

const audienceOptions = [
  { value: "all", label: "All audiences" },
  { value: "men", label: "Men" },
  { value: "women", label: "Women" },
  { value: "unisex", label: "Unisex" },
];

const statusOptions = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

type AdminCategoriesPageProps = {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const AdminCategoriesPage = async ({
  params,
  searchParams,
}: AdminCategoriesPageProps) => {
  const { locale } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const query =
    typeof resolvedSearchParams.query === "string"
      ? resolvedSearchParams.query
      : "";
  const audience =
    typeof resolvedSearchParams.audience === "string"
      ? resolvedSearchParams.audience
      : "all";
  const status =
    typeof resolvedSearchParams.status === "string"
      ? resolvedSearchParams.status
      : "all";

  const [adminModule, categoryRows] = await Promise.all([
    getAdminModuleBySlug("categories"),
    getAdminCategoryRows({
      search: query,
      audience:
        audience === "all"
          ? undefined
          : (audience as "men" | "women" | "unisex"),
      status: status === "all" ? undefined : (status as "active" | "inactive"),
      limit: 100,
    }),
  ]);

  if (!adminModule) {
    notFound();
  }

  const counts = categoryRows.reduce(
    (acc, row) => {
      if (row.isActive) acc.active += 1;
      else acc.inactive += 1;
      if (row.gender === "men") acc.men += 1;
      if (row.gender === "women") acc.women += 1;
      if (row.gender === "unisex") acc.unisex += 1;
      acc.totalProducts += row.productCount;
      return acc;
    },
    { active: 0, inactive: 0, men: 0, women: 0, unisex: 0, totalProducts: 0 },
  );

  return (
    <AdminModuleTemplate module={adminModule}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-white">
              Category controls
            </h2>
            <p className="text-sm text-slate-300">
              Search, filter, and update merchandising blocks powering the
              storefront navigation.
            </p>
          </div>
          <form
            method="get"
            className="flex flex-col gap-3 md:flex-row md:items-center"
          >
            <input
              type="text"
              name="query"
              placeholder="Search categories"
              defaultValue={query}
              className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-2 text-sm text-white placeholder:text-slate-500"
            />
            <select
              name="audience"
              defaultValue={audience}
              className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white"
            >
              {audienceOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select
              name="status"
              defaultValue={status}
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
                href={`/${locale}/admin/categories`}
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
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4">
            <p className="text-xs text-slate-400 uppercase">Active</p>
            <p className="text-2xl font-semibold text-white">{counts.active}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4">
            <p className="text-xs text-slate-400 uppercase">Inactive</p>
            <p className="text-2xl font-semibold text-white">
              {counts.inactive}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4">
            <p className="text-xs text-slate-400 uppercase">Audience split</p>
            <p className="text-sm text-slate-300">
              {counts.men} men · {counts.women} women · {counts.unisex} unisex
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4">
            <p className="text-xs text-slate-400 uppercase">Styles mapped</p>
            <p className="text-2xl font-semibold text-white">
              {counts.totalProducts}
            </p>
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <section className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                Category list
              </h3>
              <p className="text-xs text-slate-400">
                {categoryRows.length} result
                {categoryRows.length === 1 ? "" : "s"}
              </p>
            </div>
            <div className="mt-4 overflow-x-auto">
              {categoryRows.length === 0 ? (
                <p className="text-sm text-slate-400">
                  No categories match the filters.
                </p>
              ) : (
                <table className="w-full border-collapse text-sm text-slate-200">
                  <thead>
                    <tr className="border-b border-white/10 text-xs text-slate-400 uppercase">
                      <th className="py-2 pr-4 text-left">Category</th>
                      <th className="py-2 pr-4 text-left">Audience</th>
                      <th className="py-2 pr-4 text-left">Products</th>
                      <th className="py-2 pr-4 text-left">Hero copy</th>
                      <th className="py-2 pr-4 text-left">Features</th>
                      <th className="py-2 pr-4 text-right">Status</th>
                      <th className="py-2 pr-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categoryRows.map((category) => (
                      <tr
                        key={category.id}
                        className="border-b border-white/5 last:border-0"
                      >
                        <td className="py-3 pr-4 align-top">
                          <div>
                            <p className="font-semibold text-white">
                              {category.name}
                              {!category.isActive && (
                                <span className="ml-2 rounded-full border border-white/30 px-2 py-0.5 text-xs text-slate-400 uppercase">
                                  Hidden
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-slate-400">
                              /{category.slug}
                            </p>
                            <p className="text-xs text-slate-400">
                              {category.description ?? "No description"}
                            </p>
                          </div>
                        </td>
                        <td className="py-3 pr-4 align-top text-slate-300 capitalize">
                          {category.gender}
                        </td>
                        <td className="py-3 pr-4 align-top text-slate-300">
                          {category.productCount}
                        </td>
                        <td className="py-3 pr-4 align-top text-slate-300">
                          {category.heroCopy ?? "—"}
                        </td>
                        <td className="py-3 pr-4 align-top text-slate-300">
                          {category.features.length > 0
                            ? category.features.join(", ")
                            : "—"}
                        </td>
                        <td className="py-3 pr-4 text-right align-top">
                          <form action={updateCategoryStatus}>
                            <input type="hidden" name="locale" value={locale} />
                            <input
                              type="hidden"
                              name="categoryId"
                              value={category.id}
                            />
                            <select
                              name="isActive"
                              defaultValue={
                                category.isActive ? "true" : "false"
                              }
                              className="rounded-lg border border-white/10 bg-slate-900/60 px-2 py-1 text-xs text-white"
                            >
                              <option value="true">Active</option>
                              <option value="false">Inactive</option>
                            </select>
                            <button
                              className={buttonVariants({
                                variant: "outline",
                                size: "sm",
                                className:
                                  "mt-2 border-white/30 text-xs text-white",
                              })}
                            >
                              Save
                            </button>
                          </form>
                        </td>
                        <td className="py-3 pr-4 text-right align-top">
                          <form
                            action={updateCategoryDetails}
                            className="space-y-2 text-xs"
                          >
                            <input type="hidden" name="locale" value={locale} />
                            <input
                              type="hidden"
                              name="categoryId"
                              value={category.id}
                            />
                            <textarea
                              name="heroCopy"
                              placeholder="Hero copy"
                              defaultValue={category.heroCopy ?? ""}
                              className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-2 py-1 text-xs text-white"
                            />
                            <textarea
                              name="features"
                              placeholder="Feature list (comma or newline)"
                              defaultValue={category.features.join(", ")}
                              className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-2 py-1 text-xs text-white"
                            />
                            <textarea
                              name="description"
                              placeholder="Description"
                              defaultValue={category.description ?? ""}
                              className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-2 py-1 text-xs text-white"
                            />
                            <button
                              className={buttonVariants({
                                variant: "secondary",
                                size: "sm",
                                className: "w-full bg-white/90 text-slate-900",
                              })}
                            >
                              Update copy
                            </button>
                          </form>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>
          <aside className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
            <h3 className="text-lg font-semibold text-white">
              Create category
            </h3>
            <p className="text-sm text-slate-400">
              Launch a new merchandising block and wire it to live products.
            </p>
            <form action={createAdminCategory} className="mt-4 space-y-3">
              <input type="hidden" name="locale" value={locale} />
              <label className="text-xs text-slate-400 uppercase">
                Name
                <input
                  name="name"
                  required
                  className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white"
                />
              </label>
              <label className="text-xs text-slate-400 uppercase">
                Slug
                <input
                  name="slug"
                  required
                  className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white"
                />
              </label>
              <label className="text-xs text-slate-400 uppercase">
                Audience
                <select
                  name="gender"
                  className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white"
                >
                  <option value="men">Men</option>
                  <option value="women">Women</option>
                  <option value="unisex">Unisex</option>
                </select>
              </label>
              <label className="text-xs text-slate-400 uppercase">
                Description
                <textarea
                  name="description"
                  className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white"
                />
              </label>
              <label className="text-xs text-slate-400 uppercase">
                Hero copy
                <textarea
                  name="heroCopy"
                  className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white"
                />
              </label>
              <label className="text-xs text-slate-400 uppercase">
                Features (comma or newline separated)
                <textarea
                  name="features"
                  className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white"
                />
              </label>
              <button
                className={buttonVariants({
                  className: "w-full bg-white/90 text-slate-900",
                })}
              >
                Create category
              </button>
            </form>
          </aside>
        </div>
      </div>
    </AdminModuleTemplate>
  );
};

export default AdminCategoriesPage;
