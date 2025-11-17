"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { adminUsersTable, db } from "@/lib/schema";

const adminRoleEnum = ["owner", "editor", "analyst", "support"] as const;
const adminStatusEnum = ["active", "pending", "disabled"] as const;

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

  const { locale, userId, role } = parsed.data;

  await db
    .update(adminUsersTable)
    .set({ role, updatedAt: new Date() })
    .where(eq(adminUsersTable.id, userId));

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

  const { locale, userId, status } = parsed.data;

  await db
    .update(adminUsersTable)
    .set({ status, updatedAt: new Date() })
    .where(eq(adminUsersTable.id, userId));

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

  const { locale, name, email, role } = parsed.data;
  const now = new Date();

  await db
    .insert(adminUsersTable)
    .values({
      id: crypto.randomUUID(),
      name,
      email,
      role,
      status: "pending",
      invitedAt: now,
      updatedAt: now,
      teams: [],
      mfaEnabled: false,
    })
    .onConflictDoUpdate({
      target: adminUsersTable.email,
      set: {
        name,
        role,
        status: "pending",
        updatedAt: now,
      },
    });

  revalidateAdmins(locale);
};
