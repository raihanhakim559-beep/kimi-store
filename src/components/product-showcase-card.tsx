import { type ReactNode } from "react";

import { buttonVariants } from "@/components/ui/button";
import { WishlistToggleButton } from "@/components/wishlist-toggle-button";
import { Link } from "@/i18n/navigation";
import { Product } from "@/lib/data/storefront/types";
import { formatCurrency } from "@/lib/formatters";
import { cn } from "@/lib/utils";

const formatPrice = (value: number, currency = "USD") =>
  formatCurrency(value, {
    locale: "en-US",
    currency,
    maximumFractionDigits: 0,
  });

type ProductShowcaseCardProps = {
  product: Product;
  href: string;
  className?: string;
  badge?: string;
  highlight?: string;
  promoLabel?: string;
  referencePrice?: number;
  variant?: "default" | "new" | "sale";
  showWishlist?: boolean;
  specsToShow?: number;
  colorsToShow?: number;
  ctaLabel?: string;
  secondaryActionHref?: string;
  secondaryActionLabel?: string;
  actionSlot?: ReactNode;
};

const cardVariants = {
  default: "bg-background/80",
  new: "bg-gradient-to-br from-indigo-50 via-white to-white dark:from-slate-950/60 dark:via-slate-900/40 dark:to-slate-900/30",
  sale: "bg-gradient-to-br from-rose-50 via-amber-50 to-white dark:from-rose-900/50 dark:via-amber-900/40 dark:to-orange-900/30",
};

export const ProductShowcaseCard = ({
  product,
  href,
  className,
  badge,
  highlight,
  promoLabel,
  referencePrice,
  variant = "default",
  showWishlist = true,
  specsToShow = 3,
  colorsToShow = 3,
  ctaLabel = "View product",
  secondaryActionHref,
  secondaryActionLabel,
  actionSlot,
}: ProductShowcaseCardProps) => {
  const cardBadge =
    badge ??
    (variant === "sale"
      ? "Final call"
      : variant === "new"
        ? "Drop"
        : "Featured");
  const specs = product.specs.slice(0, specsToShow);
  const colors = product.colors.slice(0, colorsToShow);
  const formattedPrice = formatPrice(product.price, product.currency);
  const formattedReferencePrice = referencePrice
    ? formatPrice(referencePrice, product.currency)
    : null;

  return (
    <article
      className={cn(
        "rounded-[1.9rem] border p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg",
        cardVariants[variant],
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-muted-foreground text-xs tracking-[0.35em] uppercase">
          {product.category}
        </p>
        <span className="text-muted-foreground/80 rounded-full border px-3 py-1 text-[11px] font-semibold tracking-[0.4em] uppercase">
          {cardBadge}
        </span>
      </div>
      <h3 className="mt-3 text-2xl font-semibold">{product.title}</h3>
      <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
        {product.description}
      </p>
      {specs.length > 0 && (
        <ul className="text-muted-foreground mt-4 space-y-2 text-sm">
          {specs.map((spec) => (
            <li key={spec}>• {spec}</li>
          ))}
        </ul>
      )}
      {colors.length > 0 && (
        <div className="text-muted-foreground/80 mt-4 flex flex-wrap gap-2 text-[11px] font-semibold tracking-[0.35em] uppercase">
          {colors.map((color) => (
            <span key={color} className="rounded-full border px-3 py-1">
              {color}
            </span>
          ))}
        </div>
      )}
      {highlight && (
        <p className="text-muted-foreground mt-4 text-xs tracking-[0.3em] uppercase">
          {highlight}
        </p>
      )}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <p
            className={cn(
              "text-2xl font-semibold",
              variant === "sale" ? "text-rose-600 dark:text-rose-300" : "",
            )}
          >
            {formattedPrice}
          </p>
          {formattedReferencePrice && (
            <p className="text-muted-foreground text-sm line-through">
              {formattedReferencePrice}
            </p>
          )}
          {promoLabel && (
            <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.35em] uppercase">
              {promoLabel}
            </p>
          )}
        </div>
        {actionSlot ?? (
          <div className="flex flex-wrap items-center gap-2">
            {showWishlist && (
              <WishlistToggleButton productSlug={product.slug} />
            )}
            <Link href={href} className={buttonVariants({ size: "sm" })}>
              {ctaLabel}
            </Link>
            {secondaryActionHref && secondaryActionLabel && (
              <Link
                href={secondaryActionHref}
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                {secondaryActionLabel}
              </Link>
            )}
          </div>
        )}
      </div>
    </article>
  );
};
