import { redirect } from "next/navigation";

import { createCheckoutSession } from "@/actions/checkout";
import { buttonVariants } from "@/components/ui/button";
import { getCartSummary } from "@/lib/cart";
import { checkoutSteps } from "@/lib/data/storefront";

const formatMoney = (amountInCents: number, currency: string) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amountInCents / 100);

type CheckoutPageProps = {
  params: { locale: string };
  searchParams?: Record<string, string | string[] | undefined>;
};

const CheckoutPage = async ({ params, searchParams }: CheckoutPageProps) => {
  const locale = params?.locale ?? "en";
  const { cart, items, totals } = await getCartSummary();

  if (items.length === 0) {
    redirect(`/${locale}/cart`);
  }

  const currency = cart?.currency ?? "USD";
  const discountValue = cart?.discountTotal ?? 0;

  const hasSuccessState = searchParams?.success === "1";
  const hasCancelState = searchParams?.cancelled === "1";

  return (
    <div className="space-y-8">
      <header className="bg-muted/40 rounded-3xl border p-8">
        <p className="text-muted-foreground text-xs tracking-[0.4em] uppercase">
          Checkout
        </p>
        <h1 className="mt-4 text-4xl font-semibold">Secure checkout</h1>
        <p className="text-muted-foreground mt-4">
          Complete the four-step flow, then confirm payment with Stripe. You can
          still edit addresses and delivery windows on the hosted payment page.
        </p>
      </header>
      {(hasSuccessState || hasCancelState) && (
        <div
          className={`rounded-2xl border p-4 text-sm ${hasSuccessState ? "border-green-200 bg-green-50 text-green-900" : "border-destructive/30 bg-destructive/10 text-destructive"}`}
        >
          {hasSuccessState
            ? "Payment confirmed. We're processing your order and will email tracking shortly."
            : "Payment attempt cancelled. You can try again or review your cart before submitting."}
        </div>
      )}
      <div className="grid gap-8 lg:grid-cols-[1.1fr,0.9fr]">
        <section className="space-y-6">
          <div className="rounded-3xl border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-xs uppercase">Flow</p>
                <h2 className="text-2xl font-semibold">4 guided steps</h2>
              </div>
              <p className="text-muted-foreground text-sm">
                Shipping is free over $150.
              </p>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {checkoutSteps.map((step, index) => (
                <article key={step} className="rounded-2xl border p-4">
                  <p className="text-muted-foreground text-xs uppercase">
                    Step {index + 1}
                  </p>
                  <h3 className="mt-2 font-semibold">{step}</h3>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {index < 2
                      ? "Pre-fill saved addresses or add new details."
                      : index === 2
                        ? "Select card, Apple Pay, or Google Pay on Stripe."
                        : "Review totals and place your order."}
                  </p>
                </article>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-xs uppercase">Items</p>
                <h2 className="text-2xl font-semibold">Order contents</h2>
              </div>
              <p className="text-muted-foreground text-sm">
                {items.length} {items.length === 1 ? "item" : "items"}
              </p>
            </div>
            <div className="mt-6 space-y-4">
              {items.map((item) => (
                <article
                  key={item.id}
                  className="flex flex-col gap-3 rounded-2xl border p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="text-muted-foreground text-xs uppercase">
                      {item.category}
                    </p>
                    <h3 className="text-lg font-semibold">{item.title}</h3>
                    <p className="text-muted-foreground text-sm">
                      {item.description ?? ""}
                    </p>
                    <p className="text-muted-foreground mt-2 text-xs uppercase">
                      Qty {item.quantity}
                      {item.size && (
                        <span className="ml-3">Size {item.size}</span>
                      )}
                      {item.color && (
                        <span className="ml-3">Color {item.color}</span>
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-muted-foreground text-xs uppercase">
                      Line total
                    </p>
                    <p className="text-xl font-semibold">
                      {formatMoney(item.lineTotal, currency)}
                    </p>
                    <p className="text-muted-foreground mt-1 text-xs">
                      {formatMoney(item.unitPrice, currency)} each
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
        <aside className="space-y-6 rounded-3xl border p-6">
          <div>
            <p className="text-muted-foreground text-xs uppercase">Summary</p>
            <h2 className="text-2xl font-semibold">Payment details</h2>
            <p className="text-muted-foreground mt-2 text-sm">
              Review totals, then submit to launch the secure Stripe checkout
              session.
            </p>
          </div>
          <div className="text-muted-foreground space-y-3 text-sm">
            <div className="text-foreground flex justify-between">
              <span>Subtotal</span>
              <span>{formatMoney(totals.subtotal, currency)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>
                {totals.shipping === 0
                  ? "Free"
                  : formatMoney(totals.shipping, currency)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Discounts</span>
              <span>{formatMoney(discountValue, currency)}</span>
            </div>
            <div className="text-foreground flex justify-between text-base font-semibold">
              <span>Total</span>
              <span>{formatMoney(totals.total, currency)}</span>
            </div>
          </div>
          <form action={createCheckoutSession} className="space-y-2">
            <input type="hidden" name="locale" value={locale} />
            <button
              className={buttonVariants({ size: "lg", className: "w-full" })}
            >
              Confirm &amp; pay {formatMoney(totals.total, currency)}
            </button>
            <p className="text-muted-foreground text-xs">
              By placing an order you agree to the terms, privacy policy, and
              Stripe checkout conditions.
            </p>
          </form>
        </aside>
      </div>
    </div>
  );
};

export default CheckoutPage;
