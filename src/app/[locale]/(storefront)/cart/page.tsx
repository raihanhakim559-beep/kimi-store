import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { products } from "@/lib/data/storefront";

const lineItems = products.slice(0, 2).map((product, index) => ({
  ...product,
  quantity: index === 0 ? 1 : 2,
}));

const CartPage = () => {
  const subtotal = lineItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const shipping = subtotal > 150 ? 0 : 12;
  const total = subtotal + shipping;

  return (
    <div className="grid gap-10 lg:grid-cols-[1.2fr,0.8fr]">
      <section className="space-y-6">
        <header className="bg-muted/40 rounded-3xl border p-6">
          <p className="text-muted-foreground text-xs tracking-[0.4em] uppercase">
            Cart
          </p>
          <h1 className="mt-2 text-3xl font-semibold">Ready to checkout</h1>
          <p className="text-muted-foreground mt-2">
            Shipping and returns are free on orders over $150.
          </p>
        </header>
        <div className="space-y-4">
          {lineItems.map((item) => (
            <article
              key={item.slug}
              className="flex flex-col gap-4 rounded-2xl border p-6 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <p className="text-muted-foreground text-xs uppercase">
                  {item.category}
                </p>
                <h2 className="text-xl font-semibold">{item.title}</h2>
                <p className="text-muted-foreground">{item.description}</p>
                <p className="text-muted-foreground mt-2 text-sm">
                  Qty: {item.quantity}
                </p>
              </div>
              <div className="text-right">
                <p className="text-muted-foreground text-sm">Per pair</p>
                <p className="text-2xl font-semibold">${item.price}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
      <aside className="space-y-6 rounded-3xl border p-6">
        <h2 className="text-xl font-semibold">Order summary</h2>
        <div className="text-muted-foreground space-y-3 text-sm">
          <div className="text-foreground flex justify-between">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
          </div>
          <div className="text-foreground flex justify-between font-semibold">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
        <Link
          href="/checkout"
          className={buttonVariants({ size: "lg", className: "w-full" })}
        >
          Continue to checkout
        </Link>
        <Link
          href="/sale"
          className="text-sm font-semibold underline-offset-4 hover:underline"
        >
          Apply promo code
        </Link>
      </aside>
    </div>
  );
};

export default CartPage;
