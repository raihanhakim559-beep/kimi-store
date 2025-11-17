"use client";

import { Loader2, Search } from "lucide-react";
import { useLocale } from "next-intl";
import {
  type FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useRouter } from "@/i18n/navigation";
import { formatCurrency } from "@/lib/formatters";
import { cn } from "@/lib/utils";

type SearchBarProps = {
  className?: string;
  defaultValue?: string;
  size?: "compact" | "full";
  placeholder?: string;
  variant?: "form" | "command-button";
  commandButtonStyle?: "pill" | "icon";
};

type ProductSearchResult = {
  slug: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  status: string | null;
};

type SearchBarViewProps = {
  className?: string;
  defaultValue: string;
  size: "compact" | "full";
  placeholder: string;
};

export const SearchBar = (props: SearchBarProps) => {
  const {
    className,
    defaultValue = "",
    size = "compact",
    placeholder = "Search products",
    variant = "form",
    commandButtonStyle = "pill",
  } = props;

  if (variant === "command-button") {
    return (
      <SearchCommandButton
        className={className}
        defaultValue={defaultValue}
        size={size}
        placeholder={placeholder}
        styleVariant={commandButtonStyle}
      />
    );
  }

  return (
    <SearchForm
      className={className}
      defaultValue={defaultValue}
      size={size}
      placeholder={placeholder}
    />
  );
};

function SearchForm({
  className,
  defaultValue,
  size,
  placeholder,
}: SearchBarViewProps) {
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const rawQuery = (formData.get("query") as string | null)?.trim() ?? "";

    if (!rawQuery) {
      return;
    }

    startTransition(() => {
      router.push(
        { pathname: "/search", query: { query: rawQuery } },
        { locale },
      );
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "group relative flex items-center",
        size === "full" ? "w-full" : "max-w-md flex-1",
        className,
      )}
    >
      <Search className="text-muted-foreground pointer-events-none absolute left-3 h-4 w-4" />
      <input
        name="query"
        defaultValue={defaultValue}
        placeholder={placeholder}
        className={cn(
          "bg-background/80 focus-visible:border-foreground w-full rounded-full border py-2 pr-4 pl-10 text-sm transition focus-visible:outline-none",
          isPending && "opacity-70",
        )}
        aria-label="Search products"
      />
      <button
        type="submit"
        className="sr-only"
        aria-label="Submit search"
        disabled={isPending}
      >
        Search
      </button>
    </form>
  );
}

function SearchCommandButton({
  className,
  defaultValue,
  size,
  placeholder,
  styleVariant,
}: SearchBarViewProps & {
  styleVariant: "pill" | "icon";
}) {
  const locale = useLocale();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState(defaultValue);
  const [debouncedQuery, setDebouncedQuery] = useState(defaultValue);
  const [results, setResults] = useState<ProductSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isIconButton = styleVariant === "icon";
  const widthClass = !isIconButton
    ? size === "full"
      ? "w-full"
      : "max-w-md flex-1"
    : undefined;

  useEffect(() => {
    if (isOpen) {
      return;
    }
    queueMicrotask(() => {
      setQuery(defaultValue);
      setDebouncedQuery(defaultValue);
    });
  }, [defaultValue, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setDebouncedQuery(query);
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [query, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const trimmed = debouncedQuery.trim();
    if (!trimmed) {
      queueMicrotask(() => {
        setResults([]);
        setIsLoading(false);
        setError(null);
      });
      return;
    }

    const controller = new AbortController();
    queueMicrotask(() => {
      setIsLoading(true);
      setError(null);
    });

    fetch(`/api/search?query=${encodeURIComponent(trimmed)}&limit=8`, {
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to search products");
        }
        return response.json() as Promise<{ results: ProductSearchResult[] }>;
      })
      .then((payload) => {
        setResults(payload.results ?? []);
      })
      .catch((reason) => {
        if (reason?.name === "AbortError") {
          return;
        }
        setError("Something went wrong. Try again in a moment.");
      })
      .finally(() => {
        setIsLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, [debouncedQuery, isOpen]);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setIsOpen((previous) => !previous);
      }
    };

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  const formattedResults = useMemo(() => {
    return results.map((product) => ({
      ...product,
      formattedPrice: formatCurrency(product.price, {
        locale,
        currency: product.currency || "USD",
        maximumFractionDigits: 2,
      }),
    }));
  }, [results, locale]);

  const navigateToSearchPage = useCallback(
    (value: string) => {
      const trimmed = value.trim();
      if (!trimmed) {
        return;
      }
      setIsOpen(false);
      router.push(
        { pathname: "/search", query: { query: trimmed } },
        { locale },
      );
    },
    [locale, router],
  );

  const navigateToProduct = useCallback(
    (slug: string) => {
      if (!slug) {
        return;
      }
      setIsOpen(false);
      router.push({ pathname: `/products/${slug}` }, { locale });
    },
    [locale, router],
  );

  const currentLabel = query.trim() || placeholder;

  return (
    <>
      <Button
        type="button"
        variant={isIconButton ? "ghost" : "outline"}
        size={isIconButton ? "icon" : undefined}
        className={cn(
          isIconButton
            ? "rounded-full border"
            : "bg-background/80 hover:bg-background flex items-center gap-2 rounded-full border px-4 py-2 text-left text-sm",
          widthClass,
          className,
        )}
        onClick={() => setIsOpen(true)}
        aria-label="Open product search"
      >
        <Search className="size-4" />
        {isIconButton ? (
          <span className="sr-only">{placeholder}</span>
        ) : (
          <>
            <span className="text-muted-foreground flex-1 truncate">
              {currentLabel}
            </span>
            <kbd className="text-muted-foreground/80 hidden text-[0.7rem] font-medium lg:inline-flex">
              ⌘K
            </kbd>
          </>
        )}
      </Button>

      <CommandDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        title="Product search"
      >
        <CommandInput
          value={query}
          autoFocus
          onValueChange={setQuery}
          placeholder={placeholder}
        />
        <CommandList>
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-6 text-sm">
              <Loader2 className="size-4 animate-spin" />
              Searching products…
            </div>
          ) : null}
          <CommandEmpty>
            {error
              ? error
              : query.trim()
                ? "No products found."
                : "Start typing to search products."}
          </CommandEmpty>

          {formattedResults.length > 0 && (
            <CommandGroup heading="Products">
              {formattedResults.map((product) => (
                <CommandItem
                  key={product.slug}
                  value={`${product.title} ${product.category}`}
                  className="items-start gap-3"
                  onSelect={() => navigateToProduct(product.slug)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="leading-none font-medium">
                        {product.title}
                      </p>
                      {product.status ? (
                        <Badge
                          variant="outline"
                          className="text-[10px] uppercase"
                        >
                          {product.status}
                        </Badge>
                      ) : null}
                    </div>
                    <p className="text-muted-foreground text-xs">
                      {product.category}
                    </p>
                    <p className="text-muted-foreground mt-1 line-clamp-2 text-xs">
                      {product.description}
                    </p>
                  </div>
                  <span className="text-sm font-semibold">
                    {product.formattedPrice}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {query.trim() && (
            <CommandGroup heading="Actions">
              <CommandItem
                value={`View all results for ${query}`}
                onSelect={() => navigateToSearchPage(query)}
              >
                <Search className="size-4" />
                <span>View all results for &quot;{query.trim()}&quot;</span>
              </CommandItem>
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
