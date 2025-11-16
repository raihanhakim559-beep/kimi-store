import { Heart } from "lucide-react";

import { toggleWishlistItem } from "@/actions/wishlist";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type WishlistToggleButtonProps = {
  productSlug: string;
  className?: string;
  label?: string;
};

export const WishlistToggleButton = ({
  productSlug,
  className,
  label = "Save to wishlist",
}: WishlistToggleButtonProps) => {
  return (
    <form action={toggleWishlistItem} className="inline-flex">
      <input type="hidden" name="productSlug" value={productSlug} />
      <button
        type="submit"
        aria-label={label}
        className={cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "hover:border-border rounded-full border border-transparent",
          className,
        )}
      >
        <Heart className="size-4" />
      </button>
    </form>
  );
};
