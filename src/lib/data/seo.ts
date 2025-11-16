import { routing } from "@/i18n/routing";
import { type Locale, makeCopy, translateCopy } from "@/lib/i18n/copy";

export type SeoPageKey =
  | "about"
  | "faq"
  | "men"
  | "women"
  | "newArrivals"
  | "sale";

export type SeoMeta = {
  title: string;
  description: string;
};

const seoEntries: Record<
  SeoPageKey,
  {
    title: ReturnType<typeof makeCopy>;
    description: ReturnType<typeof makeCopy>;
  }
> = {
  about: {
    title: makeCopy({
      en: "About Kimi Store Shoes",
      ms: "Tentang Kimi Store Shoes",
    }),
    description: makeCopy({
      en: "Discover how our Malaysia-born design lab blends biomechanics and expressive styling for modern city life.",
      ms: "Ketahui bagaimana makmal reka bentuk kelahiran Malaysia ini menggabungkan biomekanik dan gaya ekspresif untuk kehidupan bandar moden.",
    }),
  },
  faq: {
    title: makeCopy({
      en: "Frequently Asked Questions",
      ms: "Soalan Lazim",
    }),
    description: makeCopy({
      en: "Shipping speeds, returns, and product care answers from the Kimi Store team.",
      ms: "Jawapan mengenai penghantaran, pemulangan, dan penjagaan produk daripada pasukan Kimi Store.",
    }),
  },
  men: {
    title: makeCopy({
      en: "Men's Shoes Engineered for Velocity",
      ms: "Kasut Lelaki Direka untuk Kelajuan",
    }),
    description: makeCopy({
      en: "Explore sneakers and training silhouettes tuned for commutes, studio sessions, and recovery days.",
      ms: "Terokai kasut dan siluet latihan yang disesuaikan untuk ulang-alik, sesi studio, dan hari pemulihan.",
    }),
  },
  women: {
    title: makeCopy({
      en: "Women's Footwear Tuned for Expression",
      ms: "Kasut Wanita untuk Ekspresi",
    }),
    description: makeCopy({
      en: "Lifestyle sneakers, studio-ready trainers, and heels that keep pace with packed schedules.",
      ms: "Kasut gaya hidup, kasut latihan, dan tumit yang seiring dengan jadual padat anda.",
    }),
  },
  newArrivals: {
    title: makeCopy({
      en: "New Arrivals from the Motion Lab",
      ms: "Koleksi Terbaru dari Makmal Gerakan",
    }),
    description: makeCopy({
      en: "Fresh silhouettes dropping weekly with experimental foams, recycled textiles, and bold palettes.",
      ms: "Siluet baharu setiap minggu dengan busa eksperimental, tekstil kitar semula, dan palet berani.",
    }),
  },
  sale: {
    title: makeCopy({
      en: "Sale Styles & Final Sizes",
      ms: "Jualan Gaya & Saiz Terakhir",
    }),
    description: makeCopy({
      en: "Limited-time promotions on lab-tested footwear with automatic cart savings.",
      ms: "Promosi terhad pada kasut diuji makmal dengan penjimatan automatik di troli.",
    }),
  },
};

export const getSeoMeta = (page: SeoPageKey, locale: Locale): SeoMeta => ({
  title: translateCopy(seoEntries[page].title, locale),
  description: translateCopy(seoEntries[page].description, locale),
});

export const getDefaultSeoMeta = (page: SeoPageKey): SeoMeta =>
  getSeoMeta(page, routing.defaultLocale);
