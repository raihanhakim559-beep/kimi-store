import { notFound } from "next/navigation";

import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import {
  getCategoryBySlug,
  getProductsByCategory,
  products,
} from "@/lib/data/storefront";

const MenCategoryPage = ({ params }: { params: { category: string } }) => {
  const category = getCategoryBySlug(params.category);

  if (!category || category.audience !== "men") {
    notFound();
  }

  const categoryProducts = getProductsByCategory(category.slug);

  return (
    <div className="space-y-10">
      <header className="rounded-3xl border bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 p-8 text-white">
        <p className="text-xs tracking-[0.4em] text-zinc-400 uppercase">
          {category.title}
        </p>
        <h1 className="mt-4 text-4xl font-semibold">{category.heroCopy}</h1>
        <p className="mt-4 text-zinc-200">{category.description}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          {category.features.map((feature) => (
            <span
              key={feature}
              className="rounded-full bg-white/10 px-3 py-1 text-xs tracking-wide uppercase"
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
              <div className="mt-6 flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-xs uppercase">
                    Starting at
                  </p>
                  <p className="text-xl font-semibold">${product.price}</p>
                </div>
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
    </div>
  );
};

export const generateStaticParams = () =>
  Array.from(
    new Set(
      products
        .filter((product) => product.audience === "men")
        .map((product) => product.category),
    ),
  ).map((category) => ({ category }));

export default MenCategoryPage;
