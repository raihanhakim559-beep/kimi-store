import { ReactNode } from "react";

import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { adminModules } from "@/lib/data/storefront";

const AdminLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-50">
      <header className="border-b border-white/10 bg-slate-950/80">
        <div className="container flex h-16 items-center justify-between">
          <Link
            href="/admin"
            className="font-mono text-lg font-black tracking-[0.3em] uppercase"
          >
            Admin
          </Link>
          <div className="hidden gap-4 text-xs tracking-wide uppercase md:flex">
            {adminModules.map((module) => (
              <Link
                key={module.slug}
                href={`/admin/${module.slug}`}
                className="text-slate-400 hover:text-slate-50"
              >
                {module.title}
              </Link>
            ))}
          </div>
          <div className="flex gap-2">
            <Link
              href="/"
              className={buttonVariants({
                variant: "ghost",
                size: "sm",
                className: "text-slate-50",
              })}
            >
              View store
            </Link>
            <Link
              href="/admin/login"
              className={buttonVariants({
                size: "sm",
                className: "bg-white text-slate-900",
              })}
            >
              Sign out
            </Link>
          </div>
        </div>
      </header>
      <main className="flex flex-1 flex-col">
        <div className="container flex-1 space-y-10 py-10">{children}</div>
      </main>
      <footer className="border-t border-white/10 py-6 text-center text-xs tracking-[0.3em] text-slate-400 uppercase">
        Internal dashboard • Kimi Store Shoes
      </footer>
    </div>
  );
};

export default AdminLayout;
