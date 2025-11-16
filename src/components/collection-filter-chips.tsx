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
    <div className={cn("space-y-4", className)}>
      {groups.map((group) => (
        <div key={group.label} className="space-y-2">
          <p className="text-muted-foreground text-xs tracking-[0.3em] uppercase">
            {group.label}
          </p>
          <div className="flex flex-wrap gap-3">
            {group.chips.map((chip) => {
              const isActive = chip.key === activeKey;
              return (
                <Link
                  key={chip.key}
                  href={chip.href}
                  className={cn(
                    "group w-full rounded-2xl border px-4 py-3 text-left transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none md:w-auto",
                    isActive
                      ? "border-foreground/80 bg-foreground text-background focus-visible:ring-foreground"
                      : "border-border/60 bg-background text-foreground hover:border-foreground/60 focus-visible:ring-foreground/50",
                  )}
                >
                  <p
                    className={cn(
                      "text-sm font-semibold",
                      isActive ? "text-background" : "text-foreground",
                    )}
                  >
                    {chip.label}
                  </p>
                  <p
                    className={cn(
                      "text-xs leading-relaxed",
                      isActive
                        ? "text-background/80"
                        : "text-muted-foreground group-hover:text-foreground/80",
                    )}
                  >
                    {chip.description}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
