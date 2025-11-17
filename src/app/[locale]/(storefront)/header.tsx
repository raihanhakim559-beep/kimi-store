import { ArrowUpRight, Heart, Menu, ShoppingBag, Sparkles } from "lucide-react";

import { AuthControls } from "@/components/auth-controls";
import { SearchBar } from "@/components/search-bar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Link } from "@/i18n/navigation";
import { auth } from "@/lib/auth";
import { storefrontNavLinks } from "@/lib/data/storefront/collections";

const announcements = [
  { label: "Book a studio fitting", href: "/contact" },
  { label: "Movement Club residency", href: "/blog" },
];

type StorefrontNavLink = { label: string; href: string };
type BuiltNavItem = StorefrontNavLink & { description: string; badge?: string };

const navMetadata: Record<string, { description: string; badge?: string }> = {
  "/men": {
    description: "Velocity layers tuned for the morning commute.",
  },
  "/women": {
    description: "Studio-ready silhouettes and soft cushioning.",
  },
  "/new-arrivals": {
    description: "Latest drops from the Motion Lab.",
    badge: "New",
  },
  "/sale": {
    description: "Season-end archive and limited promos.",
    badge: "Drop",
  },
  "/blog": {
    description: "Stories from dancers, engineers, and friends.",
  },
};

const secondaryNav = [
  ...storefrontNavLinks.secondary,
  { label: "Contact studio", href: "/contact" },
  { label: "Account dashboard", href: "/account/dashboard" },
];

const labBadges = ["Motion Lab", "Material Lab", "Movement Club"];

const buildNavItems = (): BuiltNavItem[] =>
  storefrontNavLinks.primary.map((item: StorefrontNavLink) => ({
    ...item,
    description:
      navMetadata[item.href]?.description ?? `Discover ${item.label}`,
    badge: navMetadata[item.href]?.badge,
  }));

export default async function HeaderStorefront() {
  const session = await auth();
  const navItems = buildNavItems();

  return (
    <header className="relative z-30">
      <div className="from-muted/60 via-background to-background border-b bg-gradient-to-r">
        <div className="container flex flex-wrap items-center justify-between gap-4 py-2 text-xs font-medium tracking-[0.25em] uppercase">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">Studio Drop</span>
              <Badge
                variant="outline"
                className="rounded-full text-[10px] uppercase"
              >
                AW25
              </Badge>
            </div>
            <span className="text-foreground flex items-center gap-1">
              <Sparkles className="size-3" /> Midnight launch live now
            </span>
          </div>
          <div className="text-muted-foreground hidden items-center gap-4 md:flex">
            {announcements.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="hover:text-foreground inline-flex items-center gap-1 transition"
              >
                {item.label}
                <ArrowUpRight className="size-3" />
              </Link>
            ))}
          </div>
          <div className="text-muted-foreground flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden />
            Kuala Lumpur · 28°C
          </div>
        </div>
      </div>

      <div className="bg-background/90 supports-[backdrop-filter]:bg-background/75 sticky top-0 border-b backdrop-blur">
        <div className="container flex h-20 items-center gap-3 lg:gap-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full border lg:hidden"
              >
                <Menu className="size-5" />
                <span className="sr-only">Open navigation</span>
              </Button>
            </SheetTrigger>
            <NavigationSheet sessionActive={Boolean(session?.user)} />
          </Sheet>

          <Link
            href="/"
            className="font-mono text-xl font-black tracking-tight lg:text-2xl"
          >
            Kimi Studio
          </Link>

          <NavigationMenu className="hidden flex-1 lg:flex">
            <NavigationMenuList className="gap-2">
              {navItems.map((item) => (
                <NavigationMenuItem key={item.href}>
                  <NavigationMenuLink asChild>
                    <Link
                      href={item.href}
                      className="hover:border-foreground/30 data-[active]:border-foreground/40 group rounded-2xl border border-transparent px-4 py-3 text-left transition"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold tracking-[0.2em] uppercase">
                          {item.label}
                        </span>
                        {item.badge ? (
                          <Badge
                            variant="outline"
                            className="text-[10px] uppercase"
                          >
                            {item.badge}
                          </Badge>
                        ) : null}
                      </div>
                      <p className="text-muted-foreground text-xs leading-snug">
                        {item.description}
                      </p>
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          <div className="flex flex-1 items-center justify-end gap-2">
            <SearchBar
              variant="command-button"
              commandButtonStyle="pill"
              className="hidden min-w-[220px] shrink-0 xl:flex"
            />
            {session?.user && (
              <>
                <Link
                  href="/wishlist"
                  aria-label="Wishlist"
                  className={buttonVariants({
                    variant: "ghost",
                    size: "icon",
                    className: "rounded-full border",
                  })}
                >
                  <Heart className="size-4" />
                </Link>
                <Link
                  href="/cart"
                  aria-label="Cart"
                  className={buttonVariants({
                    variant: "ghost",
                    size: "icon",
                    className: "rounded-full border",
                  })}
                >
                  <ShoppingBag className="size-4" />
                </Link>
              </>
            )}
            <AuthControls session={session} />
          </div>
        </div>

        <div className="border-t lg:hidden">
          <div className="container flex flex-col gap-3 py-4">
            <SearchBar size="full" placeholder="Search Kimi" />
            <div className="text-muted-foreground flex flex-wrap gap-2 text-xs uppercase">
              {labBadges.map((badge) => (
                <span key={badge} className="rounded-full border px-3 py-1">
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function NavigationSheet({ sessionActive }: { sessionActive: boolean }) {
  const navItems = buildNavItems();

  return (
    <SheetContent
      side="left"
      className="flex w-full max-w-md flex-col gap-6 px-6 py-8"
    >
      <SheetHeader>
        <SheetTitle className="text-left text-base tracking-[0.3em] uppercase">
          Navigation
        </SheetTitle>
      </SheetHeader>
      <SearchBar size="full" placeholder="Search Kimi" />
      <div className="grid gap-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="hover:bg-muted/50 rounded-2xl border px-4 py-3 transition"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold tracking-[0.25em] uppercase">
                {item.label}
              </p>
              <ArrowUpRight className="size-4" />
            </div>
            <p className="text-muted-foreground text-xs leading-snug">
              {item.description}
            </p>
          </Link>
        ))}
      </div>

      <Separator />

      <div className="grid gap-3">
        <p className="text-muted-foreground text-xs font-medium tracking-[0.3em] uppercase">
          Studio Services
        </p>
        <div className="grid gap-2">
          {secondaryNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-foreground text-sm font-semibold"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      <SheetFooter className="mt-auto">
        <div className="text-muted-foreground text-xs">
          {sessionActive ? "Signed in" : "You’re browsing as guest"}
        </div>
      </SheetFooter>
    </SheetContent>
  );
}
