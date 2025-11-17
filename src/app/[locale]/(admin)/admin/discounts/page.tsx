import { notFound } from "next/navigation";

import {
  createDiscount,
  toggleDiscountStatus,
} from "@/actions/admin/discounts";
import { AdminModuleTemplate } from "@/components/admin-module-template";
import { buttonVariants } from "@/components/ui/button";
import { getAdminDiscounts } from "@/lib/data/admin";
import { getAdminModuleBySlug } from "@/lib/data/storefront";

const statusOptions = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "scheduled", label: "Scheduled" },
  { value: "expired", label: "Expired" },
  { value: "inactive", label: "Inactive" },
];

const statusFilterValues = [
  "all",
  "active",
  "scheduled",
  "expired",
  "inactive",
] as const;
type StatusFilter = (typeof statusFilterValues)[number];
const isStatusFilter = (value: string): value is StatusFilter =>
  statusFilterValues.includes(value as StatusFilter);

const statusBadgeStyles: Record<string, string> = {
  active: "bg-emerald-500/20 text-emerald-100",
  scheduled: "bg-sky-500/20 text-sky-100",
  expired: "bg-rose-500/20 text-rose-100",
  inactive: "bg-slate-500/20 text-slate-200",
};

const formatDate = (date?: Date | null) => {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
  }).format(date);
};

const summarizeWindow = (start?: Date | null, end?: Date | null) => {
  if (!start && !end) return "No schedule";
  if (start && end) {
    return `${formatDate(start)} → ${formatDate(end)}`;
  }
  if (start) {
    return `Starts ${formatDate(start)}`;
  }
  return `Ends ${formatDate(end ?? null)}`;
};

type AdminDiscountsPageProps = {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const AdminDiscountsPage = async ({
  params,
  searchParams,
}: AdminDiscountsPageProps) => {
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

  const [adminModule, discounts] = await Promise.all([
    getAdminModuleBySlug("discounts"),
    getAdminDiscounts({ search: query, status: normalizedStatus, limit: 100 }),
  ]);

  if (!adminModule) {
    notFound();
  }

  const metrics = discounts.reduce(
    (acc, discount) => {
      acc.total += 1;
      if (discount.status === "active") acc.active += 1;
      if (discount.status === "scheduled") acc.scheduled += 1;
      if (discount.status === "expired") acc.expired += 1;
      acc.redemptions += discount.redemptionCount;
      return acc;
    },
    { total: 0, active: 0, scheduled: 0, expired: 0, redemptions: 0 },
  );

  return (
    <AdminModuleTemplate module={adminModule}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-white">
              Promo orchestration
            </h2>
            <p className="text-sm text-slate-300">
              Launch, pause, or schedule discount codes with instant storefront
              sync.
            </p>
          </div>
          <form
            method="get"
            className="flex flex-col gap-3 md:flex-row md:items-center"
          >
            <input
              type="text"
              name="query"
              placeholder="Search code or description"
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
                href={`/${locale}/admin/discounts`}
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
            <p className="text-xs text-slate-400 uppercase">Total codes</p>
            <p className="text-2xl font-semibold text-white">{metrics.total}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4">
            <p className="text-xs text-slate-400 uppercase">Active promos</p>
            <p className="text-2xl font-semibold text-emerald-200">
              {metrics.active}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4">
            <p className="text-xs text-slate-400 uppercase">Scheduled</p>
            <p className="text-2xl font-semibold text-sky-200">
              {metrics.scheduled}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4">
            <p className="text-xs text-slate-400 uppercase">Redemptions</p>
            <p className="text-2xl font-semibold text-white">
              {metrics.redemptions}
            </p>
          </div>
        </div>

        <section className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Promo codes</h3>
            <p className="text-xs text-slate-400">
              {discounts.length} result{discounts.length === 1 ? "" : "s"}
            </p>
          </div>
          <div className="mt-4 overflow-x-auto">
            {discounts.length === 0 ? (
              <p className="text-sm text-slate-400">
                No discounts match the filters.
              </p>
            ) : (
              <table className="w-full border-collapse text-sm text-slate-200">
                <thead>
                  <tr className="border-b border-white/10 text-xs text-slate-400 uppercase">
                    <th className="py-2 pr-4 text-left">Code</th>
                    <th className="py-2 pr-4 text-left">Details</th>
                    <th className="py-2 pr-4 text-left">Window</th>
                    <th className="py-2 pr-4 text-left">Redemptions</th>
                    <th className="py-2 pr-4 text-left">Status</th>
                    <th className="py-2 pr-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {discounts.map((discount) => {
                    const targetState = discount.isActive ? "false" : "true";
                    return (
                      <tr
                        key={discount.id}
                        className="border-b border-white/5 last:border-0"
                      >
                        <td className="py-3 pr-4 align-top">
                          <p className="font-semibold text-white">
                            {discount.code}
                          </p>
                          <p className="text-xs text-slate-400">
                            {discount.valueLabel}
                          </p>
                        </td>
                        <td className="py-3 pr-4 align-top text-slate-300">
                          {discount.description ?? "—"}
                        </td>
                        <td className="py-3 pr-4 align-top text-slate-300">
                          {summarizeWindow(discount.startsAt, discount.endsAt)}
                        </td>
                        <td className="py-3 pr-4 align-top text-slate-300">
                          {discount.redemptionCount}
                          {discount.maxRedemptions
                            ? ` / ${discount.maxRedemptions}`
                            : ""}
                        </td>
                        <td className="py-3 pr-4 align-top">
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-semibold ${statusBadgeStyles[discount.status]}`}
                          >
                            {discount.status}
                          </span>
                        </td>
                        <td className="py-3 pr-0 text-right align-top">
                          <form
                            action={toggleDiscountStatus}
                            className="inline-flex"
                          >
                            <input type="hidden" name="locale" value={locale} />
                            <input
                              type="hidden"
                              name="discountId"
                              value={discount.id}
                            />
                            <input
                              type="hidden"
                              name="isActive"
                              value={targetState}
                            />
                            <button
                              className={buttonVariants({
                                variant: discount.isActive
                                  ? "outline"
                                  : "default",
                                size: "sm",
                                className: discount.isActive
                                  ? "border-white/30 text-white"
                                  : "bg-white/90 text-slate-900",
                              })}
                            >
                              {discount.isActive ? "Pause" : "Activate"}
                            </button>
                          </form>
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
              Create promo code
            </h3>
            <p className="text-sm text-slate-400">
              Define offer type, redemption caps, and go-live window.
            </p>
            <form action={createDiscount} className="mt-4 space-y-3">
              <input type="hidden" name="locale" value={locale} />
              <label className="text-xs text-slate-400 uppercase">Code</label>
              <input
                name="code"
                required
                className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm tracking-[0.2em] text-white uppercase"
              />
              <label className="text-xs text-slate-400 uppercase">
                Description
              </label>
              <textarea
                name="description"
                rows={3}
                className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white"
              />
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="text-xs text-slate-400 uppercase">
                    Type
                  </label>
                  <select
                    name="discountType"
                    className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white"
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed amount</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 uppercase">
                    Value
                  </label>
                  <input
                    name="value"
                    type="number"
                    min="1"
                    step="1"
                    required
                    className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white"
                  />
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="text-xs text-slate-400 uppercase">
                    Starts
                  </label>
                  <input
                    type="date"
                    name="startsAt"
                    className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 uppercase">
                    Ends
                  </label>
                  <input
                    type="date"
                    name="endsAt"
                    className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white"
                  />
                </div>
              </div>
              <label className="text-xs text-slate-400 uppercase">
                Max redemptions
              </label>
              <input
                name="maxRedemptions"
                type="number"
                min="1"
                className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white"
              />
              <button
                className={buttonVariants({
                  size: "sm",
                  className: "w-full bg-white/90 text-slate-900",
                })}
              >
                Save discount
              </button>
            </form>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
            <h3 className="text-lg font-semibold text-white">Playbook</h3>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-slate-300">
              <li>
                Stack promos sparingly—Stripe webhooks block overlapping
                redemptions.
              </li>
              <li>
                Use scheduled status for launch-day drops with automatic
                activation.
              </li>
              <li>
                Cap redemptions when working with creators or loyalty partners.
              </li>
            </ul>
            <p className="mt-4 text-xs text-slate-400">
              Need granular segmentation? Sync to the loyalty API or export
              codes to CSV.
            </p>
          </div>
        </section>
      </div>
    </AdminModuleTemplate>
  );
};

export default AdminDiscountsPage;
