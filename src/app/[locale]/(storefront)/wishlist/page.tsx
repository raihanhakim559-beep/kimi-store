import { redirect } from "next/navigation";

import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { auth } from "@/lib/auth";
import { wishlistCopy } from "@/lib/data/storefront";
import { getWishlistEntries } from "@/lib/data/wishlist";

const WishlistPage = async () => {
  const session = await auth();

  if (!session) {
    redirect("/account/login");
  }

  const wishlistItems = await getWishlistEntries(session.user.id);
  const hasItems = wishlistItems.length > 0;

  return (
    <div className="space-y-10">
      <header className="bg-muted/50 rounded-3xl border p-8">
        <p className="text-muted-foreground text-xs tracking-[0.4em] uppercase">
          Wishlist
        </p>
        <h1 className="mt-4 text-4xl font-semibold">
          {session.user?.name?.split(" ")[0] ?? "Your"} saved pairs
        </h1>
        <p className="text-muted-foreground mt-4">
          Hearts sync across devices automatically. We’ll ping you when sizes
          restock or drop into promotions.
        </p>
      </header>

      {hasItems ? (
        <section className="grid gap-6 md:grid-cols-3">
          {wishlistItems.map((item) => (
            <article
              key={item.variantId}
              className="flex flex-col rounded-2xl border p-6"
            >
              <div>
                <p className="text-muted-foreground text-xs uppercase">
                  {item.category}
                </p>
                <h2 className="mt-2 text-xl font-semibold">{item.title}</h2>
                <p className="text-muted-foreground text-sm">
                  {item.description}
                </p>
                {(item.size || item.color) && (
                  <p className="text-muted-foreground mt-2 text-xs">
                    {item.size && <span>Size {item.size}</span>}
                    {item.color && (
                      <span className={item.size ? "ml-2" : undefined}>
                        Color {item.color}
                      </span>
                    )}
                  </p>
                )}
              </div>
              <div className="mt-4 flex items-center justify-between">
                <p className="text-lg font-semibold">${item.price}</p>
                <Link
                  href={`/products/${item.productSlug}`}
                  className={buttonVariants({ size: "sm" })}
                >
                  View
                </Link>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <section className="rounded-3xl border p-8 text-center">
          <p className="text-muted-foreground">{wishlistCopy.empty}</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/new-arrivals"
              className={buttonVariants({ size: "lg" })}
            >
              Explore new arrivals
            </Link>
            <Link
              href="/sale"
              className={buttonVariants({ variant: "outline", size: "lg" })}
            >
              Shop sale
            </Link>
          </div>
        </section>
      )}

      <section className="grid gap-4 md:grid-cols-3">
        {wishlistCopy.actions.map((tip) => (
          <article
            key={tip}
            className="text-muted-foreground rounded-2xl border p-6 text-sm"
          >
            {tip}
          </article>
        ))}
      </section>
    </div>
  );
};

export default WishlistPage;
