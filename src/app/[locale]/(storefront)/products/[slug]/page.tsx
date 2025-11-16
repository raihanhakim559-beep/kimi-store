import { notFound } from "next/navigation";

import { toggleWishlistItem } from "@/actions/wishlist";
import { AddToCartForm } from "@/components/add-to-cart-form";
import { ProductMediaGallery } from "@/components/product-media-gallery";
import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import {
  getAllProducts,
  getProductDetailBySlug,
  getProductReviews,
} from "@/lib/data/storefront";

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(
    new Date(value),
  );

const ProductDetailPage = async ({ params }: { params: { slug: string } }) => {
  const [product, reviews] = await Promise.all([
    getProductDetailBySlug(params.slug),
    getProductReviews(params.slug),
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

  return (
    <div className="space-y-10">
      <div className="grid gap-10 lg:grid-cols-[1.1fr,0.9fr]">
        <section className="space-y-6">
          <ProductMediaGallery media={product.media} title={product.title} />
          <div className="bg-muted/40 rounded-3xl border p-8">
            <p className="text-muted-foreground text-xs tracking-[0.4em] uppercase">
              {product.category}
            </p>
            <h1 className="mt-4 text-4xl font-semibold">{product.title}</h1>
            <p className="text-muted-foreground mt-4">{product.description}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              {product.colors.map((color) => (
                <span
                  key={color}
                  className="rounded-full border px-3 py-1 text-xs font-semibold tracking-wide uppercase"
                >
                  {color}
                </span>
              ))}
            </div>
            <ul className="text-muted-foreground mt-6 space-y-1 text-sm">
              {product.specs.map((spec) => (
                <li key={spec}>• {spec}</li>
              ))}
            </ul>
          </div>
        </section>
        <section className="space-y-6 rounded-3xl border p-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-xs uppercase">Price</p>
              <p className="text-4xl font-semibold">${product.price}</p>
            </div>
            {reviews.length > 0 && (
              <div className="text-right">
                <p className="text-xl font-semibold">
                  {averageRating.toFixed(1)}
                </p>
                <p className="text-muted-foreground text-xs">Avg. rating</p>
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-4">
            <AddToCartForm
              productSlug={product.slug}
              variantOptions={variantOptions}
              className="rounded-2xl border p-4"
            />
            <form action={toggleWishlistItem}>
              <input type="hidden" name="productSlug" value={product.slug} />
              <button
                className={buttonVariants({ variant: "outline", size: "lg" })}
              >
                Save to wishlist
              </button>
            </form>
          </div>
          <div className="rounded-2xl border p-4 text-sm">
            <p className="font-semibold">Fulfillment</p>
            <ul className="text-muted-foreground mt-2 space-y-1">
              <li>• Free shipping over $150 USD.</li>
              <li>• Free 30-day returns with instant credit.</li>
              <li>• Members receive restock alerts for saved sizes.</li>
            </ul>
          </div>
        </section>
      </div>

      <section className="space-y-6 rounded-3xl border p-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Customer reviews</h2>
          <p className="text-muted-foreground text-sm">
            {reviews.length} review{reviews.length === 1 ? "" : "s"}
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {reviews.map((review) => {
            const ratingValue = Math.max(1, Math.round(review.rating));
            return (
              <article key={review.id} className="rounded-2xl border p-4">
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
                <p className="text-muted-foreground mt-2 text-sm">
                  {review.body}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      {product.related.length > 0 && (
        <section className="space-y-6 rounded-3xl border p-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Related styles</h2>
            <p className="text-muted-foreground text-sm">
              Curated from the {product.category} collection
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {product.related.map((relatedProduct) => (
              <article
                key={relatedProduct.slug}
                className="rounded-2xl border p-6"
              >
                <p className="text-muted-foreground text-xs uppercase">
                  {relatedProduct.category}
                </p>
                <h3 className="mt-2 text-xl font-semibold">
                  {relatedProduct.title}
                </h3>
                <p className="text-muted-foreground mt-2 text-sm">
                  {relatedProduct.description}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-lg font-semibold">
                    ${relatedProduct.price}
                  </p>
                  <Link
                    href={`/products/${relatedProduct.slug}`}
                    className={buttonVariants({ size: "sm" })}
                  >
                    View
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export const generateStaticParams = async () => {
  const catalog = await getAllProducts();
  return catalog.map((product) => ({ slug: product.slug }));
};

export default ProductDetailPage;
