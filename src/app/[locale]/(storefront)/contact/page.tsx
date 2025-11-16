import { cmsPages } from "@/lib/data/storefront";

const ContactPage = () => {
  const contact = cmsPages.contact;

  return (
    <div className="space-y-10">
      <header className="bg-muted/50 rounded-3xl border p-8">
        <p className="text-muted-foreground text-xs tracking-[0.4em] uppercase">
          Contact
        </p>
        <h1 className="mt-4 text-4xl font-semibold">{contact.hero}</h1>
        <p className="text-muted-foreground mt-4">
          Response times average under 2 hours during service windows. Share
          your order number for faster routing.
        </p>
      </header>
      <section className="grid gap-6 md:grid-cols-3">
        {contact.channels.map((channel) => (
          <article key={channel.label} className="rounded-2xl border p-6">
            <p className="text-muted-foreground text-xs uppercase">
              {channel.label}
            </p>
            <p className="mt-2 text-xl font-semibold">{channel.value}</p>
            <p className="text-muted-foreground mt-2 text-sm">
              {channel.description}
            </p>
          </article>
        ))}
      </section>
    </div>
  );
};

export default ContactPage;
