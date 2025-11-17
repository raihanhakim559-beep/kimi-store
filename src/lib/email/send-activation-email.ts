import { env } from "@/env.mjs";
import { logActivationEvent } from "@/lib/activation-events";
import { generateOnboardingToken } from "@/lib/onboarding";

import { buildActivationEmail } from "./activation-template";
import { sendEmail } from "./resend";

type ActivationEmailChannel =
  | "invite"
  | "profile"
  | "checkout"
  | "admin"
  | "drip";

type SendActivationEmailParams = {
  userId: string;
  email: string;
  name?: string | null;
  locale?: string;
  channel?: ActivationEmailChannel;
  metadata?: Record<string, unknown>;
};

export const sendActivationEmail = async ({
  userId,
  email,
  name,
  locale = "en",
  channel = "invite",
  metadata,
}: SendActivationEmailParams) => {
  if (!email) {
    console.warn("Activation email skipped: no email for user", userId);
    return;
  }

  const { token } = await generateOnboardingToken(userId);

  const baseUrl = env.APP_URL.replace(/\/$/, "");
  const onboardingUrl = `${baseUrl}/${locale}/account/onboarding?token=${token}`;

  const emailContent = buildActivationEmail({ name, onboardingUrl });

  await sendEmail({
    to: email,
    ...emailContent,
  });

  await logActivationEvent({
    userId,
    eventType:
      channel === "invite" ? "activation_invite" : "activation_reminder",
    metadata: {
      channel,
      locale,
      email,
      ...metadata,
    },
  });
};
