import { ArrowUpRight } from "lucide-react";

import { CollectionFilterChips } from "@/components/collection-filter-chips";
import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { getBlogPosts, getStorefrontCollections } from "@/lib/data/storefront";
import { type Locale } from "@/lib/i18n/copy";
import { cn } from "@/lib/utils";

const compactNumberFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const releaseDateFormatter = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
});

const formatCurrency = (value: number) => currencyFormatter.format(value);

const heroPills = [
  "Responsive foams",
  "Motion lab tuned",
  "Carbon-neutral shipping",
];

const serviceHighlights = [
  {
    title: "Motion concierge",
    copy: "Book 1:1 fittings or chat about sizing, break-in tips, and silhouettes.",
  },
  {
    title: "Extended wear tests",
    copy: "Keep prototypes for 30 days with free returns and instant credit.",
  },
  {
    title: "Same-day service",
    copy: "Kuala Lumpur & Singapore receive same-day repairs and delivery.",
  },
];

const HomePage = async ({
  params,
}: {
  params: Promise<{ locale: string }>;
}) => {
  const resolvedParams = await params;
  const locale = (resolvedParams?.locale ?? routing.defaultLocale) as Locale;
  const [collections, blogPosts] = await Promise.all([
    getStorefrontCollections(),
    getBlogPosts(),
  ]);
  const featuredEditorial = blogPosts.slice(0, 3);
  const dropSchedule = collections.newArrivals.slice(0, 3);
  const menHighlights = collections.men.slice(0, 2);
  const womenHighlights = collections.women.slice(0, 2);

  const heroStats = [
    {
      label: "Lab miles logged",
      value: `${compactNumberFormatter.format(
        Math.max(collections.men.length + collections.women.length, 1) * 180000,
      )}+`,
      detail: "per wear-test cycle",
    },
    {
      label: "Cities delivered",
      value: "62",
      detail: "global express network",
    },
    {
      label: "Movement club waitlist",
      value: `${compactNumberFormatter.format(
        42000 + collections.newArrivals.length * 900,
      )}`,
      detail: "members ready for the drop",
    },
  ];

  const movementIndex = [
    {
      title: "Men's velocity lab",
      description:
        "Foam-forward commuters and off-grid trainers tuned for miles.",
      href: "/men",
      stat: `${collections.men.length} curated paths`,
      badge: "Urban pace",
      tone: "dark" as const,
    },
    {
      title: "Women's studio set",
      description:
        "Sculptural trainers and sandals designed for studio-to-soirée.",
      href: "/women",
      stat: `${collections.women.length} edits`,
      badge: "Studio > soirée",
      tone: "light" as const,
    },
    {
      title: "Motion lab drops",
      description:
        "Weekly prototypes straight from the engineers and choreographers.",
      href: "/new-arrivals",
      stat: `${collections.newArrivals.length} new styles`,
      badge: "Drop 05",
      tone: "light" as const,
    },
    {
      title: "Archive / Sale",
      description: "Last-call samples plus limited recolors from our archive.",
      href: "/sale",
      stat: `${collections.sale.length} pieces`,
      badge: "Archive",
      tone: "dark" as const,
    },
  ];

  const categorySections = [
    {
      label: "Men",
      heading: "Velocity experiments",
      href: "/men",
      items: menHighlights,
    },
    {
      label: "Women",
      heading: "Studio choreography",
      href: "/women",
      items: womenHighlights,
    },
  ];

  const lookbookPanels = [
    {
      label: "Look 01",
      title: menHighlights[0]?.title ?? "Velocity two",
      copy:
        menHighlights[0]?.heroCopy ??
        "City-ready cushioning in obsidian and signal orange.",
      href: menHighlights[0] ? `/men/${menHighlights[0].slug}` : "/men",
      accent:
        "from-[#0f172a] via-[#312e81] to-[#4338ca] dark:from-[#111827] dark:via-[#1e1b4b] dark:to-[#312e81]",
    },
    {
      label: "Look 02",
      title: womenHighlights[0]?.title ?? "Studio shift",
      copy:
        womenHighlights[0]?.heroCopy ??
        "Sculptural heels with kinetic knit uppers.",
      href: womenHighlights[0] ? `/women/${womenHighlights[0].slug}` : "/women",
      accent:
        "from-[#f5d0fe] via-[#fbcfe8] to-[#fee2e2] text-foreground dark:from-[#f0abfc]/80 dark:via-[#f9a8d4]/60 dark:to-[#fecdd3]/40",
    },
    {
      label: "Look 03",
      title: featuredEditorial[0]?.title ?? "Editorial dispatch",
      copy:
        featuredEditorial[0]?.excerpt ??
        "Stories from material scientists and stylists testing in the field.",
      href: featuredEditorial[0]
        ? `/blog/${featuredEditorial[0].slug}`
        : "/blog",
      accent:
        "from-[#ecfccb] via-[#bef264] to-[#d9f99d] text-foreground dark:from-[#365314] dark:via-[#1a2e05] dark:to-[#365314]",
    },
  ];

  return (
    <div className="space-y-20 pb-12">
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="relative isolate overflow-hidden rounded-[2.75rem] border border-white/5 bg-gradient-to-br from-zinc-950 via-slate-900 to-stone-900 p-10 text-white shadow-[0_30px_70px_rgba(15,23,42,0.35)]">
          <div className="pointer-events-none absolute inset-0 opacity-70 mix-blend-screen">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.2),_transparent_65%)]" />
          </div>
          <div className="relative space-y-6">
            <p className="text-xs tracking-[0.5em] text-white/60 uppercase">
              Release 05 · 2025
            </p>
            <h1 className="text-4xl leading-tight font-semibold md:text-5xl">
              City equipment built for kinetic days and restless nights.
            </h1>
            <p className="text-base text-white/80 md:text-lg">
              The Kimi studio pairs motion scientists with choreographers to
              prototype footwear that flexes with every commute, studio
              rehearsal, and midnight roam.
            </p>
            <div className="flex flex-wrap gap-3 text-[11px] font-semibold tracking-[0.4em] text-white/70 uppercase">
              {heroPills.map((pill) => (
                <span
                  key={pill}
                  className="rounded-full border border-white/30 px-4 py-1"
                >
                  {pill}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/new-arrivals"
                className={buttonVariants({
                  size: "lg",
                  className: "px-8 text-base",
                })}
              >
                Shop new arrivals
              </Link>
              <Link
                href="/women"
                className={buttonVariants({
                  variant: "secondary",
                  size: "lg",
                  className:
                    "bg-white/15 text-white backdrop-blur hover:bg-white/25",
                })}
              >
                Women&rsquo;s edit
                <ArrowUpRight className="size-4" />
              </Link>
            </div>
            <dl className="grid gap-6 pt-4 sm:grid-cols-3">
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
        <div className="grid gap-6">
          <div className="bg-background/80 rounded-[2rem] border p-6 shadow-sm sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-muted-foreground text-xs tracking-[0.35em] uppercase">
                  Drop calendar
                </p>
                <h3 className="mt-2 text-2xl font-semibold">
                  Studio prototypes in flight
                </h3>
              </div>
              <Link
                href="/new-arrivals"
                className="text-muted-foreground hover:text-foreground text-sm font-semibold underline-offset-4 hover:underline"
              >
                View schedule
              </Link>
            </div>
            <div className="mt-6 space-y-4">
              {dropSchedule.length > 0 ? (
                dropSchedule.map((product) => (
                  <article
                    key={product.slug}
                    className="bg-card/60 flex items-center justify-between gap-4 rounded-2xl border px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-semibold">{product.title}</p>
                      <p className="text-muted-foreground text-xs">
                        {product.category} •{" "}
                        {product.colors.slice(0, 2).join(" / ")}
                      </p>
                    </div>
                    <div className="text-right text-sm font-semibold">
                      <p>{formatCurrency(product.price)}</p>
                      <p className="text-muted-foreground text-xs">
                        Ships{" "}
                        {releaseDateFormatter.format(
                          product.createdAt ?? new Date(),
                        )}
                      </p>
                    </div>
                  </article>
                ))
              ) : (
                <p className="text-muted-foreground text-sm">
                  New prototypes are being prepped. Check back tomorrow.
                </p>
              )}
            </div>
          </div>
          <div className="bg-muted/40 rounded-[2rem] border p-6 shadow-sm sm:p-8">
            <p className="text-muted-foreground text-xs tracking-[0.35em] uppercase">
              Membership
            </p>
            <h3 className="mt-2 text-2xl font-semibold">
              Wishlist sync & concierge fittings
            </h3>
            <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
              Unlock restock alerts, perpetual wishlists, and private previews
              with our stylists. Members also get early booking for pop-up
              fittings worldwide.
            </p>
            <div className="text-muted-foreground mt-4 flex flex-wrap gap-3 text-[11px] font-semibold tracking-[0.4em] uppercase">
              <span className="rounded-full border px-3 py-1">Size alerts</span>
              <span className="rounded-full border px-3 py-1">
                Concierge chat
              </span>
              <span className="rounded-full border px-3 py-1">Early drops</span>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/account/login"
                className={buttonVariants({ size: "lg" })}
              >
                Join the movement club
              </Link>
              <Link
                href="/wishlist"
                className={buttonVariants({
                  variant: "ghost",
                  size: "lg",
                  className: "text-sm font-semibold",
                })}
              >
                Sync wishlist
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-card/80 rounded-[2.5rem] border p-6 shadow-sm">
        <CollectionFilterChips locale={locale} />
      </section>

      <section className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-muted-foreground text-xs tracking-[0.35em] uppercase">
              Movement index
            </p>
            <h2 className="text-3xl font-semibold">Choose your flow</h2>
          </div>
          <Link
            href="/search"
            className="text-sm font-semibold underline-offset-4 hover:underline"
          >
            Search full catalog
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {movementIndex.map((item) => (
            <article
              key={item.title}
              className={cn(
                "rounded-[1.8rem] border p-6 transition hover:-translate-y-1",
                item.tone === "dark"
                  ? "border-zinc-800 bg-gradient-to-br from-zinc-950 via-slate-900 to-slate-900 text-white"
                  : "bg-muted/60",
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <span
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-semibold tracking-[0.4em] uppercase",
                    item.tone === "dark"
                      ? "border-white/30 text-white/80"
                      : "border-border text-muted-foreground",
                  )}
                >
                  {item.badge}
                </span>
                <span className="text-sm font-semibold">{item.stat}</span>
              </div>
              <h3 className="mt-4 text-2xl font-semibold">{item.title}</h3>
              <p
                className={cn(
                  "mt-3 text-sm leading-relaxed",
                  item.tone === "dark"
                    ? "text-white/80"
                    : "text-muted-foreground",
                )}
              >
                {item.description}
              </p>
              <Link
                href={item.href}
                className={cn(
                  "mt-6 inline-flex items-center gap-2 text-sm font-semibold",
                  item.tone === "dark"
                    ? "text-white hover:text-white/80"
                    : "text-foreground hover:text-foreground/80",
                )}
              >
                Shop collection
                <ArrowUpRight className="size-4" />
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.85fr)]">
        <div className="bg-card space-y-6 rounded-[2.5rem] border p-8 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-muted-foreground text-xs tracking-[0.35em] uppercase">
                Category research
              </p>
              <h2 className="mt-2 text-3xl font-semibold">Movement families</h2>
            </div>
            <Link
              href="/men"
              className="text-sm font-semibold underline-offset-4 hover:underline"
            >
              View lab notes
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {categorySections.map((section) => (
              <article
                key={section.label}
                className="bg-muted/30 rounded-3xl border p-6"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-muted-foreground text-xs tracking-[0.35em] uppercase">
                      {section.label}
                    </p>
                    <h3 className="mt-2 text-xl font-semibold">
                      {section.heading}
                    </h3>
                  </div>
                  <Link
                    href={section.href}
                    className="text-muted-foreground hover:text-foreground text-sm font-semibold underline-offset-4 hover:underline"
                  >
                    Shop
                  </Link>
                </div>
                <div className="mt-4 space-y-3">
                  {section.items.length > 0 ? (
                    section.items.map((category) => (
                      <Link
                        key={category.slug}
                        href={`/${section.label.toLowerCase()}/${category.slug}`}
                        className="group bg-background/70 hover:border-foreground/40 block rounded-2xl border px-4 py-3 transition"
                      >
                        <p className="text-sm font-semibold">
                          {category.title}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {category.heroCopy}
                        </p>
                      </Link>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      New categories in development.
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <div className="bg-background/80 rounded-[2rem] border p-6 shadow-sm">
            <p className="text-muted-foreground text-xs tracking-[0.35em] uppercase">
              Services
            </p>
            <div className="mt-4 space-y-4">
              {serviceHighlights.map((service) => (
                <article key={service.title} className="rounded-2xl border p-4">
                  <h3 className="text-lg font-semibold">{service.title}</h3>
                  <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                    {service.copy}
                  </p>
                </article>
              ))}
            </div>
          </div>
          <div className="bg-card/70 rounded-[2rem] border p-6 shadow-inner">
            <p className="text-muted-foreground text-xs tracking-[0.35em] uppercase">
              Lookbook
            </p>
            <div className="mt-5 grid gap-4">
              {lookbookPanels.map((panel) => (
                <Link
                  key={panel.label}
                  href={panel.href}
                  className={cn(
                    "relative overflow-hidden rounded-3xl border px-5 py-4 transition hover:-translate-y-1 hover:shadow-lg",
                    "bg-gradient-to-br",
                    panel.accent,
                  )}
                >
                  <p className="text-xs tracking-[0.4em] uppercase opacity-80">
                    {panel.label}
                  </p>
                  <h3 className="mt-2 text-xl font-semibold">{panel.title}</h3>
                  <p className="text-sm opacity-80">{panel.copy}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-muted-foreground text-xs tracking-[0.35em] uppercase">
              Editorial dispatches
            </p>
            <h2 className="text-3xl font-semibold">Stories from the lab</h2>
          </div>
          <Link
            href="/blog"
            className="text-sm font-semibold underline-offset-4 hover:underline"
          >
            Read the journal
          </Link>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {featuredEditorial.map((post) => (
            <article
              key={post.slug}
              className="bg-card/80 rounded-[1.75rem] border p-6"
            >
              <p className="text-muted-foreground text-xs tracking-[0.4em] uppercase">
                {releaseDateFormatter.format(new Date(post.publishedAt))} •{" "}
                {post.minutesToRead} min read
              </p>
              <h3 className="mt-3 text-2xl font-semibold">{post.title}</h3>
              <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
                {post.excerpt}
              </p>
              <Link
                href={`/blog/${post.slug}`}
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold underline-offset-4 hover:underline"
              >
                Read article
                <ArrowUpRight className="size-4" />
              </Link>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
