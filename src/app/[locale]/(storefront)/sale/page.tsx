import { buttonVariants } from "@/components/ui/button";
import { WishlistToggleButton } from "@/components/wishlist-toggle-button";
import { Link } from "@/i18n/navigation";
import { getStorefrontCollections } from "@/lib/data/storefront";

const SalePage = async () => {
  const { sale: saleProducts } = await getStorefrontCollections();

  return (
    <div className="space-y-10">
      <header className="rounded-3xl border bg-amber-50 p-8 dark:bg-amber-900/20">
        <p className="text-muted-foreground text-xs tracking-[0.4em] uppercase">
          Sale
        </p>
        <h1 className="mt-4 text-4xl font-semibold">Limited-time promos.</h1>
        <p className="text-muted-foreground mt-4">
          Move fast on final sizes and seasonal colorways. Prices automatically
          update in your cart.
        </p>
      </header>
      <section className="grid gap-6 md:grid-cols-2">
        {saleProducts.map((product) => (
          <article key={product.slug} className="rounded-2xl border p-6">
            <p className="text-muted-foreground text-xs uppercase">
              {product.category}
            </p>
            <h2 className="mt-2 text-2xl font-semibold">{product.title}</h2>
            <p className="text-muted-foreground mt-2">{product.description}</p>
            <div className="mt-4 flex items-baseline gap-3">
              <p className="text-2xl font-semibold text-rose-600 dark:text-rose-400">
                ${product.price}
              </p>
              <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold tracking-wide text-rose-600 uppercase dark:bg-rose-500/20 dark:text-rose-200">
                Extra 15% off at checkout
              </span>
            </div>
            <div className="mt-6 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <WishlistToggleButton productSlug={product.slug} />
                <Link
                  href={`/products/${product.slug}`}
                  className={buttonVariants({ size: "sm" })}
                >
                  View details
                </Link>
              </div>
              <Link
                href="/cart"
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                Go to cart
              </Link>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
};

export default SalePage;
