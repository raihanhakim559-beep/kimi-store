import {
  and,
  desc,
  eq,
  ilike,
  inArray,
  type InferSelectModel,
  or,
  type SQL,
} from "drizzle-orm";
import { unstable_noStore as noStore } from "next/cache";
import { cache } from "react";

import { routing } from "@/i18n/routing";
import {
  type Copy,
  type Locale,
  makeCopy,
  translateCopy,
} from "@/lib/i18n/copy";
import {
  blogPostsTable,
  categories,
  db,
  orderItems,
  orders,
  productImages,
  products,
  productVariants,
  promoCodes,
  reviews as reviewTable,
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
  id: string;
  slug: string;
  title: string;
  description: string;
  audience: Audience;
  category: string;
  price: number;
  currency: string;
  status?: ProductStatus;
  specs: string[];
  colors: string[];
  createdAt: Date;
};

export type ProductVariantOption = {
  id: string;
  size: string;
  color?: string | null;
  stock: number;
  priceOverride?: number | null;
  isDefault: boolean;
};

export type ProductImage = {
  id: string;
  url: string;
  alt?: string | null;
  isPrimary: boolean;
};

export type ProductDetail = Product & {
  variants: ProductVariantOption[];
  media: ProductImage[];
  related: Product[];
};

export type ProductReview = {
  id: string;
  author: string;
  rating: number;
  headline: string;
  body: string;
  createdAt: string;
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

const normalizeBlogSections = (value: unknown): BlogPostSection[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  const sections: BlogPostSection[] = [];
  value.forEach((section) => {
    if (!section || typeof section !== "object") {
      return;
    }
    const heading =
      "heading" in section && typeof section.heading === "string"
        ? section.heading
        : undefined;
    const body =
      "body" in section && typeof section.body === "string"
        ? section.body
        : undefined;
    if (!body) {
      return;
    }
    sections.push({ heading, body });
  });
  return sections;
};

const mapBlogPostRecord = (record: {
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  minutesToRead: number;
  sections: BlogPostSection[] | null;
  publishedAt: Date | null;
}): BlogPost => ({
  slug: record.slug,
  title: record.title,
  excerpt: record.excerpt,
  author: record.author,
  minutesToRead: record.minutesToRead,
  publishedAt: (record.publishedAt ?? new Date()).toISOString(),
  sections: normalizeBlogSections(record.sections),
});

const fetchPublishedBlogPosts = cache(async (): Promise<BlogPost[]> => {
  const rows = await db
    .select({
      slug: blogPostsTable.slug,
      title: blogPostsTable.title,
      excerpt: blogPostsTable.excerpt,
      author: blogPostsTable.author,
      minutesToRead: blogPostsTable.minutesToRead,
      sections: blogPostsTable.sections,
      publishedAt: blogPostsTable.publishedAt,
    })
    .from(blogPostsTable)
    .where(eq(blogPostsTable.status, "published"))
    .orderBy(desc(blogPostsTable.publishedAt));

  return rows.map(mapBlogPostRecord);
});

export const getBlogPosts = fetchPublishedBlogPosts;

export const getBlogPostBySlug = cache(async (slug: string) => {
  const rows = await db
    .select({
      slug: blogPostsTable.slug,
      title: blogPostsTable.title,
      excerpt: blogPostsTable.excerpt,
      author: blogPostsTable.author,
      minutesToRead: blogPostsTable.minutesToRead,
      sections: blogPostsTable.sections,
      publishedAt: blogPostsTable.publishedAt,
    })
    .from(blogPostsTable)
    .where(
      and(
        eq(blogPostsTable.slug, slug),
        eq(blogPostsTable.status, "published"),
      ),
    )
    .limit(1);

  const record = rows[0];
  return record ? mapBlogPostRecord(record) : null;
});

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

export type CategoryProductSort =
  | "featured"
  | "newest"
  | "priceLow"
  | "priceHigh";

export type CategoryProductFilters = {
  sizes?: string[];
  colors?: string[];
  tags?: string[];
  priceMin?: number;
  priceMax?: number;
  sort?: CategoryProductSort;
};

export type CategoryProductFacets = {
  sizes: string[];
  colors: string[];
  tags: string[];
  price: { min: number; max: number };
};

export type CategoryProductResult = {
  products: Product[];
  facets: CategoryProductFacets;
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
  id: string;
  slug: string;
  name: string;
  summary: string | null;
  description: string | null;
  price: number;
  currency: string;
  metadata: ProductRow["metadata"];
  categorySlug: string;
  gender: CategoryRow["gender"];
  createdAt: Date;
}): Product => {
  const metadata = parseProductMetadata(record.metadata);
  const badge = metadata.badges?.find(
    (value): value is ProductStatus => value === "sale" || value === "new",
  );

  return {
    id: record.id,
    slug: record.slug,
    title: record.name,
    description: record.summary ?? record.description ?? "",
    audience: normalizeAudience(record.gender),
    category: record.categorySlug,
    price: record.price / 100,
    currency: record.currency,
    status: badge,
    specs: metadata.specs ?? [],
    colors: metadata.colors ?? [],
    createdAt: record.createdAt,
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
      id: products.id,
      slug: products.slug,
      name: products.name,
      summary: products.summary,
      description: products.description,
      price: products.price,
      currency: products.currency,
      metadata: products.metadata,
      categorySlug: categories.slug,
      gender: categories.gender,
      createdAt: products.createdAt,
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

const sortProducts = (
  list: Product[],
  sort: CategoryProductSort = "featured",
) => {
  if (sort === "priceLow") {
    return [...list].sort((a, b) => a.price - b.price);
  }

  if (sort === "priceHigh") {
    return [...list].sort((a, b) => b.price - a.price);
  }

  if (sort === "newest") {
    return [...list].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
  }

  return [...list];
};

const normalizeArray = (values?: string[]) =>
  values?.map((value) => value.trim()).filter(Boolean) ?? [];

export const getProductsByCategory = async (
  slug: string,
  filters: CategoryProductFilters = {},
): Promise<CategoryProductResult> => {
  const baseProducts = await selectActiveProducts({
    where: eq(categories.slug, slug),
  });

  const priceValues = baseProducts.map((product) => product.price);
  const priceRange = priceValues.length
    ? {
        min: Math.min(...priceValues),
        max: Math.max(...priceValues),
      }
    : { min: 0, max: 0 };

  if (baseProducts.length === 0) {
    return {
      products: [],
      facets: { sizes: [], colors: [], tags: [], price: priceRange },
    };
  }

  const productIds = baseProducts.map((product) => product.id);
  let variantRows: { productId: string; size: string; color: string | null }[] =
    [];

  if (productIds.length > 0) {
    variantRows = await db
      .select({
        productId: productVariants.productId,
        size: productVariants.size,
        color: productVariants.color,
      })
      .from(productVariants)
      .where(inArray(productVariants.productId, productIds));
  }

  const sizeSet = new Set<string>();
  const colorSet = new Set<string>();
  const variantIndex = new Map<
    string,
    {
      sizes: Set<string>;
      colors: Set<string>;
    }
  >();

  variantRows.forEach(({ productId, size, color }) => {
    sizeSet.add(size);
    const indexEntry = variantIndex.get(productId) ?? {
      sizes: new Set<string>(),
      colors: new Set<string>(),
    };
    indexEntry.sizes.add(size);
    if (color) {
      colorSet.add(color);
      indexEntry.colors.add(color);
    }
    variantIndex.set(productId, indexEntry);
  });

  const tagSet = new Set<string>();
  baseProducts.forEach((product) => {
    product.specs.forEach((spec) => tagSet.add(spec));
  });

  const requestedSizes = normalizeArray(filters.sizes).map((value) =>
    value.toLowerCase(),
  );
  const requestedColors = normalizeArray(filters.colors).map((value) =>
    value.toLowerCase(),
  );
  const requestedTags = normalizeArray(filters.tags).map((value) =>
    value.toLowerCase(),
  );

  let filtered = baseProducts;

  if (filters.priceMin !== undefined) {
    filtered = filtered.filter((product) => product.price >= filters.priceMin!);
  }

  if (filters.priceMax !== undefined) {
    filtered = filtered.filter((product) => product.price <= filters.priceMax!);
  }

  if (requestedSizes.length > 0) {
    filtered = filtered.filter((product) => {
      const sizes = variantIndex.get(product.id)?.sizes;
      if (!sizes || sizes.size === 0) {
        return false;
      }
      const normalizedSizes = Array.from(sizes).map((size) =>
        size.toLowerCase(),
      );
      return requestedSizes.some((size) => normalizedSizes.includes(size));
    });
  }

  if (requestedColors.length > 0) {
    filtered = filtered.filter((product) => {
      const colors = variantIndex.get(product.id)?.colors ?? new Set();
      const normalizedColors = Array.from(colors).map((color) =>
        color.toLowerCase(),
      );
      return requestedColors.some((color) => normalizedColors.includes(color));
    });
  }

  if (requestedTags.length > 0) {
    filtered = filtered.filter((product) =>
      product.specs.some((spec) =>
        requestedTags.some((tag) => spec.toLowerCase().includes(tag)),
      ),
    );
  }

  const sorted = sortProducts(filtered, filters.sort ?? "featured");

  return {
    products: sorted,
    facets: {
      sizes: Array.from(sizeSet).sort((a, b) =>
        a.localeCompare(b, undefined, { numeric: true }),
      ),
      colors: Array.from(colorSet).sort((a, b) => a.localeCompare(b)),
      tags: Array.from(tagSet).sort((a, b) => a.localeCompare(b)),
      price: priceRange,
    },
  };
};

export const getProductBySlug = cache(async (slug: string) => {
  const [product] = await selectActiveProducts({
    where: eq(products.slug, slug),
    limit: 1,
  });
  return product ?? null;
});

export const getProductDetailBySlug = cache(async (slug: string) => {
  const [productRow] = await db
    .select({
      id: products.id,
      slug: products.slug,
      name: products.name,
      summary: products.summary,
      description: products.description,
      price: products.price,
      currency: products.currency,
      metadata: products.metadata,
      categorySlug: categories.slug,
      gender: categories.gender,
      createdAt: products.createdAt,
    })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(and(eq(products.slug, slug), eq(products.status, "active")))
    .limit(1);

  if (!productRow) {
    return null;
  }

  const baseProduct = mapProductRecord(productRow);

  const variantRows = await db
    .select({
      id: productVariants.id,
      size: productVariants.size,
      color: productVariants.color,
      stock: productVariants.stock,
      priceOverride: productVariants.price,
      isDefault: productVariants.isDefault,
    })
    .from(productVariants)
    .where(eq(productVariants.productId, productRow.id))
    .orderBy(desc(productVariants.isDefault), productVariants.size);

  const imageRows = await db
    .select({
      id: productImages.id,
      url: productImages.url,
      alt: productImages.alt,
      isPrimary: productImages.isPrimary,
      position: productImages.position,
    })
    .from(productImages)
    .where(eq(productImages.productId, productRow.id))
    .orderBy(desc(productImages.isPrimary), productImages.position);

  const gallery = imageRows.length
    ? imageRows.map((image) => ({
        id: image.id,
        url: image.url,
        alt: image.alt,
        isPrimary: image.isPrimary,
      }))
    : [
        {
          id: `${productRow.id}-fallback`,
          url: `https://images.unsplash.com/photo-1528701800489-20be3cbe2233?auto=format&fit=crop&w=900&q=80`,
          alt: `${baseProduct.title} preview`,
          isPrimary: true,
        },
      ];

  const relatedPool = await selectActiveProducts({
    where: eq(categories.slug, productRow.categorySlug),
    limit: 6,
  });

  const related = relatedPool
    .filter((product) => product.slug !== baseProduct.slug)
    .slice(0, 4);

  return {
    ...baseProduct,
    variants: variantRows.map((variant) => ({
      id: variant.id,
      size: variant.size,
      color: variant.color,
      stock: variant.stock,
      priceOverride: variant.priceOverride ? variant.priceOverride / 100 : null,
      isDefault: variant.isDefault,
    })),
    media: gallery,
    related,
  } satisfies ProductDetail;
});

export const getProductsByBadge = cache(async (badge: ProductStatus) => {
  const list = await fetchAllActiveProducts();
  return list.filter((product) => product.status === badge);
});

export const searchProducts = cache(async (rawQuery: string, limit = 24) => {
  const trimmed = rawQuery.trim();
  if (!trimmed) {
    return [];
  }

  const normalized = trimmed.replace(/\s+/g, " ");
  const pattern = `%${normalized.replace(/ /g, "%")}%`;

  return selectActiveProducts({
    where: or(
      ilike(products.name, pattern),
      ilike(products.summary, pattern),
      ilike(products.description, pattern),
    ),
    limit,
  });
});

export const getProductReviews = cache(async (slug: string) => {
  const rows = await db
    .select({
      id: reviewTable.id,
      rating: reviewTable.rating,
      title: reviewTable.title,
      comment: reviewTable.comment,
      createdAt: reviewTable.createdAt,
      author: users.name,
    })
    .from(reviewTable)
    .innerJoin(products, eq(reviewTable.productId, products.id))
    .leftJoin(users, eq(reviewTable.userId, users.id))
    .where(and(eq(products.slug, slug), eq(reviewTable.isPublished, true)))
    .orderBy(desc(reviewTable.createdAt))
    .limit(12);

  return rows.map((row) => ({
    id: row.id,
    author: row.author ?? "Kimi Member",
    rating: row.rating,
    headline: row.title ?? "Review",
    body: row.comment ?? "",
    createdAt: (row.createdAt ?? new Date()).toISOString(),
  }));
});

type LocalizedFaqEntry = {
  question: Copy;
  answer: Copy;
};

const faqHeroCopy = {
  label: makeCopy({ en: "FAQ", ms: "Soalan Lazim" }),
  title: makeCopy({
    en: "Your top questions, answered.",
    ms: "Soalan utama anda, kami jawab.",
  }),
  description: makeCopy({
    en: "Details about shipping, returns, and care. Need more support? Tap Contact for live help.",
    ms: "Butiran tentang penghantaran, pemulangan, dan penjagaan. Perlu bantuan lanjut? Pilih Hubungi untuk sokongan segera.",
  }),
};

const faqEntries: LocalizedFaqEntry[] = [
  {
    question: makeCopy({
      en: "What is the delivery timeline?",
      ms: "Apakah garis masa penghantaran?",
    }),
    answer: makeCopy({
      en: "Domestic orders ship within 24 hours and arrive in 2-4 business days. Express shipping is available at checkout.",
      ms: "Pesanan dalam negara dihantar dalam masa 24 jam dan tiba dalam 2-4 hari bekerja. Penghantaran ekspres tersedia ketika pembayaran.",
    }),
  },
  {
    question: makeCopy({
      en: "How do I start a return?",
      ms: "Bagaimana saya memulakan pemulangan?",
    }),
    answer: makeCopy({
      en: "Initiate a return through your dashboard. Print the prepaid label and drop the parcel at any courier partner within 30 days.",
      ms: "Mulakan pemulangan melalui papan pemuka anda. Cetak label prabayar dan serahkan bungkusan di mana-mana rakan kurier dalam tempoh 30 hari.",
    }),
  },
  {
    question: makeCopy({
      en: "Do you offer product care guides?",
      ms: "Adakah anda menawarkan panduan penjagaan produk?",
    }),
    answer: makeCopy({
      en: "Yes, every order includes a QR code linking to material-specific cleaning steps and storage tips.",
      ms: "Ya, setiap pesanan disertakan kod QR yang memaut kepada langkah pembersihan mengikut material serta tip penyimpanan.",
    }),
  },
];

export const getFaqEntries = (locale: Locale): Faq[] =>
  faqEntries.map((entry) => ({
    question: translateCopy(entry.question, locale),
    answer: translateCopy(entry.answer, locale),
  }));

export const getFaqContent = (locale: Locale) => ({
  label: translateCopy(faqHeroCopy.label, locale),
  title: translateCopy(faqHeroCopy.title, locale),
  description: translateCopy(faqHeroCopy.description, locale),
  entries: getFaqEntries(locale),
});

export const faqs: Faq[] = getFaqEntries(routing.defaultLocale);

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

type LocalizedAboutPillar = {
  title: Copy;
  detail: Copy;
};

const aboutCopy = {
  label: makeCopy({ en: "About us", ms: "Tentang kami" }),
  hero: makeCopy({
    en: "We design footwear that keeps up with life in constant motion.",
    ms: "Kami mereka kasut yang mengikuti ritma hidup yang sentiasa bergerak.",
  }),
  description: makeCopy({
    en: "Kimi Store Shoes is a Malaysia-born design lab crafting products for global city life. We combine biomechanics with expressive styling to make shoes that keep up with the calendar.",
    ms: "Kimi Store Shoes ialah makmal reka bentuk kelahiran Malaysia yang mencipta produk untuk gaya hidup bandar global. Kami menggabungkan biomekanik dengan gaya ekspresif untuk menghasilkan kasut yang seiring dengan jadual anda.",
  }),
  pillars: [
    {
      title: makeCopy({
        en: "Human-Centered",
        ms: "Berpusatkan Manusia",
      }),
      detail: makeCopy({
        en: "Fits are drafted from 3D scans collected across three continents for inclusive sizing.",
        ms: "Potongan dibangunkan daripada imbasan 3D yang dikumpul di tiga benua bagi memastikan saiz yang inklusif.",
      }),
    },
    {
      title: makeCopy({
        en: "Materially Responsible",
        ms: "Bertanggungjawab terhadap Material",
      }),
      detail: makeCopy({
        en: "71% of our line uses recycled or bio-based textiles without compromising longevity.",
        ms: "71% koleksi kami menggunakan tekstil kitar semula atau berasaskan bio tanpa menjejaskan ketahanan.",
      }),
    },
    {
      title: makeCopy({
        en: "Service Obsessed",
        ms: "Taksub kepada Servis",
      }),
      detail: makeCopy({
        en: "We pair each launch with concierge services—text, chat, or video fittings on demand.",
        ms: "Setiap pelancaran ditemani perkhidmatan concierge—mesej, sembang, atau sesi fitting video atas permintaan.",
      }),
    },
  ] satisfies LocalizedAboutPillar[],
};

export type AboutContent = {
  label: string;
  hero: string;
  description: string;
  pillars: { title: string; detail: string }[];
};

const buildAboutContent = (locale: Locale): AboutContent => ({
  label: translateCopy(aboutCopy.label, locale),
  hero: translateCopy(aboutCopy.hero, locale),
  description: translateCopy(aboutCopy.description, locale),
  pillars: aboutCopy.pillars.map((pillar) => ({
    title: translateCopy(pillar.title, locale),
    detail: translateCopy(pillar.detail, locale),
  })),
});

export const getAboutContent = buildAboutContent;
export const aboutContent = buildAboutContent(routing.defaultLocale);

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

export type CollectionKey = "men" | "women" | "new-arrivals" | "sale";

type CollectionChipDefinition = {
  key: CollectionKey;
  href: string;
  label: Copy;
  description: Copy;
};

type CollectionChipGroupDefinition = {
  label: Copy;
  chips: CollectionChipDefinition[];
};

const collectionChipGroups: CollectionChipGroupDefinition[] = [
  {
    label: makeCopy({ en: "Core collections", ms: "Koleksi teras" }),
    chips: [
      {
        key: "men",
        href: "/men",
        label: makeCopy({ en: "Men", ms: "Lelaki" }),
        description: makeCopy({
          en: "Velocity-driven essentials built for the city.",
          ms: "Keperluan laju yang direka untuk kota.",
        }),
      },
      {
        key: "women",
        href: "/women",
        label: makeCopy({ en: "Women", ms: "Wanita" }),
        description: makeCopy({
          en: "Studio-ready silhouettes tuned for expression.",
          ms: "Siluet sedia studio untuk ekspresi diri.",
        }),
      },
    ],
  },
  {
    label: makeCopy({ en: "Campaign highlights", ms: "Sorotan kempen" }),
    chips: [
      {
        key: "new-arrivals",
        href: "/new-arrivals",
        label: makeCopy({ en: "New Arrivals", ms: "Koleksi Baharu" }),
        description: makeCopy({
          en: "Fresh drops with experimental foams.",
          ms: "Keluaran baharu dengan busa eksperimental.",
        }),
      },
      {
        key: "sale",
        href: "/sale",
        label: makeCopy({ en: "Sale", ms: "Jualan" }),
        description: makeCopy({
          en: "Limited promos on final sizes.",
          ms: "Promosi terhad untuk saiz terakhir.",
        }),
      },
    ],
  },
];

export type CollectionChip = {
  key: CollectionKey;
  href: string;
  label: string;
  description: string;
};

export type CollectionChipGroup = {
  label: string;
  chips: CollectionChip[];
};

export const getCollectionChipGroups = (
  locale: Locale,
): CollectionChipGroup[] =>
  collectionChipGroups.map((group) => ({
    label: translateCopy(group.label, locale),
    chips: group.chips.map((chip) => ({
      key: chip.key,
      href: chip.href,
      label: translateCopy(chip.label, locale),
      description: translateCopy(chip.description, locale),
    })),
  }));

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

  const [productRows, categoryRows, orderRows, userRows, promoRows, blogRows] =
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
      db
        .select({
          id: blogPostsTable.id,
          status: blogPostsTable.status,
        })
        .from(blogPostsTable),
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

export const getAdminModuleBySlug = cache(async (slug: string) => {
  const modules = await getAdminModules();
  return modules.find((module) => module.slug === slug) ?? null;
});
