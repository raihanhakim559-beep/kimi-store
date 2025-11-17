import { ArrowUpRight } from "lucide-react";

import { Link } from "@/i18n/navigation";
import {
  type CollectionKey,
  getCollectionChipGroups,
} from "@/lib/data/storefront";
import { type Locale } from "@/lib/i18n/copy";
import { cn } from "@/lib/utils";

type CollectionFilterChipsProps = {
  locale: Locale;
  activeKey?: CollectionKey;
  className?: string;
};

export const CollectionFilterChips = ({
  locale,
  activeKey,
  className,
}: CollectionFilterChipsProps) => {
  const groups = getCollectionChipGroups(locale);

  if (groups.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-6", className)}>
      {groups.map((group) => (
        <section key={group.label} className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-muted-foreground text-xs tracking-[0.35em] uppercase">
              {group.label}
            </p>
            <span className="text-muted-foreground/70 text-[11px] font-semibold tracking-[0.3em] uppercase">
              {group.chips.length} themes
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {group.chips.map((chip) => {
              const isActive = chip.key === activeKey;
              return (
                <Link
                  key={chip.key}
                  href={chip.href}
                  aria-pressed={isActive}
                  data-active={isActive}
                  className={cn(
                    "group bg-background/80 relative overflow-hidden rounded-[1.75rem] border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none sm:p-5",
                    isActive
                      ? "border-foreground from-foreground to-foreground/80 text-background focus-visible:ring-foreground bg-gradient-to-br"
                      : "border-border/70 focus-visible:ring-foreground/50",
                  )}
                >
                  <div
                    aria-hidden
                    className={cn(
                      "pointer-events-none absolute inset-0 opacity-0 transition",
                      "from-primary/40 to-accent/30 bg-gradient-to-br",
                      isActive && "opacity-20",
                    )}
                  />
                  <div className="relative space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <p
                        className={cn(
                          "text-sm font-semibold",
                          isActive ? "text-background" : "text-foreground",
                        )}
                      >
                        {chip.label}
                      </p>
                      <ArrowUpRight
                        className={cn(
                          "size-4 transition",
                          isActive
                            ? "text-background"
                            : "text-muted-foreground group-hover:text-foreground",
                        )}
                      />
                    </div>
                    <p
                      className={cn(
                        "text-xs leading-relaxed",
                        isActive
                          ? "text-background/80"
                          : "text-muted-foreground group-hover:text-foreground/80",
                      )}
                    >
                      {chip.description ?? "Explore the full collection."}
                    </p>
                    <span
                      className={cn(
                        "inline-flex items-center text-[11px] font-semibold tracking-[0.4em] uppercase",
                        isActive
                          ? "text-background/80"
                          : "text-muted-foreground/70",
                      )}
                    >
                      {chip.key.split("-").join(" ")}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
};
