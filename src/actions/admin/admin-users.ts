"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

const adminRoleEnum = ["owner", "editor", "analyst", "support"] as const;
const adminStatusEnum = ["active", "pending", "disabled"] as const;

const simulateAdminMutation = () =>
  new Promise((resolve) => setTimeout(resolve, 200));

const revalidateAdmins = (locale: string) =>
  revalidatePath(`/${locale}/admin/admin-users`);

const roleSchema = z.object({
  locale: z.string().min(2),
  userId: z.string().min(1),
  role: z.enum(adminRoleEnum),
});

const statusSchema = z.object({
  locale: z.string().min(2),
  userId: z.string().min(1),
  status: z.enum(adminStatusEnum),
});

const inviteSchema = z.object({
  locale: z.string().min(2),
  name: z.string().min(2),
  email: z.string().email(),
  role: z.enum(adminRoleEnum),
});

export const updateAdminUserRole = async (formData: FormData) => {
  const parsed = roleSchema.safeParse({
    locale: formData.get("locale"),
    userId: formData.get("userId"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }

  const { locale } = parsed.data;
  await simulateAdminMutation();
  revalidateAdmins(locale);
};

export const updateAdminUserStatus = async (formData: FormData) => {
  const parsed = statusSchema.safeParse({
    locale: formData.get("locale"),
    userId: formData.get("userId"),
    status: formData.get("status"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }

  const { locale } = parsed.data;
  await simulateAdminMutation();
  revalidateAdmins(locale);
};

export const inviteAdminUser = async (formData: FormData) => {
  const parsed = inviteSchema.safeParse({
    locale: formData.get("locale"),
    name: formData.get("name"),
    email: formData.get("email"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }

  const { locale } = parsed.data;
  await simulateAdminMutation();
  revalidateAdmins(locale);
};
