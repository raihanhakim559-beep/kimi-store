import type { Metadata } from "next";

import { ProductShowcaseCard } from "@/components/product-showcase-card";
import { buttonVariants } from "@/components/ui/button";
import { WishlistToggleButton } from "@/components/wishlist-toggle-button";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { getSeoMeta } from "@/lib/data/seo";
import { getStorefrontCollections } from "@/lib/data/storefront";
import { type Locale } from "@/lib/i18n/copy";

type NewArrivalsPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: NewArrivalsPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const locale = (resolvedParams?.locale ?? routing.defaultLocale) as Locale;
  const seo = getSeoMeta("newArrivals", locale);

  return {
    title: seo.title,
    description: seo.description,
  };
}

const NewArrivalsPage = async () => {
  const { newArrivals: arrivals } = await getStorefrontCollections();

  const featuredDrop = arrivals[0];
  const dateFormatter = new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  });

  return (
    <div className="space-y-16 pb-12">
      <header className="rounded-[2.75rem] border bg-gradient-to-br from-indigo-700 via-violet-600 to-sky-500 p-10 text-white shadow-[0_25px_60px_rgba(59,7,171,0.35)]">
        <p className="text-xs tracking-[0.5em] text-white/70 uppercase">
          New Arrivals · Drop 05
        </p>
        <h1 className="mt-4 text-4xl leading-tight font-semibold md:text-5xl">
          Fresh energy from the motion lab every Thursday.
        </h1>
        <p className="mt-4 text-base text-white/80 md:text-lg">
          Experimental foams, recycled textiles, and expressive palettes
          assembled by scientists, stylists, and choreographers.
        </p>
        <div className="mt-6 flex flex-wrap gap-3 text-[11px] font-semibold tracking-[0.4em] text-white/70 uppercase">
          <span className="rounded-full border border-white/30 px-4 py-1">
            Prototype
          </span>
          <span className="rounded-full border border-white/30 px-4 py-1">
            Wear test
          </span>
          <span className="rounded-full border border-white/30 px-4 py-1">
            Same-day ship
          </span>
        </div>
        <div className="mt-6 flex flex-wrap gap-4">
          <Link
            href="/men"
            className={buttonVariants({
              size: "lg",
              className: "px-8 text-base",
            })}
          >
            Explore men’s edits
          </Link>
          <Link
            href="/women"
            className={buttonVariants({
              variant: "secondary",
              size: "lg",
              className:
                "bg-white/10 text-white backdrop-blur hover:bg-white/20",
            })}
          >
            Women’s studio drops
          </Link>
        </div>
        <dl className="mt-8 grid gap-6 sm:grid-cols-3">
          <div className="space-y-1.5">
            <dt className="text-xs tracking-[0.4em] text-white/60 uppercase">
              Current queue
            </dt>
            <dd className="text-3xl font-semibold">{arrivals.length}</dd>
            <p className="text-sm text-white/70">styles in release</p>
          </div>
          <div className="space-y-1.5">
            <dt className="text-xs tracking-[0.4em] text-white/60 uppercase">
              Wear test hubs
            </dt>
            <dd className="text-3xl font-semibold">12</dd>
            <p className="text-sm text-white/70">cities feeding data</p>
          </div>
          <div className="space-y-1.5">
            <dt className="text-xs tracking-[0.4em] text-white/60 uppercase">
              Concierge status
            </dt>
            <dd className="text-3xl font-semibold">Live</dd>
            <p className="text-sm text-white/70">book fittings worldwide</p>
          </div>
        </dl>
      </header>
      {featuredDrop && (
        <section className="bg-card/80 grid gap-6 rounded-[2.5rem] border p-8 shadow-sm lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <div className="space-y-4">
            <p className="text-muted-foreground text-xs tracking-[0.35em] uppercase">
              Featured drop
            </p>
            <h2 className="text-3xl font-semibold">{featuredDrop.title}</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {featuredDrop.description}
            </p>
            <div className="text-muted-foreground/80 flex flex-wrap gap-2 text-[11px] font-semibold tracking-[0.35em] uppercase">
              {featuredDrop.colors.slice(0, 3).map((color) => (
                <span key={color} className="rounded-full border px-3 py-1">
                  {color}
                </span>
              ))}
            </div>
            <p className="text-muted-foreground text-sm">
              Ships {dateFormatter.format(new Date(featuredDrop.createdAt))}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href={`/products/${featuredDrop.slug}`}
                className={buttonVariants({ size: "lg" })}
              >
                View product
              </Link>
              <WishlistToggleButton productSlug={featuredDrop.slug} />
            </div>
          </div>
          <div className="bg-muted/40 rounded-[2rem] border p-6">
            <p className="text-muted-foreground text-xs tracking-[0.35em] uppercase">
              Lab notes
            </p>
            <ul className="text-muted-foreground mt-4 space-y-3 text-sm">
              {featuredDrop.specs.slice(0, 5).map((spec) => (
                <li key={spec} className="flex items-center gap-3">
                  <span className="bg-foreground/30 size-2 rounded-full" />
                  <span>{spec}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
      <section className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-muted-foreground text-xs tracking-[0.35em] uppercase">
              Release queue
            </p>
            <h2 className="text-3xl font-semibold">Shop the weekly drop</h2>
          </div>
          <Link
            href="/products"
            className="text-sm font-semibold underline-offset-4 hover:underline"
          >
            Browse full catalog
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {arrivals.map((product) => (
            <ProductShowcaseCard
              key={product.slug}
              product={product}
              variant="new"
              href={`/products/${product.slug}`}
              highlight={`Ships ${dateFormatter.format(
                new Date(product.createdAt ?? new Date()),
              )}`}
            />
          ))}
        </div>
      </section>
    </div>
  );
};

export default NewArrivalsPage;
