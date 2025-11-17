import { createNavigation } from "next-intl/navigation";
import { ComponentProps, createElement, forwardRef } from "react";

import { routing } from "./routing";

const {
  Link: IntlLink,
  redirect,
  usePathname,
  useRouter,
  getPathname,
} = createNavigation(routing);

const LOCALES = ["en", "ms"] as const;
const LOCALE_PREFIX = new RegExp(`^/(${LOCALES.join("|")})(?=/|$)`, "i");

const normalizePathname = (value?: string) => {
  if (!value) {
    return value;
  }

  const normalized = value.replace(LOCALE_PREFIX, "");
  return normalized === "" ? "/" : normalized;
};

type IntlLinkProps = ComponentProps<typeof IntlLink>;

type HrefProp = IntlLinkProps["href"];

type PathLike = { pathname?: string };

const hasPathname = (value: unknown): value is PathLike =>
  typeof value === "object" && value !== null && "pathname" in value;

const normalizeHref = (href: HrefProp) => {
  if (typeof href === "string") {
    return normalizePathname(href) ?? "/";
  }

  if (hasPathname(href)) {
    return { ...href, pathname: normalizePathname(href.pathname) ?? "/" };
  }

  return href ?? "/";
};

export const Link = forwardRef<HTMLAnchorElement, IntlLinkProps>(
  ({ href, ...props }, ref) =>
    createElement(IntlLink, {
      ...props,
      href: normalizeHref(href),
      ref,
    }),
);

Link.displayName = "Link";

export { getPathname, redirect, usePathname, useRouter };
