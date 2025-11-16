import type { Metadata } from "next";

import { CollectionFilterChips } from "@/components/collection-filter-chips";
import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { getSeoMeta } from "@/lib/data/seo";
import { getStorefrontCollections } from "@/lib/data/storefront";
import { type Locale } from "@/lib/i18n/copy";

type WomenShoesPageProps = {
  params: { locale: string };
};

export async function generateMetadata({
  params,
}: WomenShoesPageProps): Promise<Metadata> {
  const locale = (params?.locale ?? routing.defaultLocale) as Locale;
  const seo = getSeoMeta("women", locale);

  return {
    title: seo.title,
    description: seo.description,
  };
}

const WomenShoesPage = async ({ params }: WomenShoesPageProps) => {
  const locale = (params?.locale ?? routing.defaultLocale) as Locale;
  const { women: categories } = await getStorefrontCollections();

  return (
    <div className="space-y-10">
      <header className="rounded-3xl border bg-rose-50 p-8 dark:bg-rose-950/20">
        <p className="text-muted-foreground text-xs tracking-[0.4em] uppercase">
          Women
        </p>
        <h1 className="mt-4 text-4xl font-semibold">
          Women’s footwear tuned for expression.
        </h1>
        <p className="text-muted-foreground mt-4">
          Explore lifestyle sneakers, training-ready silhouettes, and heels that
          keep pace with packed schedules.
        </p>
        <div className="mt-6 flex flex-wrap gap-4">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/women/${category.slug}`}
              className={buttonVariants({ variant: "outline" })}
            >
              {category.title}
            </Link>
          ))}
        </div>
      </header>
      <CollectionFilterChips locale={locale} activeKey="women" />
      <section className="grid gap-6 md:grid-cols-3">
        {categories.map((category) => (
          <article key={category.slug} className="rounded-2xl border p-6">
            <p className="text-muted-foreground text-xs uppercase">
              {category.title}
            </p>
            <h2 className="mt-2 text-2xl font-semibold">{category.heroCopy}</h2>
            <p className="text-muted-foreground mt-3 text-sm">
              {category.description}
            </p>
            <ul className="text-muted-foreground mt-4 space-y-1 text-sm">
              {category.features.map((feature) => (
                <li key={feature}>• {feature}</li>
              ))}
            </ul>
            <Link
              href={`/women/${category.slug}`}
              className="mt-5 inline-flex items-center text-sm font-semibold underline-offset-4 hover:underline"
            >
              Explore {category.title}
            </Link>
          </article>
        ))}
      </section>
    </div>
  );
};

export default WomenShoesPage;
