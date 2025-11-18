import { ArrowUpRight, Sparkles } from "lucide-react";
import { redirect } from "next/navigation";
import { Locale } from "next-intl";

import { CollectionFilterChips } from "@/components/collection-filter-chips";
import { ProductShowcaseCard } from "@/components/product-showcase-card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { auth } from "@/lib/auth";
import {
  type Category,
  getBlogPosts,
  getStorefrontCollections,
  type Product,
} from "@/lib/data/storefront";
import { formatDate } from "@/lib/formatters";
import {
  type Locale as CopyLocale,
  makeCopy,
  translateCopy,
} from "@/lib/i18n/copy";

type TimelineEntry = {
  label: string;
  description: string;
};

type HeroStat = {
  label: string;
  value: string;
  helper: string;
};

type FeaturedProductTile = {
  product: Product;
  variant: "default" | "new" | "sale";
  highlight?: string;
  promoLabel?: string;
  referencePrice?: number;
};

const heroCopy = {
  badge: makeCopy({
    en: "Motion Lab · Drop 07",
    ms: "Makmal Gerakan · Drop 07",
  }),
  title: makeCopy({
    en: "Designing footwear for fast-moving lives.",
    ms: "Mereka kasut untuk gaya hidup pantas.",
  }),
  description: makeCopy({
    en: "Kuala Lumpur-born studio blending biomechanics and editorial storytelling. Every style ships with lab-tested foams, responsive midsoles, and cloud-soft uppers.",
    ms: "Studio kelahiran Kuala Lumpur yang menggabungkan biomekanik dan penceritaan editorial. Setiap gaya dihantar dengan busa diuji makmal, tapak responsif, dan bahagian atas selembut awan.",
  }),
  shipping: makeCopy({
    en: "Same-day pickup across Klang Valley.",
    ms: "Pengambilan hari sama sekitar Lembah Klang.",
  }),
  primaryCta: makeCopy({
    en: "Shop new arrivals",
    ms: "Lihat koleksi baharu",
  }),
  secondaryCta: makeCopy({
    en: "Explore studio journal",
    ms: "Teroka jurnal studio",
  }),
  statsTitle: makeCopy({
    en: "Live telemetry",
    ms: "Telemetri langsung",
  }),
  statsCaption: makeCopy({
    en: "Updated hourly from the product database.",
    ms: "Dikemas kini setiap jam daripada pangkalan data produk.",
  }),
  timelineHeading: makeCopy({
    en: "Studio agenda",
    ms: "Agenda studio",
  }),
  dropLabel: makeCopy({
    en: "Lab drop",
    ms: "Drop makmal",
  }),
  saleLabel: makeCopy({
    en: "Archive sale",
    ms: "Arkib jualan",
  }),
};

const heroStatLabels = {
  categories: makeCopy({
    en: "Live categories",
    ms: "Kategori aktif",
  }),
  newArrivals: makeCopy({
    en: "Fresh drops",
    ms: "Drop terbaharu",
  }),
  sale: makeCopy({
    en: "Styles on sale",
    ms: "Gaya dalam jualan",
  }),
};

const collectionsCopy = {
  badge: makeCopy({
    en: "Collections",
    ms: "Koleksi",
  }),
  title: makeCopy({
    en: "Category stories",
    ms: "Kisah kategori",
  }),
  description: makeCopy({
    en: "Editorial briefs for the most-requested studios this season.",
    ms: "Ringkasan editorial untuk studio paling dicari musim ini.",
  }),
  ctaLabel: makeCopy({
    en: "Open catalog",
    ms: "Buka katalog",
  }),
  cardCta: makeCopy({
    en: "View category",
    ms: "Lihat kategori",
  }),
  fallback: makeCopy({
    en: "Categories will appear here after you seed the catalog.",
    ms: "Kategori akan muncul di sini selepas katalog diisi.",
  }),
};

const productsSectionCopy = {
  badge: makeCopy({
    en: "Spotlight",
    ms: "Sorotan",
  }),
  title: makeCopy({
    en: "Featured lab picks",
    ms: "Pilihan makmal",
  }),
  description: makeCopy({
    en: "Silhouettes trending with our athletes and stylists this week.",
    ms: "Siluet pilihan atlet dan penata gaya kami minggu ini.",
  }),
  browseCta: makeCopy({
    en: "Browse catalog",
    ms: "Lihat katalog",
  }),
  fallback: makeCopy({
    en: "Products will appear here once your database is seeded.",
    ms: "Produk akan dipaparkan di sini selepas pangkalan data diisi.",
  }),
  ctaLabel: makeCopy({
    en: "View style",
    ms: "Lihat gaya",
  }),
  labHighlight: makeCopy({
    en: "Lab-certified cushioning",
    ms: "Kusyen disahkan makmal",
  }),
  stylingHighlight: makeCopy({
    en: "Styled for night commutes",
    ms: "Gaya untuk perjalanan malam",
  }),
  salePromo: makeCopy({
    en: "Archive drop",
    ms: "Drop arkib",
  }),
};

const storiesCopy = {
  badge: makeCopy({
    en: "Journal",
    ms: "Jurnal",
  }),
  title: makeCopy({
    en: "Stories from the studio",
    ms: "Cerita dari studio",
  }),
  description: makeCopy({
    en: "Field notes from choreographers, engineers, and friends testing the line.",
    ms: "Nota lapangan daripada koreografer, jurutera dan rakan yang menguji koleksi.",
  }),
  visitCta: makeCopy({
    en: "Visit blog",
    ms: "Lawat blog",
  }),
  fallback: makeCopy({
    en: "Publish a story to light up this strip.",
    ms: "Terbitkan cerita untuk menghidupkan ruang ini.",
  }),
};

const translate = (copy: ReturnType<typeof makeCopy>, locale: CopyLocale) =>
  translateCopy(copy, locale);

const numberFormatter = (locale: CopyLocale) =>
  new Intl.NumberFormat(locale === "ms" ? "ms-MY" : "en-US");

const formatHeroDropDetail = (locale: CopyLocale, count: number) => {
  const formatted = numberFormatter(locale).format(count);
  return locale === "ms"
    ? `${formatted} gaya baharu siap dihantar`
    : `${formatted} new styles ready to ship`;
};

const formatSaleDetail = (locale: CopyLocale, count: number) => {
  const formatted = numberFormatter(locale).format(count);
  return locale === "ms"
    ? `${formatted} gaya menikmati diskaun`
    : `${formatted} styles discounted now`;
};

const buildHeroStats = (
  men: Category[],
  women: Category[],
  newArrivals: Product[],
  sale: Product[],
  locale: CopyLocale,
): HeroStat[] => {
  const uniqueCategories = new Set<string>([
    ...men.map((category) => category.slug),
    ...women.map((category) => category.slug),
  ]);
  const format = numberFormatter(locale);

  return [
    {
      label: translate(heroStatLabels.categories, locale),
      value: format.format(uniqueCategories.size),
      helper:
        uniqueCategories.size === 1
          ? translate(
              makeCopy({
                en: "Category live",
                ms: "Kategori aktif",
              }),
              locale,
            )
          : translate(
              makeCopy({
                en: "Categories live",
                ms: "Kategori aktif",
              }),
              locale,
            ),
    },
    {
      label: translate(heroStatLabels.newArrivals, locale),
      value: format.format(newArrivals.length),
      helper: translate(
        makeCopy({
          en: "This week",
          ms: "Minggu ini",
        }),
        locale,
      ),
    },
    {
      label: translate(heroStatLabels.sale, locale),
      value: format.format(sale.length),
      helper: translate(
        makeCopy({
          en: "Archive styles",
          ms: "Gaya arkib",
        }),
        locale,
      ),
    },
  ];
};

const buildTimelineEntries = (
  men: Category[],
  women: Category[],
  newArrivals: Product[],
  sale: Product[],
  locale: CopyLocale,
): TimelineEntry[] => {
  const entries: TimelineEntry[] = [];
  if (men[0]) {
    entries.push({
      label: men[0].title,
      description: men[0].heroCopy,
    });
  }
  if (women[0]) {
    entries.push({
      label: women[0].title,
      description: women[0].heroCopy,
    });
  }
  if (newArrivals.length > 0) {
    entries.push({
      label: translate(heroCopy.dropLabel, locale),
      description: formatHeroDropDetail(locale, newArrivals.length),
    });
  }
  if (sale.length > 0) {
    entries.push({
      label: translate(heroCopy.saleLabel, locale),
      description: formatSaleDetail(locale, sale.length),
    });
  }
  return entries.slice(0, 4);
};

const buildFeaturedProductTiles = (
  newArrivals: Product[],
  sale: Product[],
  locale: CopyLocale,
): FeaturedProductTile[] => {
  const tiles: FeaturedProductTile[] = [];
  if (newArrivals[0]) {
    tiles.push({
      product: newArrivals[0],
      variant: "new",
      highlight: translate(productsSectionCopy.labHighlight, locale),
    });
  }
  if (newArrivals[1]) {
    tiles.push({
      product: newArrivals[1],
      variant: "default",
      highlight: translate(productsSectionCopy.stylingHighlight, locale),
    });
  }
  if (sale[0]) {
    tiles.push({
      product: sale[0],
      variant: "sale",
      promoLabel: translate(productsSectionCopy.salePromo, locale),
      referencePrice: Math.round(sale[0].price * 1.15 * 100) / 100,
    });
  }

  const seen = new Set<string>();
  return tiles.filter((tile) => {
    if (seen.has(tile.product.id)) {
      return false;
    }
    seen.add(tile.product.id);
    return true;
  });
};

const pickCategoriesForSpotlight = (
  men: Category[],
  women: Category[],
  limit = 3,
) => {
  const ordered = [...men.slice(0, 2), ...women.slice(0, 2)];
  const unique: Category[] = [];
  ordered.forEach((category) => {
    if (!unique.find((entry) => entry.slug === category.slug)) {
      unique.push(category);
    }
  });
  return unique.slice(0, limit);
};

const categoryHref = (category: Category) => {
  const audience = category.audience === "women" ? "women" : "men";
  return `/${audience}/${category.slug}`;
};

const BlogDate = ({ value, locale }: { value: string; locale: CopyLocale }) => (
  <span className="text-muted-foreground text-xs">
    {formatDate(value, {
      dateStyle: "medium",
      locale,
    })}
  </span>
);

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale: localeParam } = await params;
  const activeLocale = localeParam as CopyLocale;
  const session = await auth();

  if (session?.user && !session.user.isActive) {
    redirect(`/${activeLocale}/account/onboarding?notice=activation`);
  }

  const [{ men, women, newArrivals, sale }, blogPosts] = await Promise.all([
    getStorefrontCollections(),
    getBlogPosts(),
  ]);

  const heroStats = buildHeroStats(men, women, newArrivals, sale, activeLocale);
  const timelineEntries = buildTimelineEntries(
    men,
    women,
    newArrivals,
    sale,
    activeLocale,
  );
  const featuredProductTiles = buildFeaturedProductTiles(
    newArrivals,
    sale,
    activeLocale,
  );
  const spotlightCategories = pickCategoriesForSpotlight(men, women);
  const stories = blogPosts.slice(0, 3);

  return (
    <div className="space-y-16">
      <section className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <article className="via-background to-background rounded-[2.5rem] border bg-gradient-to-br from-indigo-500/10 p-8 shadow-sm">
          <Badge
            variant="outline"
            className="rounded-full px-4 py-1 text-[11px] tracking-[0.35em] uppercase"
          >
            {translate(heroCopy.badge, activeLocale)}
          </Badge>
          <h1 className="mt-6 text-4xl leading-tight font-semibold tracking-tight lg:text-5xl">
            {translate(heroCopy.title, activeLocale)}
          </h1>
          <p className="text-muted-foreground mt-6 text-base leading-relaxed lg:text-lg">
            {translate(heroCopy.description, activeLocale)}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/new-arrivals"
              className={buttonVariants({ size: "lg" })}
            >
              {translate(heroCopy.primaryCta, activeLocale)}
            </Link>
            <Link
              href="/blog"
              className={buttonVariants({ variant: "outline", size: "lg" })}
            >
              {translate(heroCopy.secondaryCta, activeLocale)}
            </Link>
          </div>
          <p className="text-muted-foreground mt-6 flex items-center gap-2 text-sm">
            <Sparkles className="size-4 text-indigo-500" />
            {translate(heroCopy.shipping, activeLocale)}
          </p>
        </article>

        <Card className="bg-background/90 rounded-[2rem] border">
          <CardHeader>
            <CardTitle className="text-muted-foreground text-sm font-semibold tracking-[0.35em] uppercase">
              {translate(heroCopy.statsTitle, activeLocale)}
            </CardTitle>
            <CardDescription>
              {translate(heroCopy.statsCaption, activeLocale)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {heroStats.map((stat) => (
              <div
                key={stat.label}
                className="flex items-center justify-between rounded-2xl border px-4 py-3"
              >
                <div>
                  <p className="text-muted-foreground text-xs font-semibold tracking-[0.35em] uppercase">
                    {stat.label}
                  </p>
                  <p className="text-muted-foreground text-sm">{stat.helper}</p>
                </div>
                <p className="text-3xl font-semibold">{stat.value}</p>
              </div>
            ))}
          </CardContent>
          {timelineEntries.length > 0 && (
            <CardContent className="border-t pt-6">
              <p className="text-muted-foreground text-xs font-semibold tracking-[0.35em] uppercase">
                {translate(heroCopy.timelineHeading, activeLocale)}
              </p>
              <div className="mt-4 space-y-4">
                {timelineEntries.map((entry) => (
                  <div
                    key={entry.label}
                    className="rounded-2xl border border-dashed px-4 py-3"
                  >
                    <p className="font-medium">{entry.label}</p>
                    <p className="text-muted-foreground text-sm">
                      {entry.description}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      </section>

      <CollectionFilterChips locale={activeLocale} className="mt-2" />

      <section className="space-y-6">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Badge
              variant="secondary"
              className="rounded-full px-4 py-1 text-[11px] tracking-[0.35em] uppercase"
            >
              {translate(collectionsCopy.badge, activeLocale)}
            </Badge>
            <h2 className="mt-4 text-3xl font-semibold">
              {translate(collectionsCopy.title, activeLocale)}
            </h2>
            <p className="text-muted-foreground mt-2 max-w-2xl">
              {translate(collectionsCopy.description, activeLocale)}
            </p>
          </div>
          <Link href="/men" className={buttonVariants({ variant: "ghost" })}>
            {translate(collectionsCopy.ctaLabel, activeLocale)}
          </Link>
        </header>

        {spotlightCategories.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {spotlightCategories.map((category) => (
              <article
                key={category.slug}
                className="bg-background/70 relative flex h-full flex-col rounded-3xl border p-6 shadow-sm"
              >
                <div className="text-muted-foreground flex items-center justify-between text-xs font-semibold tracking-[0.35em] uppercase">
                  <span>{category.audience}</span>
                  <span>{category.features.length} features</span>
                </div>
                <h3 className="mt-4 text-2xl font-semibold">
                  {category.title}
                </h3>
                <p className="text-muted-foreground mt-2 text-sm">
                  {category.heroCopy}
                </p>
                {category.features.length > 0 && (
                  <ul className="text-muted-foreground mt-4 space-y-1 text-sm">
                    {category.features.slice(0, 3).map((feature) => (
                      <li key={feature}>• {feature}</li>
                    ))}
                  </ul>
                )}
                <div className="mt-auto pt-6">
                  <Link
                    href={categoryHref(category)}
                    className={buttonVariants({
                      variant: "outline",
                      size: "sm",
                    })}
                  >
                    {translate(collectionsCopy.cardCta, activeLocale)}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent>
              <p className="text-muted-foreground">
                {translate(collectionsCopy.fallback, activeLocale)}
              </p>
            </CardContent>
          </Card>
        )}
      </section>

      <section className="space-y-6">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Badge
              variant="secondary"
              className="rounded-full px-4 py-1 text-[11px] tracking-[0.35em] uppercase"
            >
              {translate(productsSectionCopy.badge, activeLocale)}
            </Badge>
            <h2 className="mt-4 text-3xl font-semibold">
              {translate(productsSectionCopy.title, activeLocale)}
            </h2>
            <p className="text-muted-foreground mt-2 max-w-2xl">
              {translate(productsSectionCopy.description, activeLocale)}
            </p>
          </div>
          <Link
            href="/products"
            className={buttonVariants({ variant: "ghost" })}
          >
            {translate(productsSectionCopy.browseCta, activeLocale)}
          </Link>
        </header>

        {featuredProductTiles.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {featuredProductTiles.map((tile) => (
              <ProductShowcaseCard
                key={tile.product.id}
                product={tile.product}
                href={`/products/${tile.product.slug}`}
                variant={tile.variant}
                highlight={tile.highlight}
                promoLabel={tile.promoLabel}
                referencePrice={tile.referencePrice}
                ctaLabel={translate(productsSectionCopy.ctaLabel, activeLocale)}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent>
              <p className="text-muted-foreground">
                {translate(productsSectionCopy.fallback, activeLocale)}
              </p>
            </CardContent>
          </Card>
        )}
      </section>

      <section className="space-y-6">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Badge
              variant="secondary"
              className="rounded-full px-4 py-1 text-[11px] tracking-[0.35em] uppercase"
            >
              {translate(storiesCopy.badge, activeLocale)}
            </Badge>
            <h2 className="mt-4 text-3xl font-semibold">
              {translate(storiesCopy.title, activeLocale)}
            </h2>
            <p className="text-muted-foreground mt-2 max-w-2xl">
              {translate(storiesCopy.description, activeLocale)}
            </p>
          </div>
          <Link href="/blog" className={buttonVariants({ variant: "ghost" })}>
            {translate(storiesCopy.visitCta, activeLocale)}
          </Link>
        </header>

        {stories.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {stories.map((story) => (
              <Link
                key={story.slug}
                href={`/blog/${story.slug}`}
                className="group rounded-3xl border p-6 transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="text-muted-foreground flex items-center justify-between text-xs tracking-[0.35em] uppercase">
                  <span>{story.author}</span>
                  <BlogDate value={story.publishedAt} locale={activeLocale} />
                </div>
                <h3 className="group-hover:text-primary mt-4 text-2xl font-semibold">
                  {story.title}
                </h3>
                <p className="text-muted-foreground mt-2 text-sm">
                  {story.excerpt}
                </p>
                <div className="mt-6 inline-flex items-center text-sm font-semibold">
                  <span>{story.minutesToRead} min read</span>
                  <ArrowUpRight className="ml-2 size-4" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent>
              <p className="text-muted-foreground">
                {translate(storiesCopy.fallback, activeLocale)}
              </p>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
