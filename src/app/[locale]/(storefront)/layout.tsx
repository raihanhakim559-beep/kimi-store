import FooterStorefront from "./footer";
import HeaderStorefront from "./header";

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-background text-foreground relative flex min-h-screen flex-col">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="from-muted/40 via-background to-background absolute inset-0 bg-gradient-to-b" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.25),_transparent_60%)]" />
        <div className="absolute inset-0 opacity-20" aria-hidden>
          <div className="bg-grid-white/10 absolute inset-0" />
        </div>
      </div>

      <HeaderStorefront />

      <main className="relative flex-1">
        <div className="container space-y-16 pt-12 pb-24 lg:space-y-20 lg:pt-16">
          {children}
        </div>
      </main>

      <FooterStorefront />
    </div>
  );
}
