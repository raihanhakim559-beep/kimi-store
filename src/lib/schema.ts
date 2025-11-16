import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import {
  boolean,
  foreignKey,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle({ client: sql });

export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  stripeCustomerId: text("stripeCustomerId").unique(),
  isActive: boolean("isActive").default(false).notNull(),
});

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    {
      compoundKey: primaryKey({
        columns: [account.provider, account.providerAccountId],
      }),
    },
  ],
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (verificationToken) => [
    {
      compositePk: primaryKey({
        columns: [verificationToken.identifier, verificationToken.token],
      }),
    },
  ],
);

export const authenticators = pgTable(
  "authenticator",
  {
    credentialID: text("credentialID").notNull().unique(),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    providerAccountId: text("providerAccountId").notNull(),
    credentialPublicKey: text("credentialPublicKey").notNull(),
    counter: integer("counter").notNull(),
    credentialDeviceType: text("credentialDeviceType").notNull(),
    credentialBackedUp: boolean("credentialBackedUp").notNull(),
    transports: text("transports"),
  },
  (authenticator) => [
    {
      compositePK: primaryKey({
        columns: [authenticator.userId, authenticator.credentialID],
      }),
    },
  ],
);

// --------------------
// Commerce domain
// --------------------

export const productGenderEnum = pgEnum("product_gender", [
  "men",
  "women",
  "unisex",
]);

export const productStatusEnum = pgEnum("product_status", [
  "draft",
  "active",
  "archived",
]);

export const cartStatusEnum = pgEnum("cart_status", [
  "active",
  "converted",
  "abandoned",
]);

export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "paid",
  "fulfilled",
  "cancelled",
  "refunded",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "requires_action",
  "succeeded",
  "refunded",
  "failed",
]);

export const fulfillmentStatusEnum = pgEnum("fulfillment_status", [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
]);

export const discountTypeEnum = pgEnum("discount_type", [
  "percentage",
  "fixed",
]);

export const categories = pgTable(
  "category",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description"),
    gender: productGenderEnum("gender").default("unisex").notNull(),
    parentCategoryId: text("parentCategoryId"),
    metadata: jsonb("metadata"),
    isActive: boolean("isActive").default(true).notNull(),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
  },
  (category) => ({
    parentCategoryFk: foreignKey({
      columns: [category.parentCategoryId],
      foreignColumns: [category.id],
      name: "category_parent_fk",
    }).onDelete("set null"),
  }),
);

export const tags = pgTable("tag", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
});

export const products = pgTable("product", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  categoryId: text("categoryId")
    .references(() => categories.id, { onDelete: "restrict" })
    .notNull(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  summary: text("summary"),
  description: text("description"),
  gender: productGenderEnum("gender").default("unisex").notNull(),
  status: productStatusEnum("status").default("draft").notNull(),
  price: integer("price").notNull(), // stored in cents
  currency: text("currency").default("MYR").notNull(),
  sku: text("sku").unique(),
  brand: text("brand"),
  isFeatured: boolean("isFeatured").default(false).notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
});

export const productImages = pgTable("product_image", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  productId: text("productId")
    .references(() => products.id, { onDelete: "cascade" })
    .notNull(),
  url: text("url").notNull(),
  alt: text("alt"),
  position: integer("position").default(0).notNull(),
  isPrimary: boolean("isPrimary").default(false).notNull(),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
});

export const productVariants = pgTable("product_variant", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  productId: text("productId")
    .references(() => products.id, { onDelete: "cascade" })
    .notNull(),
  sku: text("sku").unique(),
  size: text("size").notNull(),
  color: text("color"),
  stock: integer("stock").default(0).notNull(),
  price: integer("variantPrice"), // optional override in cents
  isDefault: boolean("isDefault").default(false).notNull(),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
});

export const productTags = pgTable(
  "product_tag",
  {
    productId: text("productId")
      .references(() => products.id, { onDelete: "cascade" })
      .notNull(),
    tagId: text("tagId")
      .references(() => tags.id, { onDelete: "cascade" })
      .notNull(),
  },
  (productTag) => [
    {
      compositePk: primaryKey({
        columns: [productTag.productId, productTag.tagId],
      }),
    },
  ],
);

export const wishlists = pgTable("wishlist", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("userId")
    .references(() => users.id, { onDelete: "cascade" })
    .unique()
    .notNull(),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
});

export const wishlistItems = pgTable(
  "wishlist_item",
  {
    wishlistId: text("wishlistId")
      .references(() => wishlists.id, { onDelete: "cascade" })
      .notNull(),
    productVariantId: text("productVariantId")
      .references(() => productVariants.id, { onDelete: "cascade" })
      .notNull(),
    addedAt: timestamp("addedAt", { mode: "date" }).defaultNow().notNull(),
  },
  (wishlistItem) => [
    {
      compositePk: primaryKey({
        columns: [wishlistItem.wishlistId, wishlistItem.productVariantId],
      }),
    },
  ],
);

export const carts = pgTable("cart", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("userId").references(() => users.id, { onDelete: "set null" }),
  sessionId: text("sessionId").unique(),
  status: cartStatusEnum("status").default("active").notNull(),
  currency: text("currency").default("MYR").notNull(),
  subtotal: integer("subtotal").default(0).notNull(),
  discountTotal: integer("discountTotal").default(0).notNull(),
  taxTotal: integer("taxTotal").default(0).notNull(),
  shippingTotal: integer("shippingTotal").default(0).notNull(),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
});

export const cartItems = pgTable("cart_item", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  cartId: text("cartId")
    .references(() => carts.id, { onDelete: "cascade" })
    .notNull(),
  productVariantId: text("productVariantId")
    .references(() => productVariants.id, { onDelete: "restrict" })
    .notNull(),
  quantity: integer("quantity").default(1).notNull(),
  unitPrice: integer("unitPrice").notNull(),
  lineTotal: integer("lineTotal").notNull(),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
});

export const addresses = pgTable("address", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("userId")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  label: text("label"),
  fullName: text("fullName").notNull(),
  phone: text("phone"),
  line1: text("line1").notNull(),
  line2: text("line2"),
  city: text("city").notNull(),
  state: text("state").notNull(),
  postalCode: text("postalCode").notNull(),
  country: text("country").default("MY").notNull(),
  isDefaultShipping: boolean("isDefaultShipping").default(false).notNull(),
  isDefaultBilling: boolean("isDefaultBilling").default(false).notNull(),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
});

export const promoCodes = pgTable("promo_code", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  code: text("code").notNull().unique(),
  description: text("description"),
  discountType: discountTypeEnum("discountType")
    .default("percentage")
    .notNull(),
  value: integer("value").notNull(),
  maxRedemptions: integer("maxRedemptions"),
  redemptionCount: integer("redemptionCount").default(0).notNull(),
  startsAt: timestamp("startsAt", { mode: "date" }),
  endsAt: timestamp("endsAt", { mode: "date" }),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
});

export const orders = pgTable("order", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  orderNumber: text("orderNumber").notNull().unique(),
  userId: text("userId").references(() => users.id, { onDelete: "set null" }),
  cartId: text("cartId").references(() => carts.id, { onDelete: "set null" }),
  status: orderStatusEnum("status").default("pending").notNull(),
  paymentStatus: paymentStatusEnum("paymentStatus")
    .default("pending")
    .notNull(),
  fulfillmentStatus: fulfillmentStatusEnum("fulfillmentStatus")
    .default("pending")
    .notNull(),
  currency: text("currency").default("MYR").notNull(),
  subtotal: integer("subtotal").default(0).notNull(),
  discountTotal: integer("discountTotal").default(0).notNull(),
  taxTotal: integer("taxTotal").default(0).notNull(),
  shippingTotal: integer("shippingTotal").default(0).notNull(),
  total: integer("total").default(0).notNull(),
  shippingAddressSnapshot: jsonb("shippingAddressSnapshot"),
  billingAddressSnapshot: jsonb("billingAddressSnapshot"),
  stripePaymentIntentId: text("stripePaymentIntentId"),
  stripeCheckoutSessionId: text("stripeCheckoutSessionId"),
  notes: text("notes"),
  placedAt: timestamp("placedAt", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
});

export const orderItems = pgTable("order_item", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  orderId: text("orderId")
    .references(() => orders.id, { onDelete: "cascade" })
    .notNull(),
  productId: text("productId")
    .references(() => products.id, { onDelete: "restrict" })
    .notNull(),
  productVariantId: text("productVariantId").references(
    () => productVariants.id,
    { onDelete: "set null" },
  ),
  name: text("name").notNull(),
  sku: text("sku"),
  size: text("size"),
  color: text("color"),
  quantity: integer("quantity").default(1).notNull(),
  unitPrice: integer("unitPrice").notNull(),
  lineTotal: integer("lineTotal").notNull(),
  snapshot: jsonb("snapshot"),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
});

export const orderAppliedPromotions = pgTable(
  "order_applied_promotion",
  {
    orderId: text("orderId")
      .references(() => orders.id, { onDelete: "cascade" })
      .notNull(),
    promoCodeId: text("promoCodeId")
      .references(() => promoCodes.id, { onDelete: "cascade" })
      .notNull(),
    amount: integer("amount").default(0).notNull(),
  },
  (orderAppliedPromotion) => [
    {
      compositePk: primaryKey({
        columns: [
          orderAppliedPromotion.orderId,
          orderAppliedPromotion.promoCodeId,
        ],
      }),
    },
  ],
);

export const reviews = pgTable("review", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  productId: text("productId")
    .references(() => products.id, { onDelete: "cascade" })
    .notNull(),
  userId: text("userId")
    .references(() => users.id, { onDelete: "restrict" })
    .notNull(),
  rating: integer("rating").default(5).notNull(),
  title: text("title"),
  comment: text("comment"),
  isPublished: boolean("isPublished").default(true).notNull(),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).defaultNow().notNull(),
});
