import { notFound } from "next/navigation";

import { toggleWishlistItem } from "@/actions/wishlist";
import { AddToCartForm } from "@/components/add-to-cart-form";
import { ProductMediaGallery } from "@/components/product-media-gallery";
import { ProductShowcaseCard } from "@/components/product-showcase-card";
import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import {
  getProductDetailBySlug,
  getProductReviews,
} from "@/lib/data/storefront";

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(
    new Date(value),
  );

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const releaseDateFormatter = new Intl.DateTimeFormat("en", {
  month: "long",
  day: "numeric",
  year: "numeric",
});

type ProductDetailPageProps = {
  params: Promise<{ slug: string }>;
};

const ProductDetailPage = async ({ params }: ProductDetailPageProps) => {
  const { slug } = await params;
  const [product, reviews] = await Promise.all([
    getProductDetailBySlug(slug),
    getProductReviews(slug),
  ]);

  if (!product) {
    notFound();
  }

  const variantOptions = product.variants.map((variant) => ({
    id: variant.id,
    label:
      [variant.size, variant.color].filter(Boolean).join(" · ") || variant.size,
    stock: variant.stock,
    isDefault: variant.isDefault,
  }));

  const averageRating = reviews.length
    ? reviews.reduce((total, review) => total + review.rating, 0) /
      reviews.length
    : 0;
  const formattedPrice = currencyFormatter.format(product.price);
  const releaseLabel = releaseDateFormatter.format(
    new Date(product.createdAt ?? new Date()),
  );
  const specHighlights = product.specs.slice(0, 4);

  return (
    <div className="space-y-16 pb-16">
      <section className="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <div className="space-y-6">
          <div className="bg-card/80 rounded-[2.5rem] border p-8 shadow-sm">
            <p className="text-muted-foreground text-xs tracking-[0.5em] uppercase">
              {product.category} · Release {releaseLabel}
            </p>
            <h1 className="mt-4 text-4xl leading-tight font-semibold md:text-5xl">
              {product.title}
            </h1>
            <p className="text-muted-foreground mt-4 text-base leading-relaxed">
              {product.description}
            </p>
            <div className="text-muted-foreground mt-6 flex flex-wrap gap-3 text-[11px] font-semibold tracking-[0.45em] uppercase">
              {product.colors.map((color) => (
                <span key={color} className="rounded-full border px-4 py-1">
                  {color}
                </span>
              ))}
            </div>
          </div>
          <ProductMediaGallery media={product.media} title={product.title} />
          {specHighlights.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2">
              {specHighlights.map((spec) => (
                <div
                  key={spec}
                  className="bg-muted/40 rounded-2xl border p-4 shadow-inner"
                >
                  <p className="text-sm font-semibold">{spec}</p>
                  <p className="text-muted-foreground text-xs">
                    Motion lab certified
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
        <aside className="space-y-6 lg:sticky lg:top-24">
          <div className="bg-background/95 rounded-[2.5rem] border p-8 shadow-xl">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-muted-foreground text-xs tracking-[0.4em] uppercase">
                  Movement lab issue
                </p>
                <p className="text-4xl font-semibold">{formattedPrice}</p>
              </div>
              {reviews.length > 0 && (
                <div className="text-right">
                  <p className="text-3xl font-semibold">
                    {averageRating.toFixed(1)}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Avg. rating · {reviews.length}{" "}
                    {reviews.length === 1 ? "review" : "reviews"}
                  </p>
                </div>
              )}
            </div>
            <div className="mt-6 space-y-4">
              <AddToCartForm
                productSlug={product.slug}
                variantOptions={variantOptions}
                className="bg-muted/30 rounded-2xl border p-4"
              />
              <form action={toggleWishlistItem}>
                <input type="hidden" name="productSlug" value={product.slug} />
                <button
                  className={buttonVariants({
                    variant: "outline",
                    size: "lg",
                    className: "w-full",
                  })}
                >
                  Save to wishlist
                </button>
              </form>
            </div>
            <div className="text-muted-foreground mt-6 space-y-4 text-sm">
              <div className="rounded-2xl border p-4">
                <p className="text-foreground font-semibold">Fulfillment</p>
                <ul className="mt-2 space-y-1">
                  <li>• Free shipping over $150 USD.</li>
                  <li>• 30-day wear test with instant credit on return.</li>
                  <li>• Members receive saved-size restock alerts.</li>
                </ul>
              </div>
              <div className="rounded-2xl border p-4">
                <p className="text-foreground font-semibold">
                  Studio concierge
                </p>
                <ul className="mt-2 space-y-1">
                  <li>• Book fittings in Kuala Lumpur or Singapore.</li>
                  <li>• Same-day repairs for club members.</li>
                  <li>• Chat with stylists for sizing + styling help.</li>
                </ul>
                <Link
                  href="/contact"
                  className="mt-3 inline-flex text-sm font-semibold underline-offset-4 hover:underline"
                >
                  Contact concierge
                </Link>
              </div>
            </div>
          </div>
        </aside>
      </section>

      <section className="bg-card/80 space-y-6 rounded-[2.5rem] border p-8 shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-muted-foreground text-xs tracking-[0.35em] uppercase">
              Customer reviews
            </p>
            <h2 className="text-3xl font-semibold">Stories from wear tests</h2>
          </div>
          <p className="text-muted-foreground text-sm">
            {reviews.length} verified{" "}
            {reviews.length === 1 ? "review" : "reviews"}
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {reviews.map((review) => {
            const ratingValue = Math.max(1, Math.round(review.rating));
            return (
              <article
                key={review.id}
                className="bg-background/80 rounded-2xl border p-4"
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{review.author}</p>
                  <p className="text-muted-foreground text-xs">
                    {formatDate(review.createdAt)}
                  </p>
                </div>
                <p className="mt-1 text-sm text-yellow-500">
                  {"★".repeat(ratingValue)}
                  {"☆".repeat(Math.max(0, 5 - ratingValue))}
                </p>
                <h3 className="mt-2 text-lg font-semibold">
                  {review.headline}
                </h3>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                  {review.body}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      {product.related.length > 0 && (
        <section className="bg-card/80 space-y-6 rounded-[2.5rem] border p-8 shadow-sm">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-muted-foreground text-xs tracking-[0.35em] uppercase">
                Related styles
              </p>
              <h2 className="text-3xl font-semibold">
                More from the {product.category} lab
              </h2>
            </div>
            <Link
              href={`/search?category=${product.category}`}
              className="text-sm font-semibold underline-offset-4 hover:underline"
            >
              View collection
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {product.related.map((relatedProduct) => (
              <ProductShowcaseCard
                key={relatedProduct.slug}
                product={relatedProduct}
                href={`/products/${relatedProduct.slug}`}
                showWishlist={false}
                ctaLabel="View"
                badge="Related"
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export const dynamic = "force-dynamic";

export default ProductDetailPage;
