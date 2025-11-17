import { and, desc, eq } from "drizzle-orm";
import { unstable_noStore as noStore } from "next/cache";
import { cache } from "react";

import { formatCurrency as formatCurrencyValue } from "@/lib/formatters";
import {
  adminUsersTable,
  blogPostsTable,
  categories,
  cmsPageSections,
  cmsPagesTable,
  db,
  orderItems,
  orders,
  products,
  promoCodes,
  users,
} from "@/lib/schema";

import type { AdminModule, DashboardOverview, TimelineEvent } from "./types";

const numberFormatter = new Intl.NumberFormat("en-US");

const formatCurrency = (valueInCents: number) =>
  formatCurrencyValue(valueInCents / 100, {
    locale: "en-US",
    currency: "USD",
    maximumFractionDigits: 0,
  });

const formatNumber = (value: number) => numberFormatter.format(value);

const formatTrend = (current: number, previous: number) => {
  if (previous <= 0) {
    return current === 0 ? "0%" : "+100%";
  }
  const change = ((current - previous) / previous) * 100;
  const sign = change >= 0 ? "+" : "";
  return `${sign}${change.toFixed(1)}%`;
};

const relativeTimeFromNow = (date?: Date | null) => {
  if (!date) {
    return "just now";
  }

  const diffMs = Date.now() - date.getTime();
  const minutes = Math.max(1, Math.floor(diffMs / 60000));

  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} hr ago`;
  }

  const days = Math.floor(hours / 24);
  return `${days} d ago`;
};

type AdminModuleBlueprint = Omit<AdminModule, "metrics">;

const adminModuleBlueprints: AdminModuleBlueprint[] = [
  {
    slug: "products",
    title: "Product Management",
    description:
      "Launch new SKUs, sync inventory, and update merchandising badges in one board.",
    cta: "Open product board",
  },
  {
    slug: "categories",
    title: "Category Management",
    description:
      "Drag-and-drop categories, rename navigation labels, and define featured tiles.",
    cta: "Edit taxonomy",
  },
  {
    slug: "orders",
    title: "Order Management",
    description:
      "Monitor fulfillment, fraud checks, and shipment statuses in real time.",
    cta: "Review pipeline",
  },
  {
    slug: "customers",
    title: "Customer Management",
    description:
      "Segment VIPs, resend invites, and export lifetime value reports.",
    cta: "View segments",
  },
  {
    slug: "blog",
    title: "Blog Post Management",
    description:
      "Draft, schedule, and localize editorial stories powering the blog.",
    cta: "Manage stories",
  },
  {
    slug: "cms",
    title: "CMS Page Management",
    description: "Edit About, Contact, and FAQ blocks with instant preview.",
    cta: "Edit content",
  },
  {
    slug: "discounts",
    title: "Discount Management",
    description:
      "Spin up limited codes, tiered promotions, and endpoints for loyalty partners.",
    cta: "Create offer",
  },
  {
    slug: "admin-users",
    title: "Admin User Management",
    description: "Invite teammates, assign roles, and review security events.",
    cta: "Manage access",
  },
];

export const getAdminModules = cache(async (): Promise<AdminModule[]> => {
  noStore();

  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [
    productRows,
    categoryRows,
    orderRows,
    userRows,
    promoRows,
    blogRows,
    adminUserRows,
    cmsPages,
    faqSections,
  ] = await Promise.all([
    db
      .select({
        id: products.id,
        isFeatured: products.isFeatured,
      })
      .from(products)
      .where(eq(products.status, "active")),
    db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.isActive, true)),
    db
      .select({
        id: orders.id,
        status: orders.status,
        fulfillmentStatus: orders.fulfillmentStatus,
        paymentStatus: orders.paymentStatus,
        placedAt: orders.placedAt,
        userId: orders.userId,
      })
      .from(orders),
    db.select({ id: users.id, isActive: users.isActive }).from(users),
    db
      .select({ id: promoCodes.id, isActive: promoCodes.isActive })
      .from(promoCodes),
    db
      .select({
        id: blogPostsTable.id,
        status: blogPostsTable.status,
      })
      .from(blogPostsTable),
    db
      .select({
        id: adminUsersTable.id,
        status: adminUsersTable.status,
        mfaEnabled: adminUsersTable.mfaEnabled,
      })
      .from(adminUsersTable),
    db.select({ id: cmsPagesTable.id }).from(cmsPagesTable),
    db
      .select({ id: cmsPageSections.id })
      .from(cmsPageSections)
      .where(
        and(
          eq(cmsPageSections.sectionType, "faq"),
          eq(cmsPageSections.isActive, true),
        ),
      ),
  ]);

  const activeProducts = productRows.length;
  const featuredProducts = productRows.filter(
    (product) => product.isFeatured,
  ).length;
  const activeCategories = categoryRows.length;

  const openOrders = orderRows.filter(
    (order) =>
      order.status !== "fulfilled" &&
      order.status !== "cancelled" &&
      order.status !== "refunded",
  ).length;
  const paymentAttention = orderRows.filter(
    (order) => order.paymentStatus === "requires_action",
  ).length;

  const activeCustomers = userRows.filter((user) => user.isActive).length;
  const activeCustomers24h = new Set(
    orderRows
      .filter((order) => order.placedAt && order.placedAt >= dayAgo)
      .map((order) => order.userId)
      .filter((value): value is string => Boolean(value)),
  ).size;

  const activeAdmins = adminUserRows.filter(
    (user) => user.status === "active",
  ).length;
  const pendingAdmins = adminUserRows.filter(
    (user) => user.status === "pending",
  ).length;

  const activePromos = promoRows.filter((promo) => promo.isActive).length;
  const archivedPromos = Math.max(promoRows.length - activePromos, 0);
  const publishedPosts = blogRows.filter(
    (post) => post.status === "published",
  ).length;
  const scheduledPosts = blogRows.filter(
    (post) => post.status === "scheduled",
  ).length;

  const metricsBySlug: Record<string, string[]> = {
    products: [`${activeProducts} live styles`, `${featuredProducts} featured`],
    categories: [
      `${activeCategories} live categories`,
      `${Math.max(activeCategories - 3, 0)} curated tiles`,
    ],
    orders: [`${openOrders} open orders`, `${paymentAttention} need review`],
    customers: [
      `${activeCustomers} profiles`,
      `${activeCustomers24h} active today`,
    ],
    blog: [
      `${publishedPosts} published stories`,
      `${scheduledPosts} scheduled`,
    ],
    cms: [`${cmsPages.length} live pages`, `${faqSections.length} FAQ entries`],
    discounts: [`${activePromos} active promos`, `${archivedPromos} archived`],
    "admin-users": [
      `${activeAdmins} active admins`,
      `${pendingAdmins} pending`,
    ],
  };

  return adminModuleBlueprints.map((module) => ({
    ...module,
    metrics: metricsBySlug[module.slug] ?? [],
  }));
});

export const getAdminModuleBySlug = cache(async (slug: string) => {
  const modules = await getAdminModules();
  return modules.find((module) => module.slug === slug) ?? null;
});

export const getDashboardOverview = cache(
  async (): Promise<DashboardOverview> => {
    noStore();
    const now = Date.now();
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    const sevenDaysAgo = new Date(now - sevenDaysMs);
    const fourteenDaysAgo = new Date(now - sevenDaysMs * 2);

    const [orderRows, promoRows] = await Promise.all([
      db
        .select({
          orderNumber: orders.orderNumber,
          total: orders.total,
          status: orders.status,
          paymentStatus: orders.paymentStatus,
          fulfillmentStatus: orders.fulfillmentStatus,
          placedAt: orders.placedAt,
          userId: orders.userId,
        })
        .from(orders)
        .orderBy(desc(orders.placedAt)),
      db
        .select({ id: promoCodes.id, isActive: promoCodes.isActive })
        .from(promoCodes),
    ]);

    const succeededOrders = orderRows.filter(
      (order) => order.paymentStatus === "succeeded",
    );
    const revenue7d = succeededOrders
      .filter((order) => order.placedAt && order.placedAt >= sevenDaysAgo)
      .reduce((sum, order) => sum + order.total, 0);
    const revenuePrev7d = succeededOrders
      .filter(
        (order) =>
          order.placedAt &&
          order.placedAt < sevenDaysAgo &&
          order.placedAt >= fourteenDaysAgo,
      )
      .reduce((sum, order) => sum + order.total, 0);

    const orderCount = orderRows.length;
    const openOrders = orderRows.filter(
      (order) =>
        order.status !== "fulfilled" &&
        order.status !== "cancelled" &&
        order.status !== "refunded",
    ).length;
    const paymentAttention = orderRows.filter(
      (order) => order.paymentStatus === "requires_action",
    ).length;

    const userOrderCounts = new Map<string, number>();
    orderRows.forEach((order) => {
      if (!order.userId) return;
      userOrderCounts.set(
        order.userId,
        (userOrderCounts.get(order.userId) ?? 0) + 1,
      );
    });
    const returningUsers = Array.from(userOrderCounts.values()).filter(
      (count) => count > 1,
    ).length;
    const totalCustomers = userOrderCounts.size;
    const returningPercent =
      totalCustomers === 0
        ? 0
        : Math.round((returningUsers / totalCustomers) * 100);

    const activePromos = promoRows.filter((promo) => promo.isActive).length;

    const highlights = [
      orderRows[0]
        ? `Order ${orderRows[0].orderNumber} is ${orderRows[0].fulfillmentStatus}`
        : "No orders yet",
      paymentAttention > 0
        ? `${paymentAttention} payments need review`
        : "All payments clear",
      activePromos > 0
        ? `${activePromos} promos live now`
        : "No live promotions",
    ];

    return {
      stats: [
        {
          label: "Revenue (7d)",
          value: formatCurrency(revenue7d),
          trend: formatTrend(revenue7d, revenuePrev7d),
        },
        {
          label: "Orders",
          value: formatNumber(orderCount),
          trend: `${openOrders} open`,
        },
        {
          label: "Returning Customers",
          value: `${returningPercent}%`,
          trend: `${returningUsers} repeat shoppers`,
        },
      ],
      highlights,
    } satisfies DashboardOverview;
  },
);

export const getDashboardTimeline = cache(
  async (): Promise<TimelineEvent[]> => {
    noStore();
    const rows = await db
      .select({
        orderNumber: orders.orderNumber,
        fulfillmentStatus: orders.fulfillmentStatus,
        placedAt: orders.placedAt,
        paymentStatus: orders.paymentStatus,
        total: orders.total,
        itemName: orderItems.name,
      })
      .from(orders)
      .leftJoin(orderItems, eq(orderItems.orderId, orders.id))
      .orderBy(desc(orders.placedAt))
      .limit(10);

    const deduped = new Map<string, (typeof rows)[number]>();
    rows.forEach((row) => {
      if (!deduped.has(row.orderNumber)) {
        deduped.set(row.orderNumber, row);
      }
    });

    return Array.from(deduped.values())
      .slice(0, 5)
      .map((row) => ({
        title: `Order #${row.orderNumber}`,
        detail: row.itemName
          ? `${row.itemName} · ${formatCurrency(row.total)}`
          : `${row.fulfillmentStatus} · ${formatCurrency(row.total)}`,
        timestamp: relativeTimeFromNow(row.placedAt),
      }));
  },
);
