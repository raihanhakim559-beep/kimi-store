import {
  ArrowUpRight,
  Instagram,
  Linkedin,
  Twitter,
  Youtube,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Link } from "@/i18n/navigation";
import { storefrontNavLinks } from "@/lib/data/storefront/collections";

const socialLinks = [
  {
    label: "Instagram",
    href: "https://instagram.com/kimistudio",
    icon: Instagram,
  },
  { label: "Twitter", href: "https://twitter.com/kimistudio", icon: Twitter },
  { label: "YouTube", href: "https://youtube.com/@kimistudio", icon: Youtube },
  {
    label: "LinkedIn",
    href: "https://linkedin.com/company/kimistudio",
    icon: Linkedin,
  },
];

const labBadges = ["Motion Lab", "Material Lab", "Movement Club"];

type FooterLink = { label: string; href: string };
type FooterColumn = { title: string; links: FooterLink[] };

const footerColumns: FooterColumn[] = [
  { title: "Storefront", links: storefrontNavLinks.primary },
  {
    title: "Studio",
    links: [
      ...storefrontNavLinks.secondary,
      { label: "Contact studio", href: "/contact" },
      { label: "Account dashboard", href: "/account/dashboard" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Shipping & returns", href: "/faq" },
      { label: "Wishlist", href: "/wishlist" },
      { label: "Cart", href: "/cart" },
    ],
  },
];

export default function FooterStorefront() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background/95 text-foreground relative border-t">
      <div className="from-primary/10 absolute inset-x-0 top-0 -z-10 h-32 bg-gradient-to-b to-transparent" />
      <div className="container grid gap-12 py-16 lg:gap-16 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-[1.15fr,0.85fr]">
          <div className="space-y-5">
            <p className="text-muted-foreground text-xs tracking-[0.4em] uppercase">
              Kimi Studio
            </p>
            <h2 className="text-3xl leading-tight font-semibold lg:text-4xl">
              City equipment for restless people.
            </h2>
            <p className="text-muted-foreground text-base leading-relaxed">
              We prototype footwear with motion scientists, dancers, and
              commuters to keep pace with every sprint between trains and
              moonlit roam across the city.
            </p>
            <div className="text-muted-foreground flex flex-wrap gap-2 text-xs font-semibold tracking-[0.35em] uppercase">
              {labBadges.map((badge) => (
                <span key={badge} className="rounded-full border px-3 py-1">
                  {badge}
                </span>
              ))}
            </div>
          </div>
          <div className="from-background via-background to-muted/40 rounded-3xl border bg-gradient-to-br p-6 shadow-sm">
            <p className="text-muted-foreground text-xs font-semibold tracking-[0.4em] uppercase">
              Movement Club Dispatch
            </p>
            <h3 className="mt-3 text-2xl font-semibold">Weekly drop intel.</h3>
            <p className="text-muted-foreground mt-2 text-sm">
              Get invites to fittings, prototype try-ons, and early access to
              limited collaborations.
            </p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <Input
                type="email"
                placeholder="you@email.com"
                className="bg-background/80"
                aria-label="Email address"
              />
              <Button className="sm:min-w-[140px]">Join list</Button>
            </div>
            <p className="text-muted-foreground mt-2 text-xs">
              No spam. Unsubscribe anytime.
            </p>
          </div>
        </div>

        <Separator />

        <div className="grid gap-10 lg:grid-cols-3">
          {footerColumns.map((column) => (
            <div key={column.title}>
              <p className="text-muted-foreground text-xs tracking-[0.35em] uppercase">
                {column.title}
              </p>
              <ul className="mt-4 space-y-3 text-sm">
                {column.links.map((link) => (
                  <li key={`${column.title}-${link.href}`}>
                    <Link
                      href={link.href}
                      className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition"
                    >
                      {link.label}
                      <ArrowUpRight className="size-3" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator />

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p className="text-muted-foreground text-sm">
            © {currentYear} Kimi Studio. Engineered in Kuala Lumpur.
          </p>
          <div className="flex flex-wrap gap-3">
            {socialLinks.map(({ label, href, icon: Icon }) => (
              <Button
                key={label}
                asChild
                variant="ghost"
                size="icon"
                className="rounded-full border"
                aria-label={label}
              >
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                >
                  <Icon className="size-4" />
                </a>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
