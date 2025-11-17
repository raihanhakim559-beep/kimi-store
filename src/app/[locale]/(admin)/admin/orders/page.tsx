import { notFound } from "next/navigation";

import { updateOrderWorkflow } from "@/actions/admin/orders";
import { AdminModuleTemplate } from "@/components/admin-module-template";
import { buttonVariants } from "@/components/ui/button";
import { getAdminOrders } from "@/lib/data/admin";
import { getAdminModuleBySlug } from "@/lib/data/storefront";

const ORDER_STATUS_VALUES = [
  "pending",
  "paid",
  "fulfilled",
  "cancelled",
  "refunded",
] as const;

const PAYMENT_STATUS_VALUES = [
  "pending",
  "requires_action",
  "succeeded",
  "refunded",
  "failed",
] as const;

const FULFILLMENT_STATUS_VALUES = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;

const orderStatusOptions = [
  { value: "all", label: "All order statuses" },
  ...ORDER_STATUS_VALUES.map((value) => ({
    value,
    label: value.replace("_", " "),
  })),
];

const paymentStatusOptions = [
  { value: "all", label: "All payment statuses" },
  ...PAYMENT_STATUS_VALUES.map((value) => ({
    value,
    label: value.replace("_", " "),
  })),
];

const fulfillmentStatusOptions = [
  { value: "all", label: "All fulfillment statuses" },
  ...FULFILLMENT_STATUS_VALUES.map((value) => ({
    value,
    label: value.replace("_", " "),
  })),
];

const formatMoney = (amountInCents: number, currency: string) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amountInCents / 100);

const formatDate = (date?: Date | null) => {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

type AdminOrdersPageProps = {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const AdminOrdersPage = async ({
  params,
  searchParams,
}: AdminOrdersPageProps) => {
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
  const paymentStatus =
    typeof resolvedSearchParams.paymentStatus === "string"
      ? resolvedSearchParams.paymentStatus
      : "all";
  const fulfillmentStatus =
    typeof resolvedSearchParams.fulfillmentStatus === "string"
      ? resolvedSearchParams.fulfillmentStatus
      : "all";

  const normalizeFilter = <T extends string>(
    value: string,
    allowed: readonly T[],
  ): T | undefined => (allowed.includes(value as T) ? (value as T) : undefined);

  const [adminModule, orders] = await Promise.all([
    getAdminModuleBySlug("orders"),
    getAdminOrders({
      search: query,
      status:
        status === "all"
          ? undefined
          : normalizeFilter(status, ORDER_STATUS_VALUES),
      paymentStatus:
        paymentStatus === "all"
          ? undefined
          : normalizeFilter(paymentStatus, PAYMENT_STATUS_VALUES),
      fulfillmentStatus:
        fulfillmentStatus === "all"
          ? undefined
          : normalizeFilter(fulfillmentStatus, FULFILLMENT_STATUS_VALUES),
      limit: 100,
    }),
  ]);

  if (!adminModule) {
    notFound();
  }

  const metrics = orders.reduce(
    (acc, order) => {
      acc.totalOrders += 1;
      acc.gross += order.total;
      if (order.status === "pending" || order.status === "paid") {
        acc.openOrders += 1;
      }
      if (
        order.fulfillmentStatus === "processing" ||
        order.fulfillmentStatus === "pending"
      ) {
        acc.queue += 1;
      }
      return acc;
    },
    { totalOrders: 0, gross: 0, openOrders: 0, queue: 0 },
  );

  return (
    <AdminModuleTemplate module={adminModule}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-white">
              Orders at a glance
            </h2>
            <p className="text-sm text-slate-300">
              Track revenue, payment state, and fulfillment workflows in
              real-time.
            </p>
          </div>
          <form
            method="get"
            className="flex flex-col gap-3 md:flex-row md:items-center"
          >
            <input
              type="text"
              name="query"
              placeholder="Search by order # or email"
              defaultValue={query}
              className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-4 py-2 text-sm text-white placeholder:text-slate-500"
            />
            <select
              name="status"
              defaultValue={status}
              className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white"
            >
              {orderStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select
              name="paymentStatus"
              defaultValue={paymentStatus}
              className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white"
            >
              {paymentStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select
              name="fulfillmentStatus"
              defaultValue={fulfillmentStatus}
              className="w-full rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white"
            >
              {fulfillmentStatusOptions.map((option) => (
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
                href={`/${locale}/admin/orders`}
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
            <p className="text-xs text-slate-400 uppercase">Gross revenue</p>
            <p className="text-2xl font-semibold text-white">
              {orders.length > 0
                ? formatMoney(metrics.gross, orders[0]!.currency)
                : "$0.00"}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4">
            <p className="text-xs text-slate-400 uppercase">Total orders</p>
            <p className="text-2xl font-semibold text-white">
              {metrics.totalOrders}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4">
            <p className="text-xs text-slate-400 uppercase">Open payments</p>
            <p className="text-2xl font-semibold text-white">
              {metrics.openOrders}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4">
            <p className="text-xs text-slate-400 uppercase">
              Fulfillment queue
            </p>
            <p className="text-2xl font-semibold text-white">{metrics.queue}</p>
          </div>
        </div>
        <section className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Order log</h3>
            <p className="text-xs text-slate-400">
              {orders.length} result{orders.length === 1 ? "" : "s"}
            </p>
          </div>
          <div className="mt-4 overflow-x-auto">
            {orders.length === 0 ? (
              <p className="text-sm text-slate-400">
                No orders match the filters.
              </p>
            ) : (
              <table className="w-full border-collapse text-sm text-slate-200">
                <thead>
                  <tr className="border-b border-white/10 text-xs text-slate-400 uppercase">
                    <th className="py-2 pr-4 text-left">Order</th>
                    <th className="py-2 pr-4 text-left">Customer</th>
                    <th className="py-2 pr-4 text-left">Totals</th>
                    <th className="py-2 pr-4 text-left">Statuses</th>
                    <th className="py-2 pr-4 text-left">Placed</th>
                    <th className="py-2 pr-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-white/5 last:border-0"
                    >
                      <td className="py-3 pr-4 align-top">
                        <div>
                          <p className="font-semibold text-white">
                            #{order.orderNumber}
                          </p>
                          <p className="text-xs text-slate-400">
                            {order.itemCount} item
                            {order.itemCount === 1 ? "" : "s"}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 pr-4 align-top">
                        <p className="font-medium text-white">
                          {order.customerName ?? "Guest"}
                        </p>
                        <p className="text-xs text-slate-400">
                          {order.customerEmail ?? "—"}
                        </p>
                      </td>
                      <td className="py-3 pr-4 align-top text-slate-200">
                        <p>{formatMoney(order.total, order.currency)}</p>
                        <p className="text-xs text-slate-400">
                          Subtotal {formatMoney(order.subtotal, order.currency)}
                        </p>
                        <p className="text-xs text-slate-400">
                          Shipping{" "}
                          {formatMoney(order.shippingTotal, order.currency)}
                        </p>
                      </td>
                      <td className="space-y-1 py-3 pr-4 align-top text-xs text-slate-300 uppercase">
                        <p>Order: {order.status}</p>
                        <p>Payment: {order.paymentStatus}</p>
                        <p>Fulfillment: {order.fulfillmentStatus}</p>
                      </td>
                      <td className="py-3 pr-4 align-top text-slate-300">
                        <p>{formatDate(order.placedAt ?? order.updatedAt)}</p>
                      </td>
                      <td className="py-3 pr-0 text-right align-top">
                        <form
                          action={updateOrderWorkflow}
                          className="space-y-2 text-xs"
                        >
                          <input type="hidden" name="locale" value={locale} />
                          <input
                            type="hidden"
                            name="orderId"
                            value={order.id}
                          />
                          <select
                            name="status"
                            defaultValue={order.status}
                            className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-2 py-1 text-xs text-white"
                          >
                            {orderStatusOptions
                              .filter((option) => option.value !== "all")
                              .map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                          </select>
                          <select
                            name="paymentStatus"
                            defaultValue={order.paymentStatus}
                            className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-2 py-1 text-xs text-white"
                          >
                            {paymentStatusOptions
                              .filter((option) => option.value !== "all")
                              .map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                          </select>
                          <select
                            name="fulfillmentStatus"
                            defaultValue={order.fulfillmentStatus}
                            className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-2 py-1 text-xs text-white"
                          >
                            {fulfillmentStatusOptions
                              .filter((option) => option.value !== "all")
                              .map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                          </select>
                          <textarea
                            name="notes"
                            placeholder="Internal note"
                            className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-2 py-1 text-xs text-white"
                            defaultValue=""
                          />
                          <button
                            className={buttonVariants({
                              variant: "outline",
                              size: "sm",
                              className: "w-full border-white/30 text-white",
                            })}
                          >
                            Update order
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
      </div>
    </AdminModuleTemplate>
  );
};

export default AdminOrdersPage;
