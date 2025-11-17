import { ContactForm } from "@/components/contact-form";
import { routing } from "@/i18n/routing";
import { getContactContent } from "@/lib/data/storefront/index";
import { type Locale } from "@/lib/i18n/copy";

type ContactPageProps = {
  params: Promise<{ locale: string }>;
};

const ContactPage = async ({ params }: ContactPageProps) => {
  const resolvedParams = await params;
  const locale = (resolvedParams?.locale ?? routing.defaultLocale) as Locale;
  const contact = await getContactContent(locale);

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
      <section className="grid gap-6 lg:grid-cols-[1fr,0.9fr]">
        <div className="space-y-4">
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
        </div>
        <div className="rounded-2xl border p-6">
          <h2 className="text-2xl font-semibold">Send a concierge request</h2>
          <p className="text-muted-foreground mt-2 text-sm">
            Response times average under 2 hours during service windows. Share
            fit or delivery context so we can route faster.
          </p>
          <div className="mt-6">
            <ContactForm />
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
