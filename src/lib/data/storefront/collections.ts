import { cache } from "react";

import {
  type Copy,
  type Locale,
  makeCopy,
  translateCopy,
} from "@/lib/i18n/copy";

import { getAllProducts, getCategoriesByAudience } from "./products";
import {
  type CollectionChipGroup,
  type CollectionKey,
  type StorefrontCollections,
} from "./types";

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

export const getStorefrontCollections = cache(
  async (): Promise<StorefrontCollections> => {
    const [men, women, catalog] = await Promise.all([
      getCategoriesByAudience("men"),
      getCategoriesByAudience("women"),
      getAllProducts(),
    ]);

    const newArrivals = catalog.filter((product) => product.status === "new");
    const sale = catalog.filter((product) => product.status === "sale");

    return { men, women, newArrivals, sale } satisfies StorefrontCollections;
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

export const checkoutSteps = [
  "Shipping",
  "Delivery",
  "Payment",
  "Review",
] as const;

export const storefrontNavLinks = contentNav;
