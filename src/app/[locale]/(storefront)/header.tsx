import { ArrowUpRight, Heart, Menu, ShoppingBag } from "lucide-react";

import { AuthControls } from "@/components/auth-controls";
import { SearchBar } from "@/components/search-bar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
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
import { getCartSummary } from "@/lib/cart";
import { storefrontNavLinks } from "@/lib/data/storefront/collections";
import {
  getWishlistEntries,
  type WishlistEntry,
} from "@/lib/data/storefront/wishlist";

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

const buildNavItems = (): BuiltNavItem[] =>
  storefrontNavLinks.primary.map((item: StorefrontNavLink) => ({
    ...item,
    description:
      navMetadata[item.href]?.description ?? `Discover ${item.label}`,
    badge: navMetadata[item.href]?.badge,
  }));

export default async function HeaderStorefront() {
  const session = await auth();
  const cartSummaryPromise = getCartSummary();
  const wishlistItemsPromise: Promise<WishlistEntry[]> = session?.user
    ? getWishlistEntries(session.user.id)
    : Promise.resolve([]);

  const [cartSummary, wishlistItems] = await Promise.all([
    cartSummaryPromise,
    wishlistItemsPromise,
  ]);

  const cartItemCount = cartSummary.items.reduce(
    (total, item) => total + item.quantity,
    0,
  );
  const wishlistCount = wishlistItems.length;
  const navItems = buildNavItems();

  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/75 sticky top-0 z-30 border-b backdrop-blur">
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

        <nav className="text-muted-foreground hidden flex-1 items-center justify-center gap-5 text-sm font-medium lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="hover:text-foreground transition"
            >
              {item.label}
            </Link>
          ))}
        </nav>

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
                  className: "relative rounded-full border",
                })}
              >
                <Heart className="size-4" />
                {wishlistCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="border-background bg-foreground text-background absolute -top-1 -right-1 flex h-5 min-w-[1.3rem] items-center justify-center rounded-full border px-1 text-[10px] leading-none font-semibold"
                  >
                    {wishlistCount > 99 ? "99+" : wishlistCount}
                  </Badge>
                )}
              </Link>
              <Link
                href="/cart"
                aria-label="Cart"
                className={buttonVariants({
                  variant: "ghost",
                  size: "icon",
                  className: "relative rounded-full border",
                })}
              >
                <ShoppingBag className="size-4" />
                {cartItemCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="border-background bg-foreground text-background absolute -top-1 -right-1 flex h-5 min-w-[1.3rem] items-center justify-center rounded-full border px-1 text-[10px] leading-none font-semibold"
                  >
                    {cartItemCount > 99 ? "99+" : cartItemCount}
                  </Badge>
                )}
              </Link>
            </>
          )}
          <AuthControls session={session} />
        </div>
      </div>

      <div className="border-t lg:hidden">
        <div className="container flex flex-col gap-3 py-4">
          <SearchBar size="full" placeholder="Search Kimi" />
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
