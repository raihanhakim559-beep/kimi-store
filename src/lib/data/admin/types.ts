import type { ActivationEventSummary } from "@/lib/activation-events";
import type { JsonMap, LocaleCopy } from "@/lib/schema";
import {
  adminUsersTable,
  blogPostsTable,
  categories,
  cmsPageSections,
  cmsPagesTable,
  orders,
  products,
  promoCodes,
} from "@/lib/schema";

type CategoryGender = typeof categories.$inferSelect.gender;
type ProductStatus = typeof products.$inferSelect.status;
type OrderStatus = typeof orders.$inferSelect.status;
type OrderPaymentStatus = typeof orders.$inferSelect.paymentStatus;
type OrderFulfillmentStatus = typeof orders.$inferSelect.fulfillmentStatus;
type DiscountType = typeof promoCodes.$inferSelect.discountType;
type CmsSectionType = typeof cmsPageSections.$inferSelect.sectionType;

export type AdminCmsStatus = typeof cmsPagesTable.$inferSelect.status;
export type AdminBlogStatus = typeof blogPostsTable.$inferSelect.status;
export type AdminTeamRole = typeof adminUsersTable.$inferSelect.role;
export type AdminUserStatus = typeof adminUsersTable.$inferSelect.status;

export type ActivationStats = {
  emailsSent: number;
  remindersSent: number;
  lastEmailAt: Date | null;
  lastEventAt: Date | null;
  lastEventType: ActivationEventSummary["eventType"] | null;
  completedAt: Date | null;
  firstInviteAt: Date | null;
};

export type AdminProductFilters = {
  search?: string | null;
  status?: ProductStatus | null;
  limit?: number;
};

export type AdminProductRow = {
  id: string;
  name: string;
  slug: string;
  status: ProductStatus;
  price: number;
  currency: string;
  updatedAt: Date | null;
  categoryName?: string | null;
  categorySlug?: string | null;
  inventory: number;
  variantCount: number;
  coverImageUrl?: string | null;
  coverImageAlt?: string | null;
};

export type AdminCategoryFilters = {
  search?: string | null;
  audience?: CategoryGender | null;
  status?: "active" | "inactive" | null;
  limit?: number;
};

export type AdminCategoryRow = {
  id: string;
  name: string;
  slug: string;
  gender: CategoryGender;
  isActive: boolean;
  description: string | null;
  heroCopy?: string;
  features: string[];
  productCount: number;
  updatedAt: Date | null;
};

export type AdminCmsFilters = {
  search?: string | null;
  status?: AdminCmsStatus | "all" | null;
  limit?: number;
};

export type AdminCmsPageRow = {
  slug: string;
  title: string;
  status: AdminCmsStatus;
  owner: string;
  blocks: number;
  lastPublishedAt: Date;
  summary: string;
};

export type AdminCmsSectionRow = {
  id: string;
  pageSlug: string;
  pageTitle: string;
  sectionType: CmsSectionType;
  title: LocaleCopy | null;
  body: LocaleCopy | null;
  metadata: JsonMap | null;
  position: number;
  isActive: boolean;
};

export type AdminBlogPostFilters = {
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

export type AdminCustomerFilters = {
  search?: string | null;
  status?: "active" | "inactive" | "all" | null;
  limit?: number;
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

export type AdminDiscountStatus =
  | "active"
  | "scheduled"
  | "expired"
  | "inactive";

export type AdminDiscountFilters = {
  search?: string | null;
  status?: AdminDiscountStatus | "all" | null;
  limit?: number;
};

export type AdminDiscountRow = {
  id: string;
  code: string;
  description: string | null;
  discountType: DiscountType;
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

export type AdminOrderFilters = {
  search?: string | null;
  status?: OrderStatus | "all" | null;
  paymentStatus?: OrderPaymentStatus | "all" | null;
  fulfillmentStatus?: OrderFulfillmentStatus | "all" | null;
  limit?: number;
};

export type AdminOrderRow = {
  id: string;
  orderNumber: string;
  customerName?: string | null;
  customerEmail?: string | null;
  status: OrderStatus;
  paymentStatus: OrderPaymentStatus;
  fulfillmentStatus: OrderFulfillmentStatus;
  subtotal: number;
  shippingTotal: number;
  total: number;
  currency: string;
  itemCount: number;
  placedAt: Date | null;
  updatedAt: Date | null;
};

export type AdminUserFilters = {
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
  location: string | null;
  mfaEnabled: boolean;
  teams: string[];
  invitedAt: Date | null;
};
