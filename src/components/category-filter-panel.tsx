import type { ReactNode } from "react";

import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { countActiveFilters } from "@/lib/category-filter-utils";
import {
  type CategoryProductFacets,
  type CategoryProductFilters,
} from "@/lib/data/storefront";

const hasFacetOptions = (values: string[]) => values.length > 0;

const FilterSection = ({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) => (
  <div>
    <p className="text-muted-foreground text-xs font-semibold tracking-[0.3em] uppercase">
      {label}
    </p>
    <div className="mt-2 space-y-2">{children}</div>
  </div>
);

type CategoryFilterPanelProps = {
  filters: CategoryProductFilters;
  facets: CategoryProductFacets;
  resetHref: string;
};

export const CategoryFilterPanel = ({
  filters,
  facets,
  resetHref,
}: CategoryFilterPanelProps) => {
  const activeFilterCount = countActiveFilters(filters);

  return (
    <aside className="rounded-2xl border p-5">
      <form className="space-y-5" method="get">
        {hasFacetOptions(facets.sizes) && (
          <FilterSection label="Sizes">
            <div className="flex flex-wrap gap-2">
              {facets.sizes.map((size) => (
                <label
                  key={size}
                  className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs uppercase"
                >
                  <input
                    type="checkbox"
                    name="size"
                    value={size}
                    defaultChecked={filters.sizes?.includes(size)}
                  />
                  {size}
                </label>
              ))}
            </div>
          </FilterSection>
        )}
        {hasFacetOptions(facets.colors) && (
          <FilterSection label="Colors">
            <div className="flex flex-wrap gap-2">
              {facets.colors.map((color) => (
                <label
                  key={color}
                  className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs uppercase"
                >
                  <input
                    type="checkbox"
                    name="color"
                    value={color}
                    defaultChecked={filters.colors?.includes(color)}
                  />
                  {color}
                </label>
              ))}
            </div>
          </FilterSection>
        )}
        {hasFacetOptions(facets.tags) && (
          <FilterSection label="Tags">
            <div className="flex flex-wrap gap-2">
              {facets.tags.map((tag) => (
                <label
                  key={tag}
                  className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs uppercase"
                >
                  <input
                    type="checkbox"
                    name="tag"
                    value={tag}
                    defaultChecked={filters.tags?.includes(tag)}
                  />
                  {tag}
                </label>
              ))}
            </div>
          </FilterSection>
        )}
        <FilterSection label="Price">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <label className="space-y-1">
              <span className="text-muted-foreground uppercase">Min</span>
              <input
                type="number"
                name="priceMin"
                min={Math.floor(facets.price.min)}
                max={Math.ceil(facets.price.max)}
                defaultValue={filters.priceMin}
                className="w-full rounded-lg border px-2 py-1"
              />
            </label>
            <label className="space-y-1">
              <span className="text-muted-foreground uppercase">Max</span>
              <input
                type="number"
                name="priceMax"
                min={Math.floor(facets.price.min)}
                max={Math.ceil(facets.price.max)}
                defaultValue={filters.priceMax}
                className="w-full rounded-lg border px-2 py-1"
              />
            </label>
          </div>
        </FilterSection>
        <FilterSection label="Sort">
          <select
            name="sort"
            defaultValue={filters.sort ?? "featured"}
            className="bg-background w-full rounded-lg border px-3 py-2 text-sm"
          >
            <option value="featured">Trending first</option>
            <option value="newest">Newest</option>
            <option value="priceLow">Price: low to high</option>
            <option value="priceHigh">Price: high to low</option>
          </select>
        </FilterSection>
        <div className="flex flex-wrap gap-2">
          <button
            className={buttonVariants({ size: "sm", className: "flex-1" })}
          >
            Apply filters
          </button>
          <Link
            href={resetHref}
            className={buttonVariants({
              variant: "ghost",
              size: "sm",
              className: "flex-1",
            })}
          >
            Reset
          </Link>
        </div>
        <p className="text-muted-foreground text-xs">
          {activeFilterCount} active filter{activeFilterCount === 1 ? "" : "s"}
        </p>
      </form>
    </aside>
  );
};
