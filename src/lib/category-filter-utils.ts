import type {
  CategoryProductFilters,
  CategoryProductSort,
} from "@/lib/data/storefront";

export type RawSearchParams = Record<string, string | string[] | undefined>;

const splitValue = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const toArrayParam = (value?: string | string[]): string[] => {
  if (!value) {
    return [];
  }
  if (Array.isArray(value)) {
    return value.flatMap((entry) => splitValue(entry));
  }
  return splitValue(value);
};

const toNumberParam = (value?: string | string[]): number | undefined => {
  const firstValue = Array.isArray(value) ? value[0] : value;
  if (!firstValue) {
    return undefined;
  }
  const parsed = Number(firstValue);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const toSortParam = (
  value?: string | string[],
): CategoryProductSort | undefined => {
  const firstValue = Array.isArray(value) ? value[0] : value;
  if (!firstValue) {
    return undefined;
  }
  if (
    firstValue === "featured" ||
    firstValue === "newest" ||
    firstValue === "priceLow" ||
    firstValue === "priceHigh"
  ) {
    return firstValue;
  }
  return undefined;
};

export const parseCategoryFilterState = (
  searchParams?: RawSearchParams,
): CategoryProductFilters => {
  return {
    sizes: toArrayParam(searchParams?.size),
    colors: toArrayParam(searchParams?.color),
    tags: toArrayParam(searchParams?.tag),
    priceMin: toNumberParam(searchParams?.priceMin),
    priceMax: toNumberParam(searchParams?.priceMax),
    sort: toSortParam(searchParams?.sort),
  };
};

export const countActiveFilters = (filters: CategoryProductFilters): number => {
  const buckets = [
    filters.sizes?.length ?? 0,
    filters.colors?.length ?? 0,
    filters.tags?.length ?? 0,
    filters.priceMin !== undefined ? 1 : 0,
    filters.priceMax !== undefined ? 1 : 0,
    filters.sort && filters.sort !== "featured" ? 1 : 0,
  ];
  return buckets.reduce((total, value) => total + value, 0);
};
