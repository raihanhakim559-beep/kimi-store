import { render, screen } from "@testing-library/react";
import React from "react";

import { ProductShowcaseCard } from "@/components/product-showcase-card";
import type { Product } from "@/lib/data/storefront";

jest.mock("@/i18n/navigation", () => ({
  Link: ({ children, href, ...props }: React.ComponentProps<"a">) => (
    <a href={typeof href === "string" ? href : "#"} {...props}>
      {children}
    </a>
  ),
}));

jest.mock("@/components/wishlist-toggle-button", () => ({
  WishlistToggleButton: () => <div data-testid="wishlist-toggle" />,
}));

describe("ProductShowcaseCard", () => {
  const baseProduct: Product = {
    id: "prod_123",
    slug: "pulse",
    title: "Pulse Runner",
    description: "Ultra responsive daily trainer.",
    audience: "men",
    category: "Men",
    price: 180,
    currency: "USD",
    specs: ["Stability mesh", "Studio foam"],
    colors: ["Storm", "Quartz"],
    createdAt: new Date("2024-01-01"),
  };

  it("shows a fallback visual notice when no cover image is defined", () => {
    render(
      <ProductShowcaseCard
        product={baseProduct}
        href="/products/pulse"
        showWishlist={false}
      />,
    );

    expect(screen.getByText(/visual coming soon/i)).toBeInTheDocument();
  });

  it("renders the cover image when provided", () => {
    render(
      <ProductShowcaseCard
        product={{
          ...baseProduct,
          coverImage: {
            id: "img_1",
            url: "https://utfs.io/f/demo-image.jpg",
            alt: "Pulse runner hero",
            isPrimary: true,
          },
        }}
        href="/products/pulse"
        showWishlist={false}
      />,
    );

    expect(screen.getByAltText(/pulse runner hero/i)).toBeInTheDocument();
  });
});
