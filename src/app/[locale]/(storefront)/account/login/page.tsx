import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

const AccountLoginPage = () => {
  return (
    <div className="bg-muted/40 mx-auto max-w-2xl space-y-8 rounded-3xl border p-8">
      <p className="text-muted-foreground text-xs tracking-[0.4em] uppercase">
        Account
      </p>
      <h1 className="text-4xl font-semibold">Sign in or create an account.</h1>
      <p className="text-muted-foreground">
        Access order tracking, wishlist syncing, and saved checkout details. Use
        a magic link or connect a social profile.
      </p>
      <form className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="email">
            Email address
          </label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            className="bg-background w-full rounded-2xl border px-4 py-3"
          />
        </div>
        <button className={buttonVariants({ className: "w-full" })}>
          Send magic link
        </button>
      </form>
      <div className="grid gap-3 md:grid-cols-2">
        {["Continue with Apple", "Continue with Google"].map((provider) => (
          <button
            key={provider}
            className={buttonVariants({ variant: "outline" })}
          >
            {provider}
          </button>
        ))}
      </div>
      <p className="text-muted-foreground text-xs">
        By continuing you agree to receive automated emails for account
        security. Read the{" "}
        <Link href="/faq" className="underline">
          privacy policy
        </Link>
        .
      </p>
    </div>
  );
};

export default AccountLoginPage;
