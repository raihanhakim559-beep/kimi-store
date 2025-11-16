import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { wishlistCopy } from "@/lib/data/storefront";

const WishlistPage = () => {
  return (
    <div className="space-y-10">
      <header className="bg-muted/50 rounded-3xl border p-8">
        <p className="text-muted-foreground text-xs tracking-[0.4em] uppercase">
          Wishlist
        </p>
        <h1 className="mt-4 text-4xl font-semibold">{wishlistCopy.empty}</h1>
        <p className="text-muted-foreground mt-4">
          Sign in to sync hearts across mobile and web. We’ll keep tabs on
          restocks in your sizes automatically.
        </p>
        <Link
          href="/account/login"
          className={buttonVariants({ className: "mt-6 w-fit" })}
        >
          Sign in to sync
        </Link>
      </header>
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
