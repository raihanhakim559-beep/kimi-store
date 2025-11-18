import {
  generateUploadButton,
  generateUploadDropzone,
} from "@uploadthing/react";

import type { AppFileRouter } from "@/app/api/uploadthing/core";

export const ProductUploadButton = generateUploadButton<AppFileRouter>();
export const ProductUploadDropzone = generateUploadDropzone<AppFileRouter>();
