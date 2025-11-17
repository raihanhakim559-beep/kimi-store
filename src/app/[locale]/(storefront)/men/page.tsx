import type { Metadata } from "next";

import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { getSeoMeta } from "@/lib/data/seo";
import { getStorefrontCollections } from "@/lib/data/storefront";
import { type Locale } from "@/lib/i18n/copy";

type MenShoesPageProps = {
  params: { locale: string };
};

export async function generateMetadata({
  params,
}: MenShoesPageProps): Promise<Metadata> {
  const locale = (params?.locale ?? routing.defaultLocale) as Locale;
  const seo = getSeoMeta("men", locale);

  return {
    title: seo.title,
    description: seo.description,
  };
}

const MenShoesPage = async () => {
  const { men: categories } = await getStorefrontCollections();
  const velocityFocus = categories[0];
  const featureCount = new Set(
    categories.flatMap((category) => category.features),
  ).size;

  const heroStats = [
    {
      label: "Velocity pods",
      value: `${categories.length}`,
      detail: "active lab edits",
    },
    {
      label: "Motion cues",
      value: `${featureCount}+`,
      detail: "traction • foam • breathability",
    },
    {
      label: "Prototype cadence",
      value: "Weekly",
      detail: "new drops from the motion lab",
    },
  ];

  return (
    <div className="space-y-16 pb-12">
      <header className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="relative overflow-hidden rounded-[2.75rem] border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-stone-900 p-10 text-white shadow-[0_25px_60px_rgba(15,23,42,0.45)]">
          <div className="pointer-events-none absolute inset-0 opacity-70">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.15),_transparent_70%)]" />
          </div>
          <div className="relative space-y-6">
            <p className="text-xs tracking-[0.5em] text-white/60 uppercase">
              Men · Motion lab
            </p>
            <h1 className="text-4xl leading-tight font-semibold md:text-5xl">
              Men’s footwear engineered for sustained velocity.
            </h1>
            <p className="text-base text-white/80 md:text-lg">
              Commute-ready sneakers, off-grid trainers, and recovery sandals
              that flex across brutal schedules. Every silhouette passes through
              traction rigs and foam compression labs before release.
            </p>
            <div className="flex flex-wrap gap-3 text-[11px] font-semibold tracking-[0.5em] text-white/70 uppercase">
              <span className="rounded-full border border-white/30 px-4 py-1">
                Impact foam
              </span>
              <span className="rounded-full border border-white/30 px-4 py-1">
                Breathable mesh
              </span>
              <span className="rounded-full border border-white/30 px-4 py-1">
                Carbon chassis
              </span>
            </div>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/new-arrivals"
                className={buttonVariants({
                  size: "lg",
                  className: "px-8 text-base",
                })}
              >
                See new velocity drops
              </Link>
              <Link
                href="/sale"
                className={buttonVariants({
                  variant: "secondary",
                  size: "lg",
                  className:
                    "bg-white/10 text-white backdrop-blur hover:bg-white/20",
                })}
              >
                Last-call archive
              </Link>
            </div>
            <dl className="grid gap-6 pt-2 sm:grid-cols-3">
              {heroStats.map((stat) => (
                <div key={stat.label} className="space-y-1.5">
                  <dt className="text-xs tracking-[0.4em] text-white/60 uppercase">
                    {stat.label}
                  </dt>
                  <dd className="text-3xl font-semibold">{stat.value}</dd>
                  <p className="text-sm text-white/70">{stat.detail}</p>
                </div>
              ))}
            </dl>
          </div>
        </div>
        {velocityFocus && (
          <div className="bg-card/70 rounded-[2.5rem] border p-8 shadow-sm">
            <p className="text-muted-foreground text-xs tracking-[0.35em] uppercase">
              Spotlight · {velocityFocus.title}
            </p>
            <h2 className="mt-3 text-3xl font-semibold">
              {velocityFocus.heroCopy}
            </h2>
            <p className="text-muted-foreground mt-4 text-sm leading-relaxed">
              {velocityFocus.description}
            </p>
            <ul className="text-muted-foreground mt-6 space-y-3 text-sm">
              {velocityFocus.features.slice(0, 4).map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <span className="bg-foreground/30 size-2 rounded-full" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <Link
              href={`/men/${velocityFocus.slug}`}
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold underline-offset-4 hover:underline"
            >
              Explore {velocityFocus.title}
            </Link>
          </div>
        )}
      </header>
      <section className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-muted-foreground text-xs tracking-[0.35em] uppercase">
              Lab categories
            </p>
            <h2 className="text-3xl font-semibold">Movement families</h2>
          </div>
          <Link
            href="/men"
            className="text-sm font-semibold underline-offset-4 hover:underline"
          >
            View all lab notes
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
                  href={`/men/${category.slug}`}
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

export default MenShoesPage;
