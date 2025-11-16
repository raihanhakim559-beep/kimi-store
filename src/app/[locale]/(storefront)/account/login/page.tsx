import { AccountLoginActions } from "@/components/account-login-actions";
import { Link } from "@/i18n/navigation";

const AccountLoginPage = () => {
  return (
    <div className="bg-muted/40 mx-auto max-w-2xl space-y-8 rounded-3xl border p-8">
      <p className="text-muted-foreground text-xs tracking-[0.4em] uppercase">
        Account
      </p>
      <h1 className="text-4xl font-semibold">Sign in or create an account.</h1>
      <p className="text-muted-foreground">
        Access order tracking, wishlist syncing, and saved checkout details.
        Continue with a secure provider to create or return to your profile.
      </p>
      <AccountLoginActions />
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
