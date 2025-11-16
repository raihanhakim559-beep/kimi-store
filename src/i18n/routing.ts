import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  // Only English and Malay (ms) are supported
  locales: ["en", "ms"],

  defaultLocale: "en",
});
