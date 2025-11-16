import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { getDashboardOverview } from "@/lib/data/storefront";

const AdminHomePage = async () => {
  const dashboardOverview = await getDashboardOverview();

  return (
    <div className="space-y-10">
      <header className="rounded-3xl border border-white/10 bg-white/5 p-8">
        <p className="text-xs tracking-[0.4em] text-slate-400 uppercase">
          Dashboard overview
        </p>
        <h1 className="mt-4 text-4xl font-semibold">
          Monitor the storefront pulse.
        </h1>
        <p className="mt-4 text-slate-300">
          Real-time KPIs with shortcuts into product, content, and customer
          pipelines. Data syncs from Stripe, Drizzle, and analytics every 5
          minutes.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/admin/orders"
            className={buttonVariants({ className: "bg-white text-slate-900" })}
          >
            View orders
          </Link>
          <Link
            href="/admin/products"
            className={buttonVariants({
              variant: "outline",
              className: "border-white/40 text-white",
            })}
          >
            Manage products
          </Link>
        </div>
      </header>
      <section className="grid gap-6 md:grid-cols-3">
        {dashboardOverview.stats.map((stat) => (
          <article
            key={stat.label}
            className="rounded-2xl border border-white/10 bg-white/5 p-6"
          >
            <p className="text-xs text-slate-400 uppercase">{stat.label}</p>
            <p className="mt-2 text-3xl font-semibold">{stat.value}</p>
            <p className="text-sm text-emerald-400">{stat.trend}</p>
          </article>
        ))}
      </section>
      <section className="rounded-3xl border border-white/10 bg-white/5 p-8">
        <h2 className="text-2xl font-semibold">Highlights</h2>
        <ul className="mt-4 space-y-3 text-slate-200">
          {dashboardOverview.highlights.map((highlight) => (
            <li key={highlight} className="flex items-center gap-3">
              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              {highlight}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default AdminHomePage;
