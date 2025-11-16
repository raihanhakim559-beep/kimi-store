"use client";

import { ChangeEvent, useId } from "react";
import { useFormStatus } from "react-dom";

import { addToCart } from "@/actions/cart";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type VariantOption = {
  id: string;
  label: string;
  stock: number;
  isDefault?: boolean;
};

type AddToCartFormProps = {
  productSlug: string;
  maxQuantity?: number;
  className?: string;
  variantOptions?: VariantOption[];
};

const clampQuantity = (value: number, max: number) => {
  if (Number.isNaN(value) || value < 1) {
    return 1;
  }
  return Math.min(max, Math.floor(value));
};

export const AddToCartForm = ({
  productSlug,
  maxQuantity = 10,
  className,
  variantOptions,
}: AddToCartFormProps) => {
  const inputId = useId();
  const variantSelectId = useId();
  const hasVariants = (variantOptions?.length ?? 0) > 0;
  const defaultVariantId = hasVariants
    ? (variantOptions?.find((option) => option.isDefault && option.stock > 0)
        ?.id ??
      variantOptions?.find((option) => option.stock > 0)?.id ??
      variantOptions?.[0]?.id)
    : undefined;

  const handleQuantityChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = clampQuantity(Number(event.target.value), maxQuantity);
    if (nextValue !== Number(event.target.value)) {
      event.target.value = String(nextValue);
    }
  };

  return (
    <form
      action={addToCart}
      className={cn("flex flex-wrap items-end gap-3", className)}
    >
      <input type="hidden" name="productSlug" value={productSlug} />
      {hasVariants ? (
        <label
          className="flex flex-1 flex-col text-sm font-medium"
          htmlFor={variantSelectId}
        >
          Select size
          <select
            id={variantSelectId}
            name="variantId"
            required
            defaultValue={defaultVariantId}
            className="bg-background focus-visible:ring-ring mt-2 w-full rounded-xl border px-3 py-2 text-base shadow-sm focus-visible:ring-2 focus-visible:outline-none"
          >
            {variantOptions!.map((option) => (
              <option
                key={option.id}
                value={option.id}
                disabled={option.stock === 0}
              >
                {option.label}
                {option.stock === 0 ? " – Out of stock" : ""}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      <label className="flex flex-col text-sm font-medium" htmlFor={inputId}>
        Quantity
        <input
          id={inputId}
          name="quantity"
          type="number"
          min={1}
          max={maxQuantity}
          defaultValue={1}
          className="bg-background focus-visible:ring-ring mt-2 w-24 rounded-xl border px-3 py-2 text-base shadow-sm focus-visible:ring-2 focus-visible:outline-none"
          onChange={handleQuantityChange}
        />
      </label>
      <SubmitButton />
    </form>
  );
};

const SubmitButton = () => {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className={buttonVariants({ size: "lg" })}
      disabled={pending}
    >
      {pending ? "Adding…" : "Add to cart"}
    </button>
  );
};
