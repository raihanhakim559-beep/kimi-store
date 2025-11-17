import { notFound } from "next/navigation";

import {
  createAdminProduct,
  updateProductStatus,
} from "@/actions/admin/products";
import { AdminModuleTemplate } from "@/components/admin-module-template";
import { buttonVariants } from "@/components/ui/button";
import { getAdminCategories, getAdminProducts } from "@/lib/data/admin";
import { getAdminModuleBySlug } from "@/lib/data/storefront/index";
import { formatCurrency } from "@/lib/formatters";

const PRODUCT_STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "draft", label: "Draft" },
  { value: "archived", label: "Archived" },
] as const;

const statusBadgeClasses: Record<string, string> = {
  active: "bg-emerald-400/20 text-emerald-200",
  draft: "bg-amber-400/20 text-amber-100",
  archived: "bg-slate-500/20 text-slate-200",
};

const formatMoney = (amountInCents: number, currency: string) =>
  formatCurrency(amountInCents / 100, {
    currency,
    maximumFractionDigits: 2,
  });

const formatRelativeTime = (date?: Date | null) => {
  if (!date) return "—";
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 60) return `${minutes || 1}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

type AdminProductsPageProps = {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const AdminProductsPage = async ({
  params,
  searchParams,
}: AdminProductsPageProps) => {
  const { locale } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const queryParam =
    typeof resolvedSearchParams.query === "string"
      ? resolvedSearchParams.query
      : "";
  const rawStatus =
    typeof resolvedSearchParams.status === "string"
      ? resolvedSearchParams.status
      : "all";
  const statusFilter = PRODUCT_STATUS_OPTIONS.find(
    (option) => option.value === rawStatus,
  )?.value;

  const [adminModule, productRows, categories] = await Promise.all([
    getAdminModuleBySlug("products"),
    getAdminProducts({
      search: queryParam,
      status:
        statusFilter && statusFilter !== "all"
          ? (statusFilter as "active" | "draft" | "archived")
          : undefined,
      limit: 50,
    }),
    getAdminCategories(),
  ]);

  if (!adminModule) {
    notFound();
  }

  const summary = productRows.reduce(
    (acc, row) => {
      acc.inventory += row.inventory;
      acc[row.status] += 1;
      return acc;
    },
    {
      inventory: 0,
      active: 0,
      draft: 0,
      archived: 0,
    },
  );

  return (
    <AdminModuleTemplate module={adminModule}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Product control center</h2>
            <p className="text-sm text-slate-300">
              Search by name or slug, filter by status, and spin up new styles
              without leaving the dashboard.
            </p>
          </div>
          <form
            className="flex flex-col gap-3 md:flex-row md:items-center"
            method="get"
          >
            <input
              type="text"
              name="query"
              placeholder="Search products"
              defaultValue={queryParam}
              className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-2 text-sm text-white placeholder:text-slate-500"
            />
            <select
              name="status"
              defaultValue={rawStatus}
              className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white"
            >
              {PRODUCT_STATUS_OPTIONS.map((option) => (
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
                href={`/${locale}/admin/products`}
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
            <p className="text-xs text-slate-400 uppercase">Active styles</p>
            <p className="text-2xl font-semibold text-white">
              {summary.active}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4">
            <p className="text-xs text-slate-400 uppercase">Draft queue</p>
            <p className="text-2xl font-semibold text-white">{summary.draft}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4">
            <p className="text-xs text-slate-400 uppercase">Total units</p>
            <p className="text-2xl font-semibold text-white">
              {summary.inventory}
            </p>
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <section className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Catalog overview
                </h3>
                <p className="text-xs text-slate-400">
                  {productRows.length} result
                  {productRows.length === 1 ? "" : "s"}
                </p>
              </div>
            </div>
            <div className="mt-4 overflow-x-auto">
              {productRows.length === 0 ? (
                <p className="text-sm text-slate-400">
                  No products found. Try another search or reset filters.
                </p>
              ) : (
                <table className="w-full border-collapse text-sm text-slate-200">
                  <thead>
                    <tr className="border-b border-white/10 text-xs text-slate-400 uppercase">
                      <th className="py-2 pr-4 text-left">Product</th>
                      <th className="py-2 pr-4 text-left">Category</th>
                      <th className="py-2 pr-4 text-left">Status</th>
                      <th className="py-2 pr-4 text-right">Price</th>
                      <th className="py-2 pr-4 text-right">Inventory</th>
                      <th className="py-2 pr-4 text-right">Updated</th>
                      <th className="py-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productRows.map((product) => (
                      <tr
                        key={product.id}
                        className="border-b border-white/5 last:border-0"
                      >
                        <td className="py-3 pr-4 align-top">
                          <div>
                            <p className="font-semibold text-white">
                              {product.name}
                            </p>
                            <p className="text-xs text-slate-400">
                              /{product.slug}
                            </p>
                          </div>
                        </td>
                        <td className="py-3 pr-4 align-top text-slate-300">
                          {product.categoryName ?? "—"}
                        </td>
                        <td className="py-3 pr-4 align-top">
                          <span
                            className={`rounded-full px-2 py-1 text-xs ${statusBadgeClasses[product.status]}`}
                          >
                            {product.status}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-right align-top">
                          {formatMoney(product.price, product.currency)}
                        </td>
                        <td className="py-3 pr-4 text-right align-top">
                          {product.inventory} units
                        </td>
                        <td className="py-3 pr-4 text-right align-top text-slate-300">
                          {formatRelativeTime(product.updatedAt)}
                        </td>
                        <td className="py-3 text-right align-top">
                          <form
                            action={updateProductStatus}
                            className="flex flex-col items-end gap-2 text-xs"
                          >
                            <input type="hidden" name="locale" value={locale} />
                            <input
                              type="hidden"
                              name="productId"
                              value={product.id}
                            />
                            <select
                              name="status"
                              defaultValue={product.status}
                              className="rounded-lg border border-white/10 bg-slate-900/50 px-2 py-1 text-xs text-white"
                            >
                              {PRODUCT_STATUS_OPTIONS.filter(
                                (option) => option.value !== "all",
                              ).map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                            <button
                              className={buttonVariants({
                                variant: "outline",
                                size: "sm",
                                className: "border-white/30 text-white",
                              })}
                            >
                              Update
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
            <h3 className="text-lg font-semibold text-white">Quick add</h3>
            <p className="text-sm text-slate-400">
              Launch a draft product with baseline pricing, then enrich content
              later.
            </p>
            <form action={createAdminProduct} className="mt-4 space-y-3">
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
                Category
                <select
                  name="categoryId"
                  required
                  className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white"
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>
              <div className="grid gap-3 md:grid-cols-2">
                <label className="text-xs text-slate-400 uppercase">
                  Price
                  <input
                    type="number"
                    name="price"
                    min="0"
                    step="0.01"
                    required
                    className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white"
                  />
                </label>
                <label className="text-xs text-slate-400 uppercase">
                  Currency
                  <input
                    name="currency"
                    defaultValue="MYR"
                    className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white uppercase"
                  />
                </label>
              </div>
              <label className="text-xs text-slate-400 uppercase">
                Status
                <select
                  name="status"
                  defaultValue="draft"
                  className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white"
                >
                  {PRODUCT_STATUS_OPTIONS.filter(
                    (option) => option.value !== "all",
                  ).map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <button
                className={buttonVariants({
                  className: "w-full bg-white/90 text-slate-900",
                })}
              >
                Create style
              </button>
            </form>
          </aside>
        </div>
      </div>
    </AdminModuleTemplate>
  );
};

export default AdminProductsPage;
