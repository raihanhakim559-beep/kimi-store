import { cmsPages } from "@/lib/data/storefront";

const FaqPage = () => {
  const faq = cmsPages.faq;

  return (
    <div className="space-y-10">
      <header className="bg-muted/40 rounded-3xl border p-8">
        <p className="text-muted-foreground text-xs tracking-[0.4em] uppercase">
          FAQ
        </p>
        <h1 className="mt-4 text-4xl font-semibold">
          Your top questions, answered.
        </h1>
        <p className="text-muted-foreground mt-4">
          Details about shipping, returns, and care. Need more support? Tap
          Contact for live help.
        </p>
      </header>
      <section className="space-y-6">
        {faq.map((item) => (
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
