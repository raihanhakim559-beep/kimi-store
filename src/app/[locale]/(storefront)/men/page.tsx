import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { storefrontCollections } from "@/lib/data/storefront";

const MenShoesPage = () => {
  const categories = storefrontCollections.men;

  return (
    <div className="space-y-10">
      <header className="bg-muted/50 rounded-3xl border p-8">
        <p className="text-muted-foreground text-xs tracking-[0.4em] uppercase">
          Men
        </p>
        <h1 className="mt-4 text-4xl font-semibold">
          Men’s shoes built for velocity.
        </h1>
        <p className="text-muted-foreground mt-4">
          Browse sneakers, running silhouettes, and sandals engineered for
          recovery. Each category includes lab-tested foams and breathable
          uppers to keep you moving.
        </p>
        <div className="mt-6 flex flex-wrap gap-4">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/men/${category.slug}`}
              className={buttonVariants({ variant: "outline" })}
            >
              {category.title}
            </Link>
          ))}
        </div>
      </header>
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
              href={`/men/${category.slug}`}
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

export default MenShoesPage;
