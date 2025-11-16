"use client";

import { Search } from "lucide-react";
import { useLocale } from "next-intl";
import { type FormEvent, useTransition } from "react";

import { useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type SearchBarProps = {
  className?: string;
  defaultValue?: string;
  size?: "compact" | "full";
  placeholder?: string;
};

export const SearchBar = ({
  className,
  defaultValue = "",
  size = "compact",
  placeholder = "Search products",
}: SearchBarProps) => {
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
};
