"use server";

import { z } from "zod";

const contactSchema = z.object({
  name: z.string().min(2, "Share your name so we can personalize the reply."),
  email: z.string().email("Enter a valid email so updates reach you."),
  orderId: z.string().trim().max(32).optional(),
  message: z
    .string()
    .min(20, "Let us know a few more details (20+ characters)."),
});

export type ContactFormState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<keyof z.infer<typeof contactSchema>, string>>;
};

export const initialContactFormState: ContactFormState = {
  status: "idle",
};

export const submitContactRequest = async (
  _prevState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> => {
  const input = {
    name: formData.get("name"),
    email: formData.get("email"),
    orderId: formData.get("orderId"),
    message: formData.get("message"),
  };

  const parsed = contactSchema.safeParse(input);

  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: Object.fromEntries(
        Object.entries(parsed.error.flatten().fieldErrors).map(
          ([key, value]) => [key, value?.[0] ?? ""] as const,
        ),
      ),
    } satisfies ContactFormState;
  }

  // TODO: replace with queue or CRM integration.
  console.info("[contact] new inquiry", parsed.data);

  return {
    status: "success",
    message: "Thanks! Our concierge will respond within two business hours.",
  } satisfies ContactFormState;
};
