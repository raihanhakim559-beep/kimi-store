import { removeCartItem, updateCartItemQuantity } from "@/actions/cart";
import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { getCartSummary } from "@/lib/cart";
import { formatCurrency } from "@/lib/formatters";

const formatMoney = (amountInCents: number) =>
  formatCurrency(amountInCents / 100, {
    locale: "en-US",
    currency: "USD",
    maximumFractionDigits: 2,
  });

const CartPage = async () => {
  const { items, totals } = await getCartSummary();

  if (items.length === 0) {
    return (
      <div className="space-y-8">
        <header className="bg-muted/40 rounded-3xl border p-8">
          <p className="text-muted-foreground text-xs tracking-[0.4em] uppercase">
            Cart
          </p>
          <h1 className="mt-4 text-4xl font-semibold">Your bag is empty</h1>
          <p className="text-muted-foreground mt-4">
            Browse the latest drops or revisit wishlist favorites to start a new
            checkout.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/new-arrivals"
              className={buttonVariants({ size: "lg" })}
            >
              Shop new arrivals
            </Link>
            <Link
              href="/wishlist"
              className={buttonVariants({ variant: "outline", size: "lg" })}
            >
              View wishlist
            </Link>
          </div>
        </header>
      </div>
    );
  }

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
          {items.map((item) => (
            <article
              key={item.id}
              className="flex flex-col gap-5 rounded-2xl border p-6 md:flex-row md:items-center md:justify-between"
            >
              <div className="space-y-3">
                <div>
                  <p className="text-muted-foreground text-xs uppercase">
                    {item.category}
                  </p>
                  <h2 className="text-xl font-semibold">{item.title}</h2>
                  <p className="text-muted-foreground text-sm">
                    {item.description ?? ""}
                  </p>
                </div>
                <div className="text-muted-foreground text-xs uppercase">
                  <span>Qty {item.quantity}</span>
                  {item.size && <span className="ml-3">Size {item.size}</span>}
                  {item.color && (
                    <span className="ml-3">Color {item.color}</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-3 text-sm">
                  <form
                    action={updateCartItemQuantity}
                    className="flex items-center gap-2"
                  >
                    <input type="hidden" name="cartItemId" value={item.id} />
                    <input
                      type="number"
                      name="quantity"
                      min={1}
                      max={10}
                      defaultValue={item.quantity}
                      className="bg-background w-20 rounded-xl border px-3 py-2"
                    />
                    <button
                      className={buttonVariants({
                        variant: "outline",
                        size: "sm",
                      })}
                    >
                      Update
                    </button>
                  </form>
                  <form action={removeCartItem}>
                    <input type="hidden" name="cartItemId" value={item.id} />
                    <button className="text-destructive text-sm font-semibold underline-offset-4 hover:underline">
                      Remove
                    </button>
                  </form>
                </div>
              </div>
              <div className="text-right">
                <p className="text-muted-foreground text-sm">Per pair</p>
                <p className="text-2xl font-semibold">
                  {formatMoney(item.unitPrice)}
                </p>
                <p className="text-muted-foreground mt-1 text-sm">
                  Line total {formatMoney(item.lineTotal)}
                </p>
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
            <span>{formatMoney(totals.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>
              {totals.shipping === 0 ? "Free" : formatMoney(totals.shipping)}
            </span>
          </div>
          <div className="text-foreground flex justify-between font-semibold">
            <span>Total</span>
            <span>{formatMoney(totals.total)}</span>
          </div>
        </div>
        <Link
          href="/checkout"
          className={buttonVariants({ size: "lg", className: "w-full" })}
        >
          Continue to checkout
        </Link>
        <p className="text-muted-foreground text-xs">
          Taxes, duties, and applied discounts finalize at payment. Need to
          tweak shipping? You can still edit during checkout.
        </p>
      </aside>
    </div>
  );
};

export default CartPage;
