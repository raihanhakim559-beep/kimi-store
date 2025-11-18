import { and, eq } from "drizzle-orm";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { db, productImages } from "@/lib/schema";

const f = createUploadthing();

export const uploadRouter = {
  productImage: f({ image: { maxFileSize: "4MB", maxFileCount: 4 } })
    .input(
      z.object({
        productId: z.string().min(1),
        alt: z.string().max(120).optional(),
        markPrimary: z.boolean().optional(),
      }),
    )
    .middleware(async ({ input }) => {
      const session = await auth();
      if (!session?.user) {
        throw new UploadThingError("Unauthorized");
      }

      return {
        userId: session.user.id,
        productId: input.productId,
        alt: input.alt?.trim() || null,
        markPrimary: input.markPrimary ?? false,
      };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const existingPrimary = await db
        .select({ id: productImages.id })
        .from(productImages)
        .where(
          and(
            eq(productImages.productId, metadata.productId),
            eq(productImages.isPrimary, true),
          ),
        )
        .limit(1);

      const isFirstImage = existingPrimary.length === 0;
      const shouldBePrimary = metadata.markPrimary || isFirstImage;
      const nextPosition = shouldBePrimary ? 0 : Math.floor(Date.now() / 1000);

      if (shouldBePrimary && existingPrimary.length > 0) {
        await db
          .update(productImages)
          .set({ isPrimary: false })
          .where(eq(productImages.id, existingPrimary[0]!.id));
      }

      const [image] = await db
        .insert(productImages)
        .values({
          productId: metadata.productId,
          url: file.url,
          alt: metadata.alt ?? file.name ?? null,
          isPrimary: shouldBePrimary,
          position: nextPosition,
        })
        .returning();

      return {
        imageId: image.id,
        url: image.url,
        isPrimary: image.isPrimary,
      };
    }),
} satisfies FileRouter;

export type AppFileRouter = typeof uploadRouter;
