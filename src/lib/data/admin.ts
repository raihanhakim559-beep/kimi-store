import { and, desc, eq, ilike, or, type SQL, sql } from "drizzle-orm";

import {
  type ActivationEventSummary,
  getActivationEventsForUsers,
} from "@/lib/activation-events";
import { cmsPages } from "@/lib/data/storefront";
import {
  blogPostsTable,
  categories,
  db,
  orderItems,
  orders,
  products,
  productVariants,
  promoCodes,
  users,
} from "@/lib/schema";

type AdminProductFilters = {
  search?: string | null;
  status?: "draft" | "active" | "archived" | null;
  limit?: number;
};

export type AdminProductRow = {
  id: string;
  name: string;
  slug: string;
  status: "draft" | "active" | "archived";
  price: number;
  currency: string;
  updatedAt: Date | null;
  categoryName?: string | null;
  categorySlug?: string | null;
  inventory: number;
  variantCount: number;
};

export const getAdminProducts = async ({
  search,
  status,
  limit = 25,
}: AdminProductFilters = {}): Promise<AdminProductRow[]> => {
  const filters: SQL<unknown>[] = [];

  const trimmed = search?.trim();
  if (trimmed && trimmed.length > 0) {
    const searchExpression = or(
      ilike(products.name, `%${trimmed}%`),
      ilike(products.slug, `%${trimmed}%`),
    );
    filters.push(searchExpression!);
  }

  if (status && ["draft", "active", "archived"].includes(status)) {
    filters.push(eq(products.status, status));
  }

  const buildQuery = () =>
    db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        status: products.status,
        price: products.price,
        currency: products.currency,
        updatedAt: products.updatedAt,
        categoryName: categories.name,
        categorySlug: categories.slug,
        inventory: sql<number>`coalesce(sum(${productVariants.stock}), 0)`,
        variantCount: sql<number>`count(${productVariants.id})`,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(productVariants, eq(productVariants.productId, products.id));

  const filterExpression =
    filters.length === 0
      ? null
      : filters.length === 1
        ? filters[0]!
        : and(filters[0]!, filters[1]!, ...filters.slice(2));

  const rows = await (
    filterExpression ? buildQuery().where(filterExpression) : buildQuery()
  )
    .groupBy(products.id, categories.name, categories.slug)
    .orderBy(desc(products.updatedAt))
    .limit(limit);

  return rows.map((row) => ({
    ...row,
    inventory: Number(row.inventory ?? 0),
    variantCount: Number(row.variantCount ?? 0),
  }));
};

export const getAdminCategories = async () =>
  db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
    })
    .from(categories)
    .where(eq(categories.isActive, true))
    .orderBy(desc(categories.updatedAt));

type AdminCategoryFilters = {
  search?: string | null;
  audience?: "men" | "women" | "unisex" | null;
  status?: "active" | "inactive" | null;
  limit?: number;
};

export type AdminCategoryRow = {
  id: string;
  name: string;
  slug: string;
  gender: "men" | "women" | "unisex";
  isActive: boolean;
  description: string | null;
  heroCopy?: string;
  features: string[];
  productCount: number;
  updatedAt: Date | null;
};

type CategorySelect = typeof categories.$inferSelect;

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

const parseCategoryMetadata = (metadata: CategorySelect["metadata"]) => {
  if (!metadata || typeof metadata !== "object") {
    return { heroCopy: undefined, features: [] as string[] };
  }

  const heroCopy =
    typeof (metadata as { heroCopy?: unknown }).heroCopy === "string"
      ? ((metadata as { heroCopy?: string }).heroCopy ?? undefined)
      : undefined;
  const rawFeatures = (metadata as { features?: unknown }).features;
  const features = isStringArray(rawFeatures) ? rawFeatures : [];

  return { heroCopy, features };
};

export const getAdminCategoryRows = async ({
  search,
  audience,
  status,
  limit = 50,
}: AdminCategoryFilters = {}): Promise<AdminCategoryRow[]> => {
  const filters: SQL<unknown>[] = [];

  const trimmed = search?.trim();
  if (trimmed && trimmed.length > 0) {
    const searchExpression = or(
      ilike(categories.name, `%${trimmed}%`),
      ilike(categories.slug, `%${trimmed}%`),
    );
    filters.push(searchExpression!);
  }

  if (audience && ["men", "women", "unisex"].includes(audience)) {
    filters.push(eq(categories.gender, audience));
  }

  if (status === "active") {
    filters.push(eq(categories.isActive, true));
  } else if (status === "inactive") {
    filters.push(eq(categories.isActive, false));
  }

  const filterExpression =
    filters.length === 0
      ? null
      : filters.length === 1
        ? filters[0]!
        : and(filters[0]!, filters[1]!, ...filters.slice(2));

  const query = db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      gender: categories.gender,
      isActive: categories.isActive,
      description: categories.description,
      metadata: categories.metadata,
      updatedAt: categories.updatedAt,
      productCount: sql<number>`count(${products.id})`,
    })
    .from(categories)
    .leftJoin(products, eq(products.categoryId, categories.id))
    .groupBy(categories.id)
    .orderBy(desc(categories.updatedAt))
    .limit(limit);

  const rows = await (filterExpression ? query.where(filterExpression) : query);

  return rows.map((row) => {
    const metadata = parseCategoryMetadata(row.metadata);
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      gender: row.gender,
      isActive: row.isActive,
      description: row.description ?? null,
      heroCopy: metadata.heroCopy,
      features: metadata.features,
      productCount: Number(row.productCount ?? 0),
      updatedAt: row.updatedAt,
    };
  });
};

type AdminOrderFilters = {
  search?: string | null;
  status?: typeof orders.$inferSelect.status | "all" | null;
  paymentStatus?: typeof orders.$inferSelect.paymentStatus | "all" | null;
  fulfillmentStatus?:
    | typeof orders.$inferSelect.fulfillmentStatus
    | "all"
    | null;
  limit?: number;
};

export type AdminOrderRow = {
  id: string;
  orderNumber: string;
  customerName?: string | null;
  customerEmail?: string | null;
  status: typeof orders.$inferSelect.status;
  paymentStatus: typeof orders.$inferSelect.paymentStatus;
  fulfillmentStatus: typeof orders.$inferSelect.fulfillmentStatus;
  subtotal: number;
  shippingTotal: number;
  total: number;
  currency: string;
  itemCount: number;
  placedAt: Date | null;
  updatedAt: Date | null;
};

export const getAdminOrders = async ({
  search,
  status,
  paymentStatus,
  fulfillmentStatus,
  limit = 50,
}: AdminOrderFilters = {}): Promise<AdminOrderRow[]> => {
  const filters: SQL<unknown>[] = [];

  const trimmed = search?.trim();
  if (trimmed && trimmed.length > 0) {
    const searchExpression = or(
      ilike(orders.orderNumber, `%${trimmed}%`),
      ilike(users.email, `%${trimmed}%`),
      ilike(users.name, `%${trimmed}%`),
    );
    filters.push(searchExpression!);
  }

  if (status && status !== "all") {
    filters.push(eq(orders.status, status));
  }
  if (paymentStatus && paymentStatus !== "all") {
    filters.push(eq(orders.paymentStatus, paymentStatus));
  }
  if (fulfillmentStatus && fulfillmentStatus !== "all") {
    filters.push(eq(orders.fulfillmentStatus, fulfillmentStatus));
  }

  const filterExpression =
    filters.length === 0
      ? null
      : filters.length === 1
        ? filters[0]!
        : and(filters[0]!, filters[1]!, ...filters.slice(2));

  const query = db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      status: orders.status,
      paymentStatus: orders.paymentStatus,
      fulfillmentStatus: orders.fulfillmentStatus,
      subtotal: orders.subtotal,
      shippingTotal: orders.shippingTotal,
      total: orders.total,
      currency: orders.currency,
      placedAt: orders.placedAt,
      updatedAt: orders.updatedAt,
      customerName: users.name,
      customerEmail: users.email,
      itemCount: sql<number>`count(${orderItems.id})`,
    })
    .from(orders)
    .leftJoin(users, eq(orders.userId, users.id))
    .leftJoin(orderItems, eq(orderItems.orderId, orders.id))
    .groupBy(orders.id, users.name, users.email)
    .orderBy(desc(orders.placedAt), desc(orders.updatedAt))
    .limit(limit);

  const rows = await (filterExpression ? query.where(filterExpression) : query);

  return rows.map((row) => ({
    ...row,
    itemCount: Number(row.itemCount ?? 0),
  }));
};

type AdminBlogStatus = "draft" | "scheduled" | "published";

type AdminBlogPostFilters = {
  search?: string | null;
  status?: AdminBlogStatus | "all" | null;
  limit?: number;
};

export type AdminBlogPostRow = {
  slug: string;
  title: string;
  author: string;
  excerpt: string;
  minutesToRead: number;
  status: AdminBlogStatus;
  publishedAt: Date | null;
  scheduledAt: Date | null;
  lastEditedAt: Date;
};

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

type AdminCmsStatus = "draft" | "published";

type AdminCmsFilters = {
  search?: string | null;
  status?: AdminCmsStatus | "all" | null;
  limit?: number;
};

type CmsPageSlug = "about" | "contact" | "faq";

export type AdminCmsPageRow = {
  slug: CmsPageSlug;
  title: string;
  status: AdminCmsStatus;
  owner: string;
  blocks: number;
  lastPublishedAt: Date;
  summary: string;
};

const cmsPageMetadata: AdminCmsPageRow[] = [
  {
    slug: "about",
    title: "About",
    status: "published",
    owner: "Brand Studio",
    blocks: 1 + (cmsPages.about.pillars?.length ?? 0),
    lastPublishedAt: new Date("2025-10-12"),
    summary: cmsPages.about.hero,
  },
  {
    slug: "contact",
    title: "Contact",
    status: "published",
    owner: "CX Team",
    blocks: cmsPages.contact.channels.length,
    lastPublishedAt: new Date("2025-09-04"),
    summary: cmsPages.contact.hero,
  },
  {
    slug: "faq",
    title: "FAQ",
    status: "published",
    owner: "CX Ops",
    blocks: cmsPages.faq.length,
    lastPublishedAt: new Date("2025-10-01"),
    summary: `${cmsPages.faq.length} entries maintained by CX Ops`,
  },
];

export const getAdminCmsPages = async ({
  search,
  status,
  limit = 25,
}: AdminCmsFilters = {}): Promise<AdminCmsPageRow[]> => {
  let rows = [...cmsPageMetadata];

  const normalizedStatus = status && status !== "all" ? status : undefined;
  if (normalizedStatus) {
    rows = rows.filter((row) => row.status === normalizedStatus);
  }

  const trimmed = search?.trim().toLowerCase();
  if (trimmed && trimmed.length > 0) {
    rows = rows.filter((row) =>
      [row.title, row.owner, row.summary].some((value) =>
        value.toLowerCase().includes(trimmed),
      ),
    );
  }

  rows.sort((a, b) => a.title.localeCompare(b.title));
  return rows.slice(0, limit);
};

type AdminDiscountStatus = "active" | "scheduled" | "expired" | "inactive";

type AdminDiscountFilters = {
  search?: string | null;
  status?: AdminDiscountStatus | "all" | null;
  limit?: number;
};

export type AdminDiscountRow = {
  id: string;
  code: string;
  description: string | null;
  discountType: typeof promoCodes.$inferSelect.discountType;
  value: number;
  valueLabel: string;
  status: AdminDiscountStatus;
  isActive: boolean;
  maxRedemptions: number | null;
  redemptionCount: number;
  startsAt: Date | null;
  endsAt: Date | null;
  createdAt: Date | null;
  updatedAt: Date | null;
};

const getDiscountStatus = (
  row: Pick<AdminDiscountRow, "isActive" | "startsAt" | "endsAt">,
  now: Date,
): AdminDiscountStatus => {
  if (!row.isActive) return "inactive";
  if (row.startsAt && row.startsAt > now) return "scheduled";
  if (row.endsAt && row.endsAt < now) return "expired";
  return "active";
};

export const getAdminDiscounts = async ({
  search,
  status,
  limit = 50,
}: AdminDiscountFilters = {}): Promise<AdminDiscountRow[]> => {
  const filters: SQL<unknown>[] = [];

  const trimmed = search?.trim();
  if (trimmed && trimmed.length > 0) {
    const searchExpression = or(
      ilike(promoCodes.code, `%${trimmed}%`),
      ilike(promoCodes.description, `%${trimmed}%`),
    );
    filters.push(searchExpression!);
  }

  const filterExpression =
    filters.length === 0
      ? null
      : filters.length === 1
        ? filters[0]!
        : and(filters[0]!, filters[1]!, ...filters.slice(2));

  const query = db
    .select({
      id: promoCodes.id,
      code: promoCodes.code,
      description: promoCodes.description,
      discountType: promoCodes.discountType,
      value: promoCodes.value,
      isActive: promoCodes.isActive,
      maxRedemptions: promoCodes.maxRedemptions,
      redemptionCount: promoCodes.redemptionCount,
      startsAt: promoCodes.startsAt,
      endsAt: promoCodes.endsAt,
      createdAt: promoCodes.createdAt,
      updatedAt: promoCodes.updatedAt,
    })
    .from(promoCodes)
    .orderBy(desc(promoCodes.updatedAt))
    .limit(limit * 2);

  const rows = await (filterExpression ? query.where(filterExpression) : query);

  const now = new Date();
  const formatter = new Intl.NumberFormat("en-MY", {
    style: "currency",
    currency: "MYR",
    maximumFractionDigits: 2,
  });

  const normalizedStatus = status && status !== "all" ? status : undefined;

  const mapped = rows
    .map((row) => {
      const statusLabel = getDiscountStatus(row, now);
      const valueLabel =
        row.discountType === "percentage"
          ? `${row.value}%`
          : formatter.format(row.value / 100);
      return {
        ...row,
        valueLabel,
        status: statusLabel,
        maxRedemptions: row.maxRedemptions ?? null,
        redemptionCount: row.redemptionCount ?? 0,
      } satisfies AdminDiscountRow;
    })
    .filter((row) =>
      normalizedStatus ? row.status === normalizedStatus : true,
    )
    .slice(0, limit);

  return mapped;
};

type AdminTeamRole = "owner" | "editor" | "analyst" | "support";
type AdminUserStatus = "active" | "pending" | "disabled";

type AdminUserFilters = {
  search?: string | null;
  role?: AdminTeamRole | "all" | null;
  status?: AdminUserStatus | "all" | null;
  limit?: number;
};

export type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  role: AdminTeamRole;
  status: AdminUserStatus;
  lastLoginAt: Date | null;
  location: string;
  mfaEnabled: boolean;
  teams: string[];
  invitedAt: Date;
};

const adminTeamDirectory: AdminUserRow[] = [
  {
    id: "ops-lead",
    name: "Maya Santiago",
    email: "maya@kimistore.com",
    role: "owner",
    status: "active",
    lastLoginAt: new Date("2025-11-16T09:10:00Z"),
    location: "New York, USA",
    mfaEnabled: true,
    teams: ["Operations", "Editorial"],
    invitedAt: new Date("2023-05-01"),
  },
  {
    id: "cx-lead",
    name: "Izzati Rahman",
    email: "izzati@kimistore.com",
    role: "editor",
    status: "active",
    lastLoginAt: new Date("2025-11-15T14:30:00Z"),
    location: "Kuala Lumpur, MY",
    mfaEnabled: true,
    teams: ["CX", "Loyalty"],
    invitedAt: new Date("2024-01-10"),
  },
  {
    id: "growth-analyst",
    name: "Lennox Parr",
    email: "lennox@kimistore.com",
    role: "analyst",
    status: "pending",
    lastLoginAt: null,
    location: "Remote",
    mfaEnabled: false,
    teams: ["Growth"],
    invitedAt: new Date("2025-11-14"),
  },
  {
    id: "studio-support",
    name: "Harper Cho",
    email: "harper@kimistore.com",
    role: "support",
    status: "disabled",
    lastLoginAt: new Date("2025-09-02T08:00:00Z"),
    location: "Singapore",
    mfaEnabled: false,
    teams: ["Studio"],
    invitedAt: new Date("2022-11-20"),
  },
];

export const getAdminUsers = async ({
  search,
  role,
  status,
  limit = 25,
}: AdminUserFilters = {}): Promise<AdminUserRow[]> => {
  let rows = [...adminTeamDirectory];

  const normalizedRole = role && role !== "all" ? role : undefined;
  const normalizedStatus = status && status !== "all" ? status : undefined;

  if (normalizedRole) {
    rows = rows.filter((row) => row.role === normalizedRole);
  }

  if (normalizedStatus) {
    rows = rows.filter((row) => row.status === normalizedStatus);
  }

  const trimmed = search?.trim().toLowerCase();
  if (trimmed && trimmed.length > 0) {
    rows = rows.filter((row) =>
      [row.name, row.email, row.location].some((value) =>
        value.toLowerCase().includes(trimmed),
      ),
    );
  }

  rows.sort((a, b) => {
    if (a.status === b.status) {
      const aTime = a.lastLoginAt ? a.lastLoginAt.getTime() : 0;
      const bTime = b.lastLoginAt ? b.lastLoginAt.getTime() : 0;
      return bTime - aTime;
    }
    const order: AdminUserStatus[] = ["active", "pending", "disabled"];
    return order.indexOf(a.status) - order.indexOf(b.status);
  });

  return rows.slice(0, limit);
};

type AdminCustomerFilters = {
  search?: string | null;
  status?: "active" | "inactive" | "all" | null;
  limit?: number;
};

export type ActivationStats = {
  emailsSent: number;
  remindersSent: number;
  lastEmailAt: Date | null;
  lastEventAt: Date | null;
  lastEventType: ActivationEventSummary["eventType"] | null;
  completedAt: Date | null;
  firstInviteAt: Date | null;
};

export type AdminCustomerRow = {
  id: string;
  name: string | null;
  email: string | null;
  isActive: boolean;
  emailVerified: Date | null;
  orderCount: number;
  totalSpent: number;
  lastOrderAt: Date | null;
  activation: ActivationStats;
};

const lastInteractionExpr = sql<Date | null>`coalesce(max(${orders.placedAt}), max(${orders.updatedAt}), max(${users.emailVerified}))`;

const createEmptyActivationStats = (): ActivationStats => ({
  emailsSent: 0,
  remindersSent: 0,
  lastEmailAt: null,
  lastEventAt: null,
  lastEventType: null,
  completedAt: null,
  firstInviteAt: null,
});

const summarizeActivationEvents = (
  events: ActivationEventSummary[],
): ActivationStats => {
  const summary = createEmptyActivationStats();

  for (const event of events) {
    if (!summary.lastEventAt || event.createdAt > summary.lastEventAt) {
      summary.lastEventAt = event.createdAt;
      summary.lastEventType = event.eventType;
    }

    if (event.eventType === "activation_invite") {
      summary.emailsSent += 1;
      summary.lastEmailAt = event.createdAt;
      summary.firstInviteAt = summary.firstInviteAt ?? event.createdAt;
    } else if (event.eventType === "activation_reminder") {
      summary.emailsSent += 1;
      summary.remindersSent += 1;
      summary.lastEmailAt = event.createdAt;
    } else if (
      event.eventType === "activation_completed" ||
      event.eventType === "activation_override_activate"
    ) {
      summary.completedAt = event.createdAt;
    }
  }

  return summary;
};

const buildActivationStatsMap = async (userIds: string[]) => {
  if (userIds.length === 0) {
    return new Map<string, ActivationStats>();
  }

  const events = await getActivationEventsForUsers(userIds);
  const grouped = new Map<string, ActivationEventSummary[]>();

  for (const event of events) {
    const bucket = grouped.get(event.userId);
    if (bucket) {
      bucket.push(event);
    } else {
      grouped.set(event.userId, [event]);
    }
  }

  const stats = new Map<string, ActivationStats>();
  for (const [userId, bucket] of grouped.entries()) {
    stats.set(userId, summarizeActivationEvents(bucket));
  }

  return stats;
};

export const getAdminCustomers = async ({
  search,
  status,
  limit = 50,
}: AdminCustomerFilters = {}): Promise<AdminCustomerRow[]> => {
  const filters: SQL<unknown>[] = [];

  const trimmed = search?.trim();
  if (trimmed && trimmed.length > 0) {
    const searchExpression = or(
      ilike(users.name, `%${trimmed}%`),
      ilike(users.email, `%${trimmed}%`),
    );
    filters.push(searchExpression!);
  }

  if (status === "active") {
    filters.push(eq(users.isActive, true));
  } else if (status === "inactive") {
    filters.push(eq(users.isActive, false));
  }

  const filterExpression =
    filters.length === 0
      ? null
      : filters.length === 1
        ? filters[0]!
        : and(filters[0]!, filters[1]!, ...filters.slice(2));

  const query = db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      isActive: users.isActive,
      emailVerified: users.emailVerified,
      orderCount: sql<number>`count(${orders.id})`,
      totalSpent: sql<number>`coalesce(sum(${orders.total}), 0)`,
      lastOrderAt: sql<Date | null>`max(${orders.placedAt})`,
      lastInteractionAt: lastInteractionExpr,
    })
    .from(users)
    .leftJoin(orders, eq(orders.userId, users.id))
    .groupBy(
      users.id,
      users.name,
      users.email,
      users.isActive,
      users.emailVerified,
    )
    .orderBy(desc(lastInteractionExpr))
    .limit(limit);

  const rows = await (filterExpression ? query.where(filterExpression) : query);
  const activationStatsMap = await buildActivationStatsMap(
    rows.map((row) => row.id),
  );

  return rows.map((row) => ({
    id: row.id,
    name: row.name ?? null,
    email: row.email ?? null,
    isActive: row.isActive,
    emailVerified: row.emailVerified ?? null,
    orderCount: Number(row.orderCount ?? 0),
    totalSpent: Number(row.totalSpent ?? 0),
    lastOrderAt: row.lastOrderAt ?? null,
    activation: activationStatsMap.get(row.id) ?? createEmptyActivationStats(),
  }));
};
