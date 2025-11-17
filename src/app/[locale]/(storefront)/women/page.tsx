import type { Metadata } from "next";

import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { getSeoMeta } from "@/lib/data/seo";
import { getStorefrontCollections } from "@/lib/data/storefront/index";
import { type Locale } from "@/lib/i18n/copy";

type WomenShoesPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: WomenShoesPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const locale = (resolvedParams?.locale ?? routing.defaultLocale) as Locale;
  const seo = getSeoMeta("women", locale);

  return {
    title: seo.title,
    description: seo.description,
  };
}

const WomenShoesPage = async () => {
  const { women: categories } = await getStorefrontCollections();
  const studioFocus = categories[0];
  const featureCount = new Set(
    categories.flatMap((category) => category.features),
  ).size;

  const heroStats = [
    {
      label: "Studio edits",
      value: `${categories.length}`,
      detail: "sculpted collections",
    },
    {
      label: "Material stories",
      value: `${featureCount}+`,
      detail: "knits • foams • recycled silks",
    },
    {
      label: "Appointments",
      value: "Concierge",
      detail: "book fittings worldwide",
    },
  ];

  return (
    <div className="space-y-16 pb-12">
      <header className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="text-foreground relative overflow-hidden rounded-[2.75rem] border border-white/10 bg-gradient-to-br from-rose-100 via-fuchsia-200 to-orange-100 p-10 shadow-[0_25px_60px_rgba(225,29,72,0.2)] dark:from-rose-900/60 dark:via-fuchsia-900/40 dark:to-orange-900/30">
          <div className="relative space-y-6">
            <p className="text-muted-foreground/80 text-xs tracking-[0.5em] uppercase">
              Women · Studio choreography
            </p>
            <h1 className="text-4xl leading-tight font-semibold md:text-5xl">
              Women’s footwear tuned for expression and endurance.
            </h1>
            <p className="text-muted-foreground text-base md:text-lg">
              Elevated trainers, sculptural heels, and studio-ready sandals
              designed to move from rehearsals to late dinners without a change
              bag.
            </p>
            <div className="text-muted-foreground/80 flex flex-wrap gap-3 text-[11px] font-semibold tracking-[0.5em] uppercase">
              <span className="border-foreground/20 rounded-full border px-4 py-1">
                Satin knit
              </span>
              <span className="border-foreground/20 rounded-full border px-4 py-1">
                Studio grip
              </span>
              <span className="border-foreground/20 rounded-full border px-4 py-1">
                Twilight chrome
              </span>
            </div>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/women"
                className={buttonVariants({
                  size: "lg",
                  className: "px-8 text-base",
                })}
              >
                Shop the studio edit
              </Link>
              <Link
                href="/wishlist"
                className={buttonVariants({
                  variant: "secondary",
                  size: "lg",
                  className: "bg-background/40 text-foreground",
                })}
              >
                Save looks
              </Link>
            </div>
            <dl className="grid gap-6 pt-2 sm:grid-cols-3">
              {heroStats.map((stat) => (
                <div key={stat.label} className="space-y-1.5">
                  <dt className="text-muted-foreground/80 text-xs tracking-[0.4em] uppercase">
                    {stat.label}
                  </dt>
                  <dd className="text-3xl font-semibold">{stat.value}</dd>
                  <p className="text-muted-foreground text-sm">{stat.detail}</p>
                </div>
              ))}
            </dl>
          </div>
        </div>
        {studioFocus && (
          <div className="bg-card/70 rounded-[2.5rem] border p-8 shadow-sm">
            <p className="text-muted-foreground text-xs tracking-[0.35em] uppercase">
              Spotlight · {studioFocus.title}
            </p>
            <h2 className="mt-3 text-3xl font-semibold">
              {studioFocus.heroCopy}
            </h2>
            <p className="text-muted-foreground mt-4 text-sm leading-relaxed">
              {studioFocus.description}
            </p>
            <ul className="text-muted-foreground mt-6 space-y-3 text-sm">
              {studioFocus.features.slice(0, 4).map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <span className="bg-foreground/30 size-2 rounded-full" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <Link
              href={`/women/${studioFocus.slug}`}
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold underline-offset-4 hover:underline"
            >
              Explore {studioFocus.title}
            </Link>
          </div>
        )}
      </header>
      <section className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-muted-foreground text-xs tracking-[0.35em] uppercase">
              Studio collections
            </p>
            <h2 className="text-3xl font-semibold">Movement stories</h2>
          </div>
          <Link
            href="/women"
            className="text-sm font-semibold underline-offset-4 hover:underline"
          >
            View all styles
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {categories.map((category, index) => (
            <article
              key={category.slug}
              className="bg-muted/40 rounded-[1.9rem] border p-6"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-muted-foreground text-xs tracking-[0.35em] uppercase">
                    {category.title}
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold">
                    {category.heroCopy}
                  </h3>
                </div>
                <span className="text-muted-foreground/80 rounded-full border px-3 py-1 text-[11px] font-semibold tracking-[0.4em] uppercase">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>
              <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
                {category.description}
              </p>
              <div className="text-muted-foreground/80 mt-4 flex flex-wrap gap-2 text-[11px] font-semibold tracking-[0.35em] uppercase">
                {category.features.slice(0, 4).map((feature) => (
                  <span key={feature} className="rounded-full border px-3 py-1">
                    {feature}
                  </span>
                ))}
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link
                  href={`/women/${category.slug}`}
                  className={buttonVariants({ size: "sm" })}
                >
                  Explore {category.title}
                </Link>
                <Link
                  href={`/products?category=${category.slug}`}
                  className="text-sm font-semibold underline-offset-4 hover:underline"
                >
                  View products
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default WomenShoesPage;
