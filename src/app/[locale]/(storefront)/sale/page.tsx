import type { Metadata } from "next";

import { ProductShowcaseCard } from "@/components/product-showcase-card";
import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { getSeoMeta } from "@/lib/data/seo";
import { getStorefrontCollections } from "@/lib/data/storefront";
import { type Locale } from "@/lib/i18n/copy";

type SalePageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: SalePageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const locale = (resolvedParams?.locale ?? routing.defaultLocale) as Locale;
  const seo = getSeoMeta("sale", locale);

  return {
    title: seo.title,
    description: seo.description,
  };
}

const SalePage = async () => {
  const { sale: saleProducts } = await getStorefrontCollections();
  return (
    <div className="space-y-16 pb-12">
      <header className="rounded-[2.75rem] border bg-gradient-to-br from-amber-200 via-rose-200 to-orange-100 p-10 shadow-[0_25px_60px_rgba(249,115,22,0.25)] dark:from-amber-900/50 dark:via-rose-900/40 dark:to-orange-900/30">
        <p className="text-muted-foreground/80 text-xs tracking-[0.5em] uppercase">
          Archive / Sale
        </p>
        <h1 className="mt-4 text-4xl leading-tight font-semibold md:text-5xl">
          Limited-time promos, retired palettes, and final sizes.
        </h1>
        <p className="text-muted-foreground mt-4 text-base md:text-lg">
          Final call samples, recolors, and motion lab prototypes priced for
          fast movement. Discounts stack automatically in cart.
        </p>
        <div className="mt-6 flex flex-wrap gap-4">
          <Link
            href="/wishlist"
            className={buttonVariants({
              size: "lg",
              className: "px-8 text-base",
            })}
          >
            Sync wishlist alerts
          </Link>
          <Link
            href="/cart"
            className={buttonVariants({
              variant: "secondary",
              size: "lg",
              className: "bg-background/40 text-foreground",
            })}
          >
            Check out now
          </Link>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          <div className="space-y-1.5">
            <p className="text-muted-foreground text-xs tracking-[0.4em] uppercase">
              Styles live
            </p>
            <p className="text-3xl font-semibold">{saleProducts.length}</p>
            <p className="text-muted-foreground text-sm">
              rotating archive drops
            </p>
          </div>
          <div className="space-y-1.5">
            <p className="text-muted-foreground text-xs tracking-[0.4em] uppercase">
              Extra savings
            </p>
            <p className="text-3xl font-semibold">15%</p>
            <p className="text-muted-foreground text-sm">at checkout</p>
          </div>
          <div className="space-y-1.5">
            <p className="text-muted-foreground text-xs tracking-[0.4em] uppercase">
              Concierge
            </p>
            <p className="text-3xl font-semibold">Available</p>
            <p className="text-muted-foreground text-sm">for fit exchanges</p>
          </div>
        </div>
      </header>
      <section className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-muted-foreground text-xs tracking-[0.35em] uppercase">
              Archive grid
            </p>
            <h2 className="text-3xl font-semibold">Move fast—low stock</h2>
          </div>
          <Link
            href="/products?sale=true"
            className="text-sm font-semibold underline-offset-4 hover:underline"
          >
            View full archive
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {saleProducts.map((product) => {
            const referencePrice = Math.round(product.price * 1.2);
            return (
              <ProductShowcaseCard
                key={product.slug}
                product={product}
                variant="sale"
                href={`/products/${product.slug}`}
                referencePrice={referencePrice}
                promoLabel="Extra 15% in cart"
                secondaryActionHref="/cart"
                secondaryActionLabel="Go to cart"
              />
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default SalePage;
