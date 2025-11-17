"use client";

import { LogOut, Settings, UserRoundCog } from "lucide-react";
import { Session } from "next-auth";
import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

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
  const avatarAlt = user.name ?? user.email ?? "Profile photo";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            buttonVariants({ variant: "ghost", size: "icon" }),
            "rounded-full border",
          )}
          aria-label="Open account menu"
        >
          <Avatar className="border">
            <AvatarImage src={user.image ?? undefined} alt={avatarAlt} />
            <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold uppercase">
              {initials}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-fit">
        <div className="flex items-center gap-3 px-2 py-2">
          <Avatar className="size-10 border">
            <AvatarImage src={user.image ?? undefined} alt={avatarAlt} />
            <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold uppercase">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm leading-tight font-semibold">
              {user.name ?? "Your account"}
            </p>
            <p className="text-muted-foreground text-xs">
              {user.email ?? "View profile"}
            </p>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/account/profile" className="flex items-center gap-2">
              <Settings className="size-4" />
              <span>Profile</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/account/dashboard" className="flex items-center gap-2">
              <UserRoundCog className="size-4" />
              <span>Dashboard</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={(event) => {
            event.preventDefault();
            void signOut({ callbackUrl: "/" });
          }}
          variant="destructive"
          className="flex items-center gap-2"
        >
          <LogOut className="size-4" />
          <span>{t("signOut")}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
