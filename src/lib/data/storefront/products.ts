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
import { cache } from "react";

import {
  categories,
  db,
  productImages,
  products,
  productVariants,
  reviews as reviewTable,
  users,
} from "@/lib/schema";

import type {
  Audience,
  Category,
  CategoryProductFilters,
  CategoryProductResult,
  CategoryProductSort,
  Product,
  ProductDetail,
  ProductImage,
  ProductReview,
  ProductStatus,
} from "./types";

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

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
  } satisfies Category;
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
  } satisfies Product;
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
    } satisfies CategoryProductResult;
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
  } satisfies CategoryProductResult;
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

  const gallery: ProductImage[] = imageRows.length
    ? imageRows.map((image) => ({
        id: image.id,
        url: image.url,
        alt: image.alt,
        isPrimary: image.isPrimary,
      }))
    : [
        {
          id: `${productRow.id}-fallback`,
          url: `/opengraph-image.jpg`,
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

  return rows.map(
    (row): ProductReview => ({
      id: row.id,
      author: row.author ?? "Kimi Member",
      rating: row.rating,
      headline: row.title ?? "Review",
      body: row.comment ?? "",
      createdAt: (row.createdAt ?? new Date()).toISOString(),
    }),
  );
});
