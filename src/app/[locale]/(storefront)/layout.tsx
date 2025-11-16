import { ReactNode } from "react";

import { AuthControls } from "@/components/auth-controls";
import { SearchBar } from "@/components/search-bar";
import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { auth } from "@/lib/auth";
import { storefrontNavLinks } from "@/lib/data/storefront";

const StorefrontLayout = async ({ children }: { children: ReactNode }) => {
  const session = await auth();

  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col">
      <header className="bg-background/80 sticky top-0 z-20 border-b backdrop-blur">
        <div className="container flex h-16 items-center gap-4">
          <Link
            href="/"
            className="font-mono text-xl font-black tracking-tight"
          >
            Kimi Store Shoes
          </Link>
          <div className="flex flex-1 items-center gap-4">
            <nav className="hidden flex-1 items-center gap-6 text-sm font-medium md:flex">
              {storefrontNavLinks.primary.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-muted-foreground hover:text-foreground transition"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <SearchBar className="hidden flex-1 md:flex" />
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/cart"
              className={buttonVariants({ variant: "ghost", size: "sm" })}
            >
              Cart
            </Link>
            <AuthControls session={session} />
          </div>
        </div>
        <div className="border-t">
          <div className="text-muted-foreground container flex gap-4 py-2 text-xs font-medium md:hidden">
            {storefrontNavLinks.primary.map((item) => (
              <Link key={item.href} href={item.href} className="capitalize">
                {item.label}
              </Link>
            ))}
          </div>
          <div className="container py-2 md:hidden">
            <SearchBar size="full" />
          </div>
        </div>
      </header>
      <main className="flex-1 pt-10 pb-24">
        <div className="container space-y-12">{children}</div>
      </main>
      <footer className="border-t py-10">
        <div className="container flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-semibold">Stay moving.</p>
            <p className="text-muted-foreground text-sm">
              Footwear engineered for constant motion since 2014.
            </p>
          </div>
          <div className="text-muted-foreground flex flex-wrap gap-4 text-sm">
            {storefrontNavLinks.secondary.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default StorefrontLayout;
