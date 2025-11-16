import { buttonVariants } from "@/components/ui/button";
import { WishlistToggleButton } from "@/components/wishlist-toggle-button";
import { Link } from "@/i18n/navigation";
import { getStorefrontCollections } from "@/lib/data/storefront";

const NewArrivalsPage = async () => {
  const { newArrivals: arrivals } = await getStorefrontCollections();

  return (
    <div className="space-y-10">
      <header className="rounded-3xl border bg-gradient-to-r from-indigo-600 to-sky-500 p-8 text-white">
        <p className="text-xs tracking-[0.4em] text-white/70 uppercase">
          New Arrivals
        </p>
        <h1 className="mt-4 text-4xl font-semibold">
          Fresh energy drops weekly.
        </h1>
        <p className="mt-4 text-white/80">
          Latest silhouettes from the lab featuring experimental foams, recycled
          textiles, and expressive palettes.
        </p>
        <Link
          href="/men"
          className={buttonVariants({
            variant: "secondary",
            className: "mt-6 w-fit",
          })}
        >
          Explore men’s shop
        </Link>
      </header>
      <section className="grid gap-6 md:grid-cols-2">
        {arrivals.map((product) => (
          <article key={product.slug} className="rounded-2xl border p-6">
            <p className="text-muted-foreground text-xs uppercase">
              {product.category}
            </p>
            <h2 className="mt-2 text-2xl font-semibold">{product.title}</h2>
            <p className="text-muted-foreground mt-2">{product.description}</p>
            <ul className="text-muted-foreground mt-4 space-y-1 text-sm">
              {product.specs.map((spec) => (
                <li key={spec}>• {spec}</li>
              ))}
            </ul>
            <div className="mt-6 flex items-center justify-between gap-3">
              <p className="text-2xl font-semibold">${product.price}</p>
              <div className="flex items-center gap-2">
                <WishlistToggleButton productSlug={product.slug} />
                <Link
                  href={`/products/${product.slug}`}
                  className={buttonVariants({ size: "sm" })}
                >
                  View product
                </Link>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
};

export default NewArrivalsPage;
