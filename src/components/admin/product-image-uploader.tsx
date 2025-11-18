"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { ProductUploadButton } from "@/lib/uploadthing";

type ProductImageUploaderProps = {
  productId: string;
  productName: string;
  coverImageUrl?: string | null;
  coverImageAlt?: string | null;
};

export const ProductImageUploader = ({
  productId,
  productName,
  coverImageUrl,
  coverImageAlt,
}: ProductImageUploaderProps) => {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle");

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="relative h-16 w-16 overflow-hidden rounded-xl border border-dashed border-white/20 bg-slate-900/70">
        {coverImageUrl ? (
          <Image
            src={coverImageUrl}
            alt={coverImageAlt ?? `${productName} preview`}
            fill
            className="object-cover"
            sizes="64px"
          />
        ) : (
          <span className="text-muted-foreground absolute inset-0 grid place-items-center text-center text-[10px] font-semibold uppercase">
            No image
          </span>
        )}
      </div>
      <ProductUploadButton
        endpoint="productImage"
        input={{ productId }}
        onUploadBegin={() => setStatus("uploading")}
        onClientUploadComplete={() => {
          setStatus("idle");
          router.refresh();
        }}
        onUploadError={(error) => {
          console.error("Failed to upload product image", error);
          setStatus("error");
        }}
        appearance={{
          button:
            "bg-white/90 text-slate-900 text-xs font-semibold px-3 py-1 rounded-lg hover:bg-white",
          container: "w-full flex justify-end",
          allowedContent: "hidden",
        }}
        content={{
          button: ({ ready }) => (ready ? "Upload" : "Hold on"),
        }}
      />
      <p className="text-[10px] text-slate-400">
        {status === "uploading"
          ? "Uploading…"
          : status === "error"
            ? "Upload failed"
            : "PNG/JPG up to 4MB"}
      </p>
    </div>
  );
};
