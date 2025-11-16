import { routing } from "@/i18n/routing";

export type Locale = (typeof routing.locales)[number];

export type Copy = Record<Locale, string>;

export const makeCopy = (copy: Copy): Copy => copy;

export const translateCopy = (copy: Copy, locale: Locale) =>
  copy[locale] ?? copy[routing.defaultLocale];

export const translateCopies = (copies: Copy[], locale: Locale) =>
  copies.map((entry) => translateCopy(entry, locale));
