import {
  getBlogPostBySlug,
  getCategoryBySlug,
  getProductBySlug,
  storefrontCollections,
} from "@/lib/data/storefront";

describe("storefront data map", () => {
  it("exposes men and women category collections", () => {
    expect(storefrontCollections.men).toHaveLength(3);
    expect(storefrontCollections.women).toHaveLength(3);
  });

  it("finds categories and products by slug", () => {
    expect(getCategoryBySlug("sneakers")?.audience).toBe("men");
    expect(getProductBySlug("zenith-form-heel")?.audience).toBe("women");
  });

  it("returns blog posts by slug", () => {
    expect(getBlogPostBySlug("tempo-training-reset")?.minutesToRead).toBe(8);
  });
});
