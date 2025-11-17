import { NextResponse } from "next/server";

import { searchProducts } from "@/lib/data/storefront";

const MAX_LIMIT = 30;
const DEFAULT_LIMIT = 8;

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get("query") ?? "").trim();
  const limitParam = Number(searchParams.get("limit"));
  const limit = Number.isFinite(limitParam)
    ? Math.min(Math.max(Math.floor(limitParam), 1), MAX_LIMIT)
    : DEFAULT_LIMIT;

  if (!query) {
    return NextResponse.json({ results: [] });
  }

  const products = await searchProducts(query, limit);

  return NextResponse.json({
    results: products.map((product) => ({
      slug: product.slug,
      title: product.title,
      description: product.description,
      price: product.price,
      currency: product.currency,
      category: product.category,
      status: product.status ?? null,
    })),
  });
}
