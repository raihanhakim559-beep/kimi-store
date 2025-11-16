import { buttonVariants } from "@/components/ui/button";
import { checkoutSteps } from "@/lib/data/storefront";

const CheckoutPage = () => {
  return (
    <div className="space-y-10">
      <header className="bg-muted/40 rounded-3xl border p-8">
        <p className="text-muted-foreground text-xs tracking-[0.4em] uppercase">
          Checkout
        </p>
        <h1 className="mt-4 text-4xl font-semibold">Secure checkout</h1>
        <p className="text-muted-foreground mt-4">
          Complete the four-step flow to confirm your order. Saved addresses
          populate automatically when signed in.
        </p>
      </header>
      <section className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          {checkoutSteps.map((step, index) => (
            <article key={step} className="rounded-2xl border p-6">
              <p className="text-muted-foreground text-xs uppercase">
                Step {index + 1}
              </p>
              <h2 className="mt-2 text-xl font-semibold">{step}</h2>
              <p className="text-muted-foreground mt-2 text-sm">
                Form inputs render here. Use saved defaults or enter new details
                for this shipment.
              </p>
            </article>
          ))}
        </div>
        <aside className="rounded-3xl border p-6">
          <h2 className="text-xl font-semibold">Payment summary</h2>
          <p className="text-muted-foreground mt-2 text-sm">
            Cart total: $452.00
          </p>
          <button
            className={buttonVariants({ size: "lg", className: "mt-6 w-full" })}
          >
            Place order (mock)
          </button>
          <p className="text-muted-foreground mt-3 text-xs">
            By placing an order you agree to the terms and privacy policy.
          </p>
        </aside>
      </section>
    </div>
  );
};

export default CheckoutPage;
