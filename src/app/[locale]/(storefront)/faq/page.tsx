import type { Metadata } from "next";

import { routing } from "@/i18n/routing";
import { getSeoMeta } from "@/lib/data/seo";
import { getFaqContent } from "@/lib/data/storefront";
import { type Locale } from "@/lib/i18n/copy";

type FaqPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: FaqPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const locale = (resolvedParams?.locale ?? routing.defaultLocale) as Locale;
  const seo = getSeoMeta("faq", locale);

  return {
    title: seo.title,
    description: seo.description,
  };
}

const FaqPage = async ({ params }: FaqPageProps) => {
  const resolvedParams = await params;
  const locale = (resolvedParams?.locale ?? routing.defaultLocale) as Locale;
  const faqContent = await getFaqContent(locale);

  return (
    <div className="space-y-10">
      <header className="bg-muted/40 rounded-3xl border p-8">
        <p className="text-muted-foreground text-xs tracking-[0.4em] uppercase">
          {faqContent.label}
        </p>
        <h1 className="mt-4 text-4xl font-semibold">{faqContent.title}</h1>
        <p className="text-muted-foreground mt-4">{faqContent.description}</p>
      </header>
      <section className="space-y-6">
        {faqContent.entries.map((item) => (
          <article key={item.question} className="rounded-2xl border p-6">
            <h2 className="text-xl font-semibold">{item.question}</h2>
            <p className="text-muted-foreground mt-2">{item.answer}</p>
          </article>
        ))}
      </section>
    </div>
  );
};

export default FaqPage;
