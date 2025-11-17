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

export type BlogPostSection = {
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

export type AboutContent = {
  label: string;
  hero: string;
  description: string;
  pillars: { title: string; detail: string }[];
};

export type FaqContent = {
  label: string;
  title: string;
  description: string;
  entries: Faq[];
};

export type ContactContent = {
  hero: string;
  channels: ContactChannel[];
};

export type CollectionKey = "men" | "women" | "new-arrivals" | "sale";

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
