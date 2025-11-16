import { notFound } from "next/navigation";

import { buttonVariants } from "@/components/ui/button";
import { WishlistToggleButton } from "@/components/wishlist-toggle-button";
import { Link } from "@/i18n/navigation";
import {
  getCategoriesByAudience,
  getCategoryBySlug,
  getProductsByCategory,
} from "@/lib/data/storefront";

const WomenCategoryPage = async ({
  params,
}: {
  params: { category: string };
}) => {
  const [category, categoryProducts] = await Promise.all([
    getCategoryBySlug(params.category),
    getProductsByCategory(params.category),
  ]);

  if (!category || category.audience !== "women") {
    notFound();
  }

  return (
    <div className="space-y-10">
      <header className="rounded-3xl border bg-gradient-to-br from-rose-100 to-amber-50 p-8 dark:from-pink-900/60 dark:to-rose-900/30">
        <p className="text-muted-foreground text-xs tracking-[0.4em] uppercase">
          {category.title}
        </p>
        <h1 className="mt-4 text-4xl font-semibold">{category.heroCopy}</h1>
        <p className="text-muted-foreground mt-4">{category.description}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          {category.features.map((feature) => (
            <span
              key={feature}
              className="rounded-full bg-white/70 px-3 py-1 text-xs tracking-wide uppercase dark:bg-black/30"
            >
              {feature}
            </span>
          ))}
        </div>
      </header>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Featured footwear</h2>
          <p className="text-muted-foreground text-sm">
            {categoryProducts.length} styles
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {categoryProducts.map((product) => (
            <article
              key={product.slug}
              className="flex flex-col justify-between rounded-2xl border p-6"
            >
              <div>
                <p className="text-muted-foreground text-xs tracking-[0.3em] uppercase">
                  {category.title}
                </p>
                <h3 className="mt-2 text-2xl font-semibold">{product.title}</h3>
                <p className="text-muted-foreground mt-2">
                  {product.description}
                </p>
                <ul className="text-muted-foreground mt-4 space-y-1 text-sm">
                  {product.specs.map((spec) => (
                    <li key={spec}>• {spec}</li>
                  ))}
                </ul>
              </div>
              <div className="mt-6 flex items-center justify-between gap-3">
                <div>
                  <p className="text-muted-foreground text-xs uppercase">
                    Starting at
                  </p>
                  <p className="text-xl font-semibold">${product.price}</p>
                </div>
                <div className="flex items-center gap-2">
                  <WishlistToggleButton productSlug={product.slug} />
                  <Link
                    href={`/products/${product.slug}`}
                    className={buttonVariants({ size: "sm" })}
                  >
                    View details
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export const generateStaticParams = async () => {
  const categories = await getCategoriesByAudience("women");
  return categories.map((category) => ({ category: category.slug }));
};

export default WomenCategoryPage;
