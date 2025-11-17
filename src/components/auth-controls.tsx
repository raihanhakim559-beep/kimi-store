"use client";

import Image from "next/image";
import { Session } from "next-auth";
import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";

import { Button, buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

type AuthControlsProps = {
  session: Session | null;
};

const getInitials = (name?: string | null, email?: string | null) => {
  if (name) {
    const trimmed = name.trim();
    if (trimmed) {
      const [first, last] = trimmed.split(" ");
      return (first?.[0] ?? "").concat(last?.[0] ?? "").toUpperCase();
    }
  }

  if (email) {
    return email.charAt(0).toUpperCase();
  }

  return "?";
};

export const AuthControls = ({ session }: AuthControlsProps) => {
  const t = useTranslations("home");

  if (!session?.user) {
    return (
      <Link href="/account/login" className={buttonVariants({ size: "sm" })}>
        {t("signIn")}
      </Link>
    );
  }

  const { user } = session;
  const initials = getInitials(user.name, user.email);

  return (
    <div className="flex items-center gap-2 md:gap-3">
      <Link
        href="/account/profile"
        className="hover:bg-muted/70 focus-visible:ring-ring flex items-center gap-2 rounded-full px-2 py-1 text-left transition focus-visible:ring focus-visible:outline-none"
      >
        {user.image ? (
          <Image
            className="rounded-full border"
            src={user.image}
            alt={user.name ?? user.email ?? "Profile photo"}
            width={40}
            height={40}
          />
        ) : (
          <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold uppercase">
            {initials}
          </div>
        )}
        <div className="hidden min-w-[140px] text-left md:block">
          <p className="text-sm leading-tight font-semibold">
            {user.name ?? "Your account"}
          </p>
          <p className="text-muted-foreground text-xs">
            {user.email ?? "View profile"}
          </p>
        </div>
      </Link>
      <Button
        variant="outline"
        size="sm"
        className="hidden sm:inline-flex"
        onClick={() => signOut({ callbackUrl: "/" })}
      >
        {t("signOut")}
      </Button>
    </div>
  );
};
