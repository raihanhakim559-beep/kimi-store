import { ReactNode } from "react";

import { buttonVariants } from "@/components/ui/button";
import { AdminModule } from "@/lib/data/storefront";

type AdminModuleTemplateProps = {
  module: AdminModule;
  emptyState?: ReactNode;
  children?: ReactNode;
};

export const AdminModuleTemplate = ({
  module,
  emptyState,
  children,
}: AdminModuleTemplateProps) => {
  return (
    <div className="space-y-8">
      <header className="rounded-3xl border border-white/10 bg-white/5 p-8">
        <p className="text-xs tracking-[0.4em] text-slate-400 uppercase">
          {module.title}
        </p>
        <h1 className="mt-4 text-4xl font-semibold">{module.description}</h1>
        <div className="mt-6 flex flex-wrap gap-3">
          {module.metrics.map((metric) => (
            <span
              key={metric}
              className="rounded-full border border-white/20 px-3 py-1 text-xs tracking-wide text-slate-200 uppercase"
            >
              {metric}
            </span>
          ))}
        </div>
        <button
          className={buttonVariants({
            className: "mt-6 bg-white text-slate-900",
          })}
        >
          {module.cta}
        </button>
      </header>
      <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
        {children ?? (
          <>
            <h2 className="text-xl font-semibold">Workflow queue</h2>
            <p className="mt-2 text-sm text-slate-300">
              Placeholder items showing how this management hub could look.
              Replace with live data once hooked to APIs.
            </p>
            <div className="mt-4 space-y-3">
              {emptyState || (
                <>
                  <div className="rounded-xl border border-white/10 bg-slate-900/40 p-4">
                    <p className="text-sm font-semibold">Pending review</p>
                    <p className="text-xs text-slate-400">
                      Assign teammates and lock approvals.
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-slate-900/40 p-4">
                    <p className="text-sm font-semibold">Automation rules</p>
                    <p className="text-xs text-slate-400">
                      Create triggers for low stock, draft content, or flagged
                      orders.
                    </p>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </section>
    </div>
  );
};
