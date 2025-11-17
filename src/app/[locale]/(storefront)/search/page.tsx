import type { Metadata } from "next";

import { SearchBar } from "@/components/search-bar";
import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { searchProducts } from "@/lib/data/storefront/index";
import { formatCurrency } from "@/lib/formatters";

const formatPrice = (value: number, currency = "USD") =>
  formatCurrency(value, {
    locale: "en-US",
    currency,
    maximumFractionDigits: 2,
  });

type SearchPageProps = {
  params?: Promise<{ locale: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const getQueryParam = (value?: string | string[]): string =>
  typeof value === "string" ? value : "";

export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const resolvedSearchParams = (await searchParams) ?? {};
  const query = getQueryParam(resolvedSearchParams.query);
  const baseTitle = "Search Kimi Store Shoes";

  if (!query) {
    return {
      title: baseTitle,
      description:
        "Look up men’s and women’s footwear, new arrivals, and sale styles across the full catalog.",
    };
  }

  return {
    title: `Results for "${query}" | Kimi Store Shoes`,
    description: `Browse footwear matches for ${query} including sneakers, heels, and recovery sandals.`,
  };
}

const SearchPage = async ({ searchParams }: SearchPageProps) => {
  const resolvedSearchParams = (await searchParams) ?? {};
  const query = getQueryParam(resolvedSearchParams.query).trim();
  const results = query ? await searchProducts(query, 60) : [];

  return (
    <div className="space-y-10">
      <header className="bg-muted/40 rounded-3xl border p-6">
        <p className="text-muted-foreground text-xs tracking-[0.4em] uppercase">
          Search
        </p>
        <h1 className="mt-3 text-3xl font-semibold">
          {query ? `Results for "${query}"` : "Find your next pair."}
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Surface products by name, tags, or material callouts. Filters for
          size, color, and price live on each category page.
        </p>
        <div className="mt-4">
          <SearchBar
            defaultValue={query}
            size="full"
            placeholder="Search sneakers, heels, sandals"
          />
        </div>
      </header>

      {!query ? (
        <div className="rounded-3xl border p-8 text-center">
          <p className="text-muted-foreground mb-4 text-sm">
            Try searching for styles like “Pulse Sync”, “leather”, or
            “waterproof commuter”.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {["Pulse Sync", "waterproof", "commuter", "heels"].map(
              (suggestion) => (
                <Link
                  key={suggestion}
                  href={`/search?query=${encodeURIComponent(suggestion)}`}
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  {suggestion}
                </Link>
              ),
            )}
          </div>
        </div>
      ) : results.length === 0 ? (
        <div className="rounded-3xl border p-8 text-center">
          <p className="text-lg font-semibold">No matches just yet.</p>
          <p className="text-muted-foreground mt-2">
            Adjust your keywords or try broader terms like a category, material,
            or product family.
          </p>
        </div>
      ) : (
        <section className="space-y-4">
          <div className="text-muted-foreground flex items-center justify-between text-sm">
            <span>
              {results.length} result{results.length === 1 ? "" : "s"}
            </span>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {results.map((product) => (
              <article key={product.slug} className="rounded-2xl border p-6">
                <p className="text-muted-foreground text-xs uppercase">
                  {product.category}
                </p>
                <h2 className="mt-2 text-2xl font-semibold">{product.title}</h2>
                <p className="text-muted-foreground mt-2 text-sm">
                  {product.description}
                </p>
                <ul className="text-muted-foreground mt-4 flex flex-wrap gap-2 text-xs uppercase">
                  {product.colors.slice(0, 3).map((color) => (
                    <li key={color} className="rounded-full border px-3 py-1">
                      {color}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 flex items-center justify-between">
                  <p className="text-lg font-semibold">
                    {formatPrice(product.price, product.currency)}
                  </p>
                  <Link
                    href={`/products/${product.slug}`}
                    className={buttonVariants({ size: "sm" })}
                  >
                    View details
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default SearchPage;
