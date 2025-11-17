import { Heart, ShoppingBag } from "lucide-react";
import type { ReactNode } from "react";

import { AuthControls } from "@/components/auth-controls";
import { SearchBar } from "@/components/search-bar";
import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { auth } from "@/lib/auth";
import { storefrontNavLinks } from "@/lib/data/storefront";

const StorefrontLayout = async ({ children }: { children: ReactNode }) => {
  const session = await auth();
  const currentYear = new Date().getFullYear();

  return (
    <div className="bg-background text-foreground relative flex min-h-screen flex-col">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px] bg-[radial-gradient(90%_70%_at_50%_0%,color-mix(in_oklch,var(--accent)_25%,transparent),transparent)]" />
      <header className="bg-background/95 supports-[backdrop-filter]:bg-background/75 sticky top-0 z-30 border-b backdrop-blur">
        <div className="container flex h-20 items-center gap-4">
          <Link
            href="/"
            className="font-mono text-xl font-black tracking-tight"
          >
            Kimi Studio
          </Link>
          <nav className="text-muted-foreground hidden flex-1 items-center justify-center gap-5 text-sm font-medium lg:flex">
            {storefrontNavLinks.primary.map((item) => (
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
            <SearchBar className="hidden max-w-sm flex-1 lg:flex" />
            {session?.user && (
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
            )}
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
            <AuthControls session={session} />
          </div>
        </div>
        <div className="container flex flex-col gap-3 pb-4 lg:hidden">
          <nav className="flex flex-wrap gap-3 text-sm font-medium">
            {storefrontNavLinks.primary.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-muted-foreground rounded-full border px-3 py-1"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <SearchBar size="full" className="w-full" />
        </div>
      </header>
      <main className="flex-1 pt-12 pb-28">
        <div className="container space-y-16">{children}</div>
      </main>
      <footer className="bg-background/90 border-t">
        <div className="container grid gap-10 py-12 lg:grid-cols-[1.1fr,0.9fr]">
          <div className="space-y-4">
            <p className="text-muted-foreground text-xs tracking-[0.4em] uppercase">
              Kimi Studio
            </p>
            <p className="text-3xl font-semibold">
              City equipment for restless people.
            </p>
            <p className="text-muted-foreground text-sm leading-relaxed">
              We prototype footwear with motion scientists and dancers to craft
              gear that keeps up with every commute, class, and midnight roam.
            </p>
            <div className="text-muted-foreground flex flex-wrap gap-2 text-xs font-semibold tracking-[0.4em] uppercase">
              <span className="rounded-full border px-3 py-1">Motion Lab</span>
              <span className="rounded-full border px-3 py-1">
                Material Lab
              </span>
              <span className="rounded-full border px-3 py-1">
                Movement Club
              </span>
            </div>
          </div>
          <div className="grid gap-6 text-sm sm:grid-cols-2">
            <div>
              <p className="text-muted-foreground text-xs tracking-[0.4em] uppercase">
                Storefront
              </p>
              <ul className="mt-3 space-y-2">
                {storefrontNavLinks.primary.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-muted-foreground hover:text-foreground transition"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-muted-foreground text-xs tracking-[0.4em] uppercase">
                More
              </p>
              <ul className="mt-3 space-y-2">
                {storefrontNavLinks.secondary.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-muted-foreground hover:text-foreground transition"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    href="/contact"
                    className="text-muted-foreground hover:text-foreground transition"
                  >
                    Contact studio
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="border-t">
          <div className="text-muted-foreground container flex flex-col gap-2 py-6 text-xs sm:flex-row sm:items-center sm:justify-between">
            <p>© {currentYear} Kimi. Engineered in Kuala Lumpur.</p>
            <div className="flex flex-wrap gap-4">
              <Link href="/faq" className="hover:text-foreground">
                Shipping & returns
              </Link>
              <Link href="/account/dashboard" className="hover:text-foreground">
                Dashboard
              </Link>
              <Link href="/blog" className="hover:text-foreground">
                Journal
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default StorefrontLayout;
