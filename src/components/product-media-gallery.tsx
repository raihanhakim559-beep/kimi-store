"use client";

import Image from "next/image";
import { useState } from "react";

import type { ProductImage } from "@/lib/data/storefront";
import { cn } from "@/lib/utils";

type ProductMediaGalleryProps = {
  media: ProductImage[];
  title: string;
};

export const ProductMediaGallery = ({
  media,
  title,
}: ProductMediaGalleryProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = media[activeIndex] ?? media[0];

  return (
    <div className="space-y-4">
      <div className="relative aspect-square overflow-hidden rounded-3xl border">
        <Image
          src={activeImage.url}
          alt={activeImage.alt ?? `${title} product image`}
          fill
          className="object-cover"
          sizes="(min-width: 1024px) 600px, 100vw"
          priority
        />
      </div>
      <div className="grid grid-cols-4 gap-3">
        {media.map((image, index) => (
          <button
            key={image.id}
            type="button"
            onClick={() => setActiveIndex(index)}
            className={cn(
              "relative aspect-square overflow-hidden rounded-2xl border",
              index === activeIndex
                ? "ring-foreground ring-2"
                : "opacity-80 hover:opacity-100",
            )}
            aria-label={`View image ${index + 1}`}
          >
            <Image
              src={image.url}
              alt={image.alt ?? `${title} thumbnail ${index + 1}`}
              fill
              className="object-cover"
              sizes="120px"
            />
          </button>
        ))}
      </div>
    </div>
  );
};
