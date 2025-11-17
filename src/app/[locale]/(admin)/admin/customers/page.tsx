import { notFound } from "next/navigation";

import {
  resendCustomerActivationEmail,
  updateCustomerStatus,
} from "@/actions/admin/customers";
import { AdminModuleTemplate } from "@/components/admin-module-template";
import { buttonVariants } from "@/components/ui/button";
import { getAdminCustomers } from "@/lib/data/admin";
import { getAdminModuleBySlug } from "@/lib/data/storefront/index";
import {
  formatCurrency,
  formatDate as formatDateValue,
} from "@/lib/formatters";

const statusOptions = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const formatMoney = (amountInCents: number) =>
  formatCurrency(amountInCents / 100, {
    locale: "en-US",
    currency: "MYR",
    maximumFractionDigits: 2,
  });

const formatDate = (date?: Date | null) => {
  if (!date) return "—";
  return formatDateValue(date, {
    locale: "en",
    dateStyle: "medium",
    timeStyle: "short",
  });
};

type AdminCustomersPageProps = {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const AdminCustomersPage = async ({
  params,
  searchParams,
}: AdminCustomersPageProps) => {
  const { locale } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const query =
    typeof resolvedSearchParams.query === "string"
      ? resolvedSearchParams.query
      : "";
  const status =
    typeof resolvedSearchParams.status === "string"
      ? resolvedSearchParams.status
      : "all";

  const normalizeStatusFilter = (value: string) =>
    value === "active" || value === "inactive" ? value : undefined;

  const [adminModule, customers] = await Promise.all([
    getAdminModuleBySlug("customers"),
    getAdminCustomers({
      search: query,
      status: status === "all" ? "all" : normalizeStatusFilter(status),
      limit: 100,
    }),
  ]);

  if (!adminModule) {
    notFound();
  }

  const metrics = customers.reduce(
    (acc, customer) => {
      acc.total += 1;
      if (customer.isActive) {
        acc.active += 1;
      } else {
        acc.inactive += 1;
      }
      acc.orders += customer.orderCount;
      acc.value += customer.totalSpent;
      if (customer.lastOrderAt) {
        acc.recentLastOrder = Math.max(
          acc.recentLastOrder,
          customer.lastOrderAt.getTime(),
        );
      }
      return acc;
    },
    {
      total: 0,
      active: 0,
      inactive: 0,
      orders: 0,
      value: 0,
      recentLastOrder: 0,
    },
  );

  return (
    <AdminModuleTemplate module={adminModule}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-white">
              Customer intelligence
            </h2>
            <p className="text-sm text-slate-300">
              Spot your most valuable shoppers and keep their accounts healthy.
            </p>
          </div>
          <form
            method="get"
            className="flex flex-col gap-3 md:flex-row md:items-center"
          >
            <input
              type="text"
              name="query"
              placeholder="Search name or email"
              defaultValue={query}
              className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-2 text-sm text-white placeholder:text-slate-500"
            />
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
                href={`/${locale}/admin/customers`}
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
            <p className="text-xs text-slate-400 uppercase">Total customers</p>
            <p className="text-2xl font-semibold text-white">{metrics.total}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4">
            <p className="text-xs text-slate-400 uppercase">Active</p>
            <p className="text-2xl font-semibold text-green-300">
              {metrics.active}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4">
            <p className="text-xs text-slate-400 uppercase">Orders placed</p>
            <p className="text-2xl font-semibold text-white">
              {metrics.orders}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4">
            <p className="text-xs text-slate-400 uppercase">Lifetime value</p>
            <p className="text-2xl font-semibold text-white">
              {formatMoney(metrics.value)}
            </p>
          </div>
        </div>

        <section className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Customer list</h3>
            <p className="text-xs text-slate-400">
              {customers.length} result{customers.length === 1 ? "" : "s"}
            </p>
          </div>
          <div className="mt-4 overflow-x-auto">
            {customers.length === 0 ? (
              <p className="text-sm text-slate-400">
                No customers match the filters.
              </p>
            ) : (
              <table className="w-full border-collapse text-sm text-slate-200">
                <thead>
                  <tr className="border-b border-white/10 text-xs text-slate-400 uppercase">
                    <th className="py-2 pr-4 text-left">Customer</th>
                    <th className="py-2 pr-4 text-left">Email</th>
                    <th className="py-2 pr-4 text-left">Status</th>
                    <th className="py-2 pr-4 text-left">Orders</th>
                    <th className="py-2 pr-4 text-left">Lifetime value</th>
                    <th className="py-2 pr-4 text-left">Activation</th>
                    <th className="py-2 pr-4 text-left">Last order</th>
                    <th className="py-2 pr-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => {
                    const targetStatus = customer.isActive ? "false" : "true";
                    return (
                      <tr
                        key={customer.id}
                        className="border-b border-white/5 last:border-0"
                      >
                        <td className="py-3 pr-4 align-top">
                          <p className="font-semibold text-white">
                            {customer.name ?? "Unknown"}
                          </p>
                          <p className="text-xs text-slate-400">
                            {customer.emailVerified
                              ? `Verified ${formatDate(customer.emailVerified)}`
                              : "Unverified"}
                          </p>
                        </td>
                        <td className="py-3 pr-4 align-top text-slate-300">
                          {customer.email ?? "—"}
                        </td>
                        <td className="py-3 pr-4 align-top">
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-medium ${customer.isActive ? "bg-emerald-500/20 text-emerald-200" : "bg-amber-500/20 text-amber-200"}`}
                          >
                            {customer.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="py-3 pr-4 align-top text-slate-200">
                          <p className="font-semibold">{customer.orderCount}</p>
                          <p className="text-xs text-slate-400">orders</p>
                        </td>
                        <td className="py-3 pr-4 align-top text-slate-200">
                          {formatMoney(customer.totalSpent)}
                        </td>
                        <td className="py-3 pr-4 align-top text-slate-200">
                          <p className="font-semibold">
                            {customer.activation.emailsSent > 0
                              ? `${customer.activation.emailsSent} send${customer.activation.emailsSent === 1 ? "" : "s"}`
                              : "No outreach"}
                          </p>
                          <p className="text-xs text-slate-400">
                            {customer.activation.lastEmailAt
                              ? `Last email ${formatDate(customer.activation.lastEmailAt)}`
                              : "Awaiting first invite"}
                          </p>
                          {customer.activation.completedAt && (
                            <p className="text-xs text-emerald-300">
                              Completed{" "}
                              {formatDate(customer.activation.completedAt)}
                            </p>
                          )}
                        </td>
                        <td className="py-3 pr-4 align-top text-slate-300">
                          {formatDate(customer.lastOrderAt)}
                        </td>
                        <td className="py-3 pr-0 text-right align-top">
                          <form
                            action={updateCustomerStatus}
                            className="space-y-2"
                          >
                            <input type="hidden" name="locale" value={locale} />
                            <input
                              type="hidden"
                              name="customerId"
                              value={customer.id}
                            />
                            <input
                              type="hidden"
                              name="isActive"
                              value={targetStatus}
                            />
                            <input
                              type="hidden"
                              name="reason"
                              value="Admin dashboard toggle"
                            />
                            <button
                              className={buttonVariants({
                                variant: customer.isActive
                                  ? "outline"
                                  : "default",
                                size: "sm",
                                className: customer.isActive
                                  ? "w-full border-white/30 text-white"
                                  : "w-full bg-white/90 text-slate-900",
                              })}
                            >
                              {customer.isActive ? "Deactivate" : "Activate"}
                            </button>
                          </form>
                          {!customer.isActive && (
                            <form
                              action={resendCustomerActivationEmail}
                              className="space-y-2"
                            >
                              <input
                                type="hidden"
                                name="locale"
                                value={locale}
                              />
                              <input
                                type="hidden"
                                name="customerId"
                                value={customer.id}
                              />
                              <button
                                className={buttonVariants({
                                  variant: "ghost",
                                  size: "sm",
                                  className:
                                    "w-full border border-white/20 text-white",
                                })}
                              >
                                Resend activation
                              </button>
                            </form>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>
    </AdminModuleTemplate>
  );
};

export default AdminCustomersPage;
