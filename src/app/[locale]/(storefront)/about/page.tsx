import { aboutContent } from "@/lib/data/storefront";

const AboutPage = () => {
  return (
    <div className="space-y-10">
      <header className="bg-muted/40 rounded-3xl border p-8">
        <p className="text-muted-foreground text-xs tracking-[0.4em] uppercase">
          About us
        </p>
        <h1 className="mt-4 text-4xl font-semibold">{aboutContent.hero}</h1>
        <p className="text-muted-foreground mt-4">
          Kimi Store Shoes is a Malaysia-born design lab crafting products for
          global city life. We combine biomechanics with expressive styling to
          make shoes that keep up with the calendar.
        </p>
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
