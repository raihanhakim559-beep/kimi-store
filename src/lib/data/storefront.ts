import type { InferSelectModel, SQL } from "drizzle-orm";
import { and, desc, eq } from "drizzle-orm";
import { unstable_noStore as noStore } from "next/cache";
import { cache } from "react";

import {
  categories,
  db,
  orderItems,
  orders,
  products,
  promoCodes,
  users,
} from "@/lib/schema";

export type Audience = "men" | "women" | "unisex";
export type ProductStatus = "sale" | "new";

export type Category = {
  slug: string;
  title: string;
  description: string;
  audience: Audience;
  heroCopy: string;
  features: string[];
};

export type Product = {
  slug: string;
  title: string;
  description: string;
  audience: Audience;
  category: string;
  price: number;
  status?: ProductStatus;
  specs: string[];
  colors: string[];
};

type BlogPostSection = {
  heading?: string;
  body: string;
};

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  publishedAt: string;
  minutesToRead: number;
  sections: BlogPostSection[];
};

export type Faq = {
  question: string;
  answer: string;
};

export type ContactChannel = {
  label: string;
  value: string;
  description: string;
};

export type AdminModule = {
  slug: string;
  title: string;
  description: string;
  metrics: string[];
  cta: string;
};

type DashboardStat = {
  label: string;
  value: string;
  trend: string;
};

export type DashboardOverview = {
  stats: DashboardStat[];
  highlights: string[];
};

export type TimelineEvent = {
  title: string;
  detail: string;
  timestamp: string;
};

export type StorefrontCollections = {
  men: Category[];
  women: Category[];
  newArrivals: Product[];
  sale: Product[];
};

type AdminModuleBlueprint = Omit<AdminModule, "metrics">;

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("en-US");

const formatCurrency = (valueInCents: number) =>
  currencyFormatter.format(valueInCents / 100);

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

type CategoryRow = InferSelectModel<typeof categories>;
type ProductRow = InferSelectModel<typeof products>;

type CategoryMetadata = {
  heroCopy?: string;
  features?: string[];
};

type ProductMetadata = {
  specs?: string[];
  colors?: string[];
  badges?: ProductStatus[];
};

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

const parseCategoryMetadata = (
  metadata: CategoryRow["metadata"],
): CategoryMetadata => {
  if (!metadata || typeof metadata !== "object") {
    return {};
  }
  const heroCopy =
    typeof (metadata as CategoryMetadata).heroCopy === "string"
      ? (metadata as CategoryMetadata).heroCopy
      : undefined;
  const features = isStringArray((metadata as CategoryMetadata).features)
    ? (metadata as CategoryMetadata).features
    : undefined;
  return { heroCopy, features };
};

const parseProductMetadata = (
  metadata: ProductRow["metadata"],
): ProductMetadata => {
  if (!metadata || typeof metadata !== "object") {
    return {};
  }
  const specs = isStringArray((metadata as ProductMetadata).specs)
    ? (metadata as ProductMetadata).specs
    : undefined;
  const colors = isStringArray((metadata as ProductMetadata).colors)
    ? (metadata as ProductMetadata).colors
    : undefined;
  const badges = isStringArray((metadata as ProductMetadata).badges)
    ? ((metadata as ProductMetadata).badges as ProductStatus[])
    : undefined;
  return { specs, colors, badges };
};

const normalizeAudience = (gender: CategoryRow["gender"]): Audience => {
  if (gender === "men" || gender === "women") {
    return gender;
  }
  return "unisex";
};

const mapCategoryRecord = (record: {
  slug: string;
  title: string;
  description: string | null;
  gender: CategoryRow["gender"];
  metadata: CategoryRow["metadata"];
}): Category => {
  const metadata = parseCategoryMetadata(record.metadata);
  return {
    slug: record.slug,
    title: record.title,
    description: record.description ?? "",
    audience: normalizeAudience(record.gender),
    heroCopy: metadata.heroCopy ?? record.description ?? record.title,
    features: metadata.features ?? [],
  };
};

const mapProductRecord = (record: {
  slug: string;
  name: string;
  summary: string | null;
  description: string | null;
  price: number;
  currency: string;
  metadata: ProductRow["metadata"];
  categorySlug: string;
  gender: CategoryRow["gender"];
}): Product => {
  const metadata = parseProductMetadata(record.metadata);
  const badge = metadata.badges?.find(
    (value): value is ProductStatus => value === "sale" || value === "new",
  );

  return {
    slug: record.slug,
    title: record.name,
    description: record.summary ?? record.description ?? "",
    audience: normalizeAudience(record.gender),
    category: record.categorySlug,
    price: record.price / 100,
    status: badge,
    specs: metadata.specs ?? [],
    colors: metadata.colors ?? [],
  };
};

const fetchActiveCategories = cache(async () => {
  const rows = await db
    .select({
      slug: categories.slug,
      title: categories.name,
      description: categories.description,
      gender: categories.gender,
      metadata: categories.metadata,
    })
    .from(categories)
    .where(eq(categories.isActive, true))
    .orderBy(categories.createdAt);

  return rows.map(mapCategoryRecord);
});

export const getCategoryBySlug = cache(async (slug: string) => {
  const list = await fetchActiveCategories();
  return list.find((category) => category.slug === slug) ?? null;
});

export const getCategoriesByAudience = cache(
  async (audience: Exclude<Audience, "unisex">) => {
    const list = await fetchActiveCategories();
    return list.filter(
      (category) =>
        category.audience === audience || category.audience === "unisex",
    );
  },
);

type ProductQueryOptions = {
  where?: SQL<unknown>;
  limit?: number;
};

const selectActiveProducts = async (options: ProductQueryOptions = {}) => {
  const baseCondition = eq(products.status, "active");
  const whereClause = options.where
    ? and(baseCondition, options.where)
    : baseCondition;

  const baseQuery = db
    .select({
      slug: products.slug,
      name: products.name,
      summary: products.summary,
      description: products.description,
      price: products.price,
      currency: products.currency,
      metadata: products.metadata,
      categorySlug: categories.slug,
      gender: categories.gender,
    })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(whereClause)
    .orderBy(desc(products.createdAt));

  const rows = await (typeof options.limit === "number"
    ? baseQuery.limit(options.limit)
    : baseQuery);
  return rows.map(mapProductRecord);
};

const fetchAllActiveProducts = cache(async () => selectActiveProducts());

export const getAllProducts = fetchAllActiveProducts;

export const getProductsByCategory = cache(async (slug: string) =>
  selectActiveProducts({ where: eq(categories.slug, slug) }),
);

export const getProductBySlug = cache(async (slug: string) => {
  const [product] = await selectActiveProducts({
    where: eq(products.slug, slug),
    limit: 1,
  });
  return product ?? null;
});

export const getProductsByBadge = cache(async (badge: ProductStatus) => {
  const list = await fetchAllActiveProducts();
  return list.filter((product) => product.status === badge);
});

export const blogPosts: BlogPost[] = [
  {
    slug: "elevate-the-daily-commute",
    title: "Elevate the Daily Commute",
    excerpt:
      "Layer breathable knits with waterproof protection for the sprint between meetings.",
    author: "Lina Ortega",
    publishedAt: "2025-08-12",
    minutesToRead: 6,
    sections: [
      {
        body: "Commuting shoes need to move fast between climates. The Orbit City Sneaker uses coated leather on high splash zones and perforations elsewhere to breathe.",
      },
      {
        heading: "Layered Cushioning",
        body: "Stacking BubbleSoft foam over a firm crash pad stops heel drag on subway platforms while keeping your stride crisp on sidewalks.",
      },
      {
        heading: "Styling cues",
        body: "Monochrome palettes lengthen the leg line—pair Stone with crisp tailoring for instant polish.",
      },
    ],
  },
  {
    slug: "tempo-training-reset",
    title: "Tempo Training Reset",
    excerpt:
      "Rebuild stability after a heavy season with functional drills and the Pulse Sync Trainer.",
    author: "Coach Milo",
    publishedAt: "2025-06-05",
    minutesToRead: 8,
    sections: [
      {
        body: "Training plates should match the workout. Pulse Sync keeps you low to the ground so you can load glutes without rolling ankles.",
      },
      {
        heading: "Anchor points matter",
        body: "Tri-anchored lacing pulls from the arch, instep, and collar to wrap the foot evenly without hot spots.",
      },
    ],
  },
  {
    slug: "heels-that-go-the-distance",
    title: "Heels That Go the Distance",
    excerpt:
      "Zenith Form brings runway lines with commuter-level cushioning for 12-hour wear.",
    author: "Editorial Team",
    publishedAt: "2025-04-18",
    minutesToRead: 5,
    sections: [
      {
        heading: "Support without compromise",
        body: "An anti-sway shank resists torsion so you can sprint for the elevator without wobble.",
      },
      {
        heading: "Grip in disguise",
        body: "A micro-lug rubber forefoot disappears visually but locks in on slick lobby marble.",
      },
    ],
  },
];

export const faqs: Faq[] = [
  {
    question: "What is the delivery timeline?",
    answer:
      "Domestic orders ship within 24 hours and arrive in 2-4 business days. Express shipping is available at checkout.",
  },
  {
    question: "How do I start a return?",
    answer:
      "Initiate a return through your dashboard. Print the prepaid label and drop the parcel at any courier partner within 30 days.",
  },
  {
    question: "Do you offer product care guides?",
    answer:
      "Yes, every order includes a QR code linking to material-specific cleaning steps and storage tips.",
  },
];

export const contactChannels: ContactChannel[] = [
  {
    label: "Customer Care",
    value: "support@kimistore.com",
    description: "For order updates, returns, or account assistance.",
  },
  {
    label: "Flagship Studio",
    value: "+1 (646) 555-0147",
    description: "Mon–Sat, 9a–7p EST.",
  },
  {
    label: "Press",
    value: "press@kimistore.com",
    description: "Collaborations, editorials, and media requests.",
  },
];

export const aboutContent = {
  hero: "We design footwear that keeps up with life in constant motion.",
  pillars: [
    {
      title: "Human-Centered",
      detail:
        "Fits are drafted from 3D scans collected across three continents for inclusive sizing.",
    },
    {
      title: "Materially Responsible",
      detail:
        "71% of our line uses recycled or bio-based textiles without compromising longevity.",
    },
    {
      title: "Service Obsessed",
      detail:
        "We pair each launch with concierge services—text, chat, or video fittings on demand.",
    },
  ],
};

export const contentNav = {
  primary: [
    { label: "Men", href: "/men" },
    { label: "Women", href: "/women" },
    { label: "New Arrivals", href: "/new-arrivals" },
    { label: "Sale", href: "/sale" },
    { label: "Blog", href: "/blog" },
  ],
  secondary: [
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "FAQ", href: "/faq" },
  ],
};

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

  const [productRows, categoryRows, orderRows, userRows, promoRows] =
    await Promise.all([
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

  const activePromos = promoRows.filter((promo) => promo.isActive).length;
  const archivedPromos = Math.max(promoRows.length - activePromos, 0);

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
      `${blogPosts.length} published stories`,
      `${Math.max(blogPosts.length - 1, 0)} scheduled`,
    ],
    cms: [
      `${Object.keys(cmsPages).length} live pages`,
      `${faqs.length} FAQ entries`,
    ],
    discounts: [`${activePromos} active promos`, `${archivedPromos} archived`],
    "admin-users": [
      `${activeCustomers} active admins`,
      `${Math.max(userRows.length - activeCustomers, 0)} pending`,
    ],
  };

  return adminModuleBlueprints.map((module) => ({
    ...module,
    metrics: metricsBySlug[module.slug] ?? [],
  }));
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
    };
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

export const wishlistCopy = {
  empty: "Your wishlist is waiting for fresh drops.",
  actions: [
    "Tap the heart icon on any product to pin it here.",
    "We’ll email restock alerts automatically.",
    "Sync across devices by signing in.",
  ],
};

export const checkoutSteps = ["Shipping", "Delivery", "Payment", "Review"];

export const cmsPages = {
  contact: {
    hero: "We’re here across chat, phone, and DM.",
    channels: contactChannels,
  },
  faq: faqs,
  about: aboutContent,
};

export const getStorefrontCollections = cache(
  async (): Promise<StorefrontCollections> => {
    const [men, women, catalog] = await Promise.all([
      getCategoriesByAudience("men"),
      getCategoriesByAudience("women"),
      fetchAllActiveProducts(),
    ]);

    const newArrivals = catalog.filter((product) => product.status === "new");
    const sale = catalog.filter((product) => product.status === "sale");

    return { men, women, newArrivals, sale };
  },
);

export const storefrontNavLinks = contentNav;

export const getBlogPostBySlug = (slug: string) =>
  blogPosts.find((post) => post.slug === slug) ?? null;

export const getAdminModuleBySlug = cache(async (slug: string) => {
  const modules = await getAdminModules();
  return modules.find((module) => module.slug === slug) ?? null;
});
