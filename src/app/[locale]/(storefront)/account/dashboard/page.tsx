import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { getDashboardTimeline } from "@/lib/data/storefront/index";

const AccountDashboardPage = async () => {
  const dashboardTimeline = await getDashboardTimeline();
  return (
    <div className="space-y-10">
      <header className="bg-muted/50 rounded-3xl border p-8">
        <p className="text-muted-foreground text-xs tracking-[0.4em] uppercase">
          Dashboard
        </p>
        <h1 className="mt-4 text-4xl font-semibold">
          Track orders & wishlist signals.
        </h1>
        <p className="text-muted-foreground mt-4">
          Your latest orders, returns, and wishlist alerts land here. Use the
          quick actions to manage addresses and billing.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/wishlist"
            className={buttonVariants({ variant: "outline" })}
          >
            View wishlist
          </Link>
          <Link href="/checkout" className={buttonVariants({})}>
            Reorder essentials
          </Link>
        </div>
      </header>
      <section className="grid gap-6 md:grid-cols-2">
        <article className="rounded-2xl border p-6">
          <h2 className="text-xl font-semibold">Order timeline</h2>
          <div className="mt-4 space-y-4">
            {dashboardTimeline.map((event) => (
              <div key={event.title} className="bg-muted/60 rounded-xl p-4">
                <p className="text-sm font-semibold">{event.title}</p>
                <p className="text-muted-foreground text-sm">{event.detail}</p>
                <p className="text-muted-foreground text-xs">
                  {event.timestamp}
                </p>
              </div>
            ))}
          </div>
        </article>
        <article className="rounded-2xl border p-6">
          <h2 className="text-xl font-semibold">Quick actions</h2>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex items-center justify-between border-b pb-3">
              <span>Update shipping address</span>
              <button
                className={buttonVariants({ variant: "ghost", size: "sm" })}
              >
                Edit
              </button>
            </li>
            <li className="flex items-center justify-between border-b pb-3">
              <span>Manage payment methods</span>
              <button
                className={buttonVariants({ variant: "ghost", size: "sm" })}
              >
                Manage
              </button>
            </li>
            <li className="flex items-center justify-between">
              <span>Download invoices</span>
              <button
                className={buttonVariants({ variant: "ghost", size: "sm" })}
              >
                Download
              </button>
            </li>
          </ul>
        </article>
      </section>
    </div>
  );
};

export default AccountDashboardPage;
