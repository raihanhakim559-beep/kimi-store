import { env } from "@/env.mjs";

export const siteConfig = {
  title: "Kimi Store Shoes",
  description:
    "Footwear engineered for fast-moving lives. Explore men and women collections, editorial stories, and a secure admin workspace for the team.",
  keywords: ["Footwear", "Ecommerce", "Kimi Store", "Shoes"],
  url: env.APP_URL,
  googleSiteVerificationId: env.GOOGLE_SITE_VERIFICATION_ID || "",
};
