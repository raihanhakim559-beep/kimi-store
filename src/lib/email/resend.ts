import { Resend } from "resend";

import { env } from "@/env.mjs";

type SendEmailPayload = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

let resendClient: Resend | null = null;

if (env.RESEND_API_KEY) {
  resendClient = new Resend(env.RESEND_API_KEY);
}

export const sendEmail = async (payload: SendEmailPayload) => {
  if (!resendClient) {
    throw new Error(
      "Email delivery is disabled. Set RESEND_API_KEY and RESEND_FROM_EMAIL to enable account activation emails.",
    );
  }

  const fromAddress = env.RESEND_FROM_EMAIL;
  if (!fromAddress) {
    throw new Error(
      "Missing RESEND_FROM_EMAIL. Verify a sender in Resend and set the environment variable before resending.",
    );
  }

  const result = await resendClient.emails.send({
    from: `Kimi Store Shoes <${fromAddress}>`,
    ...payload,
  });

  if (result.error) {
    throw new Error(result.error.message);
  }

  return result.data;
};
