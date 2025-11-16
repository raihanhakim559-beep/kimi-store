import type { Metadata } from "next";

import { routing } from "@/i18n/routing";
import { getSeoMeta } from "@/lib/data/seo";
import { getAboutContent } from "@/lib/data/storefront";
import { type Locale } from "@/lib/i18n/copy";

type AboutPageProps = {
  params: { locale: string };
};

export async function generateMetadata({
  params,
}: AboutPageProps): Promise<Metadata> {
  const locale = (params?.locale ?? routing.defaultLocale) as Locale;
  const seo = getSeoMeta("about", locale);

  return {
    title: seo.title,
    description: seo.description,
  };
}

const AboutPage = ({ params }: AboutPageProps) => {
  const locale = (params?.locale ?? routing.defaultLocale) as Locale;
  const aboutContent = getAboutContent(locale);

  return (
    <div className="space-y-10">
      <header className="bg-muted/40 rounded-3xl border p-8">
        <p className="text-muted-foreground text-xs tracking-[0.4em] uppercase">
          {aboutContent.label}
        </p>
        <h1 className="mt-4 text-4xl font-semibold">{aboutContent.hero}</h1>
        <p className="text-muted-foreground mt-4">{aboutContent.description}</p>
      </header>
      <section className="grid gap-6 md:grid-cols-3">
        {aboutContent.pillars.map((pillar) => (
          <article key={pillar.title} className="rounded-2xl border p-6">
            <p className="text-muted-foreground text-xs uppercase">
              {pillar.title}
            </p>
            <p className="text-muted-foreground mt-3 text-sm">
              {pillar.detail}
            </p>
          </article>
        ))}
      </section>
    </div>
  );
};

export default AboutPage;
