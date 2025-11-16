import { notFound } from "next/navigation";

import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { getAllProducts, getProductBySlug } from "@/lib/data/storefront";

const ProductDetailPage = async ({ params }: { params: { slug: string } }) => {
  const product = await getProductBySlug(params.slug);

  if (!product) {
    notFound();
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr,0.9fr]">
      <section className="bg-muted/40 space-y-4 rounded-3xl border p-8">
        <p className="text-muted-foreground text-xs tracking-[0.4em] uppercase">
          {product.category}
        </p>
        <h1 className="text-4xl font-semibold">{product.title}</h1>
        <p className="text-muted-foreground">{product.description}</p>
        <div className="flex flex-wrap gap-3">
          {product.colors.map((color) => (
            <span
              key={color}
              className="rounded-full border px-3 py-1 text-xs font-semibold tracking-wide uppercase"
            >
              {color}
            </span>
          ))}
        </div>
      </section>
      <section className="space-y-6 rounded-3xl border p-8">
        <div>
          <p className="text-muted-foreground text-xs uppercase">Price</p>
          <p className="text-4xl font-semibold">${product.price}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs uppercase">Specs</p>
          <ul className="text-muted-foreground mt-3 space-y-1 text-sm">
            {product.specs.map((spec) => (
              <li key={spec}>• {spec}</li>
            ))}
          </ul>
        </div>
        <div className="flex flex-wrap gap-4">
          <Link href="/cart" className={buttonVariants({ size: "lg" })}>
            Add to cart
          </Link>
          <Link
            href="/wishlist"
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
            Save to wishlist
          </Link>
        </div>
        <p className="text-muted-foreground text-sm">
          Free shipping over $150. Free 30-day returns. Members receive restock
          alerts for saved sizes.
        </p>
      </section>
    </div>
  );
};

export const generateStaticParams = async () => {
  const catalog = await getAllProducts();
  return catalog.map((product) => ({ slug: product.slug }));
};

export default ProductDetailPage;
