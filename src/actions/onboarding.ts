"use server";

import { desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { logActivationEvent } from "@/lib/activation-events";
import { auth } from "@/lib/auth";
import { sendActivationEmail } from "@/lib/email/send-activation-email";
import {
  deleteOnboardingToken,
  getUserForOnboardingToken,
} from "@/lib/onboarding";
import { addresses, db, users } from "@/lib/schema";

const onboardingSchema = z.object({
  token: z.string().min(10),
  locale: z.string().min(2),
  name: z.string().min(2).max(80),
  phone: z.string().min(6).max(30),
  fullName: z.string().min(2).max(80),
  line1: z.string().min(3).max(120),
  line2: z.string().max(120).optional(),
  city: z.string().min(2).max(60),
  state: z.string().min(2).max(60),
  postalCode: z.string().min(3).max(12),
  country: z.string().length(2).default("MY"),
  acceptTerms: z.literal("on"),
});

export const completeOnboarding = async (formData: FormData) => {
  const parsed = onboardingSchema.safeParse({
    token: formData.get("token"),
    locale: formData.get("locale"),
    name: formData.get("name"),
    phone: formData.get("phone"),
    fullName: formData.get("fullName"),
    line1: formData.get("line1"),
    line2: formData.get("line2"),
    city: formData.get("city"),
    state: formData.get("state"),
    postalCode: formData.get("postalCode"),
    country: formData.get("country") ?? "MY",
    acceptTerms: formData.get("acceptTerms"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }

  const data = parsed.data;
  const pendingUser = await getUserForOnboardingToken(data.token);

  if (!pendingUser) {
    throw new Error("Activation link is invalid or expired.");
  }

  await db
    .update(users)
    .set({
      name: data.name.trim(),
      phone: data.phone.trim(),
      hasAcceptedTerms: true,
      isActive: true,
      emailVerified: new Date(),
      onboardingCompletedAt: new Date(),
    })
    .where(eq(users.id, pendingUser.id));

  const [existingAddress] = await db
    .select({ id: addresses.id })
    .from(addresses)
    .where(eq(addresses.userId, pendingUser.id))
    .orderBy(desc(addresses.isDefaultShipping), desc(addresses.createdAt))
    .limit(1);

  if (existingAddress) {
    await db
      .update(addresses)
      .set({
        fullName: data.fullName.trim(),
        phone: data.phone.trim(),
        line1: data.line1.trim(),
        line2: data.line2?.trim() || null,
        city: data.city.trim(),
        state: data.state.trim(),
        postalCode: data.postalCode.trim(),
        country: data.country.toUpperCase(),
        isDefaultShipping: true,
        isDefaultBilling: true,
        updatedAt: new Date(),
      })
      .where(eq(addresses.id, existingAddress.id));
  } else {
    await db.insert(addresses).values({
      userId: pendingUser.id,
      label: "Primary",
      fullName: data.fullName.trim(),
      phone: data.phone.trim(),
      line1: data.line1.trim(),
      line2: data.line2?.trim() || null,
      city: data.city.trim(),
      state: data.state.trim(),
      postalCode: data.postalCode.trim(),
      country: data.country.toUpperCase(),
      isDefaultShipping: true,
      isDefaultBilling: true,
    });
  }

  await deleteOnboardingToken(data.token);
  await logActivationEvent({
    userId: pendingUser.id,
    eventType: "activation_completed",
    metadata: { method: "self_service" },
  });

  revalidatePath(`/${data.locale}/account/profile`);
  redirect(`/${data.locale}/account/profile?welcome=1`);
};

export const requestActivationEmail = async (
  locale: string,
  origin: "profile" | "checkout" = "profile",
) => {
  const session = await auth();

  if (!session?.user?.id || !session.user.email) {
    throw new Error("Not authenticated");
  }

  await sendActivationEmail({
    userId: session.user.id,
    email: session.user.email,
    name: session.user.name,
    locale,
    channel: origin === "checkout" ? "checkout" : "profile",
  });

  return { success: true };
};
