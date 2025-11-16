import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import {
  blogPosts,
  storefrontCollections,
  storefrontNavLinks,
} from "@/lib/data/storefront";

const HomePage = () => {
  const featuredBlog = blogPosts.slice(0, 2);

  return (
    <div className="space-y-16">
      <section className="grid gap-8 lg:grid-cols-[1.1fr,0.9fr]">
        <div className="rounded-3xl border bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-800 p-8 text-white shadow-lg">
          <p className="text-xs tracking-[0.4em] text-zinc-400 uppercase">
            2025 COLLECTION
          </p>
          <h1 className="mt-6 font-mono text-4xl leading-tight font-black md:text-5xl">
            Kinetic comfort engineered for city miles.
          </h1>
          <p className="mt-4 text-base text-zinc-200">
            Discover men’s and women’s footwear tuned for commutes, studio
            sessions, and late-night resets. Materials are responsibly sourced
            and validated by our motion lab.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/new-arrivals"
              className={buttonVariants({ size: "lg" })}
            >
              Shop new arrivals
            </Link>
            <Link
              href="/about"
              className={buttonVariants({ variant: "secondary", size: "lg" })}
            >
              Learn about Kimi
            </Link>
          </div>
        </div>
        <div className="bg-background rounded-3xl border p-8">
          <p className="text-muted-foreground text-xs uppercase">
            Shop by focus
          </p>
          <h2 className="mt-2 text-2xl font-semibold">Tailored sections</h2>
          <div className="mt-6 grid gap-4">
            {storefrontNavLinks.primary.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group hover:border-foreground flex items-center justify-between rounded-2xl border px-5 py-4 transition"
              >
                <div>
                  <p className="font-medium">{item.label}</p>
                  <p className="text-muted-foreground text-sm">
                    Explore curated drops for {item.label.toLowerCase()}.
                  </p>
                </div>
                <span className="text-muted-foreground text-lg transition group-hover:translate-x-1">
                  →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground text-xs tracking-[0.3em] uppercase">
              Men
            </p>
            <h2 className="text-2xl font-semibold">Movement-ready staples</h2>
          </div>
          <Link
            href="/men"
            className="text-sm font-semibold underline-offset-4 hover:underline"
          >
            Browse all
          </Link>
        </div>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {storefrontCollections.men.map((category) => (
            <Link
              key={category.slug}
              href={`/men/${category.slug}`}
              className="hover:border-foreground rounded-2xl border p-6 transition hover:-translate-y-1"
            >
              <p className="text-muted-foreground text-xs uppercase">
                {category.title}
              </p>
              <p className="mt-2 text-lg font-semibold">{category.heroCopy}</p>
              <ul className="text-muted-foreground mt-4 space-y-1 text-sm">
                {category.features.map((feature) => (
                  <li key={feature}>• {feature}</li>
                ))}
              </ul>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground text-xs tracking-[0.3em] uppercase">
              Women
            </p>
            <h2 className="text-2xl font-semibold">Studio to soirée</h2>
          </div>
          <Link
            href="/women"
            className="text-sm font-semibold underline-offset-4 hover:underline"
          >
            Browse all
          </Link>
        </div>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {storefrontCollections.women.map((category) => (
            <Link
              key={category.slug}
              href={`/women/${category.slug}`}
              className="hover:border-foreground rounded-2xl border p-6 transition hover:-translate-y-1"
            >
              <p className="text-muted-foreground text-xs uppercase">
                {category.title}
              </p>
              <p className="mt-2 text-lg font-semibold">{category.heroCopy}</p>
              <ul className="text-muted-foreground mt-4 space-y-1 text-sm">
                {category.features.map((feature) => (
                  <li key={feature}>• {feature}</li>
                ))}
              </ul>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-2">
        <div className="bg-muted/40 rounded-3xl border p-8">
          <p className="text-muted-foreground text-xs uppercase">
            Wishlist & perks
          </p>
          <h2 className="mt-2 text-3xl font-semibold">
            Sync favorites, track orders, repeat.
          </h2>
          <p className="text-muted-foreground mt-4">
            Creating an account unlocks order timelines, wishlist syncing, and
            early access drops.
          </p>
          <div className="mt-6 flex gap-4">
            <Link
              href="/account/login"
              className={buttonVariants({ size: "lg" })}
            >
              Sign in / Register
            </Link>
            <Link
              href="/wishlist"
              className={buttonVariants({ variant: "outline", size: "lg" })}
            >
              View wishlist
            </Link>
          </div>
        </div>
        <div className="bg-background rounded-3xl border p-8 shadow-sm">
          <p className="text-muted-foreground text-xs uppercase">
            Latest stories
          </p>
          <h2 className="mt-2 text-3xl font-semibold">Editorial dispatches</h2>
          <div className="mt-6 space-y-6">
            {featuredBlog.map((post) => (
              <article key={post.slug} className="space-y-2">
                <p className="text-muted-foreground text-xs uppercase">
                  {new Date(post.publishedAt).toLocaleDateString()} •{" "}
                  {post.minutesToRead} min read
                </p>
                <h3 className="text-xl font-semibold">{post.title}</h3>
                <p className="text-muted-foreground">{post.excerpt}</p>
                <Link
                  href={`/blog/${post.slug}`}
                  className="text-sm font-semibold underline-offset-4 hover:underline"
                >
                  Read article
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
