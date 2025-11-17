import { redirect } from "next/navigation";

import { AccountLoginActions } from "@/components/account-login-actions";
import { ResendVerificationButton } from "@/components/resend-verification-button";
import { Link } from "@/i18n/navigation";
import { auth } from "@/lib/auth";
import { getEnabledAuthProviders } from "@/lib/auth/provider-config";

type AccountLoginPageProps = {
  params: Promise<{ locale?: string }> | { locale?: string };
  searchParams?:
    | Promise<Record<string, string | string[] | undefined>>
    | Record<string, string | string[] | undefined>;
};

const AccountLoginPage = async ({
  params,
  searchParams,
}: AccountLoginPageProps) => {
  const resolvedParams = await Promise.resolve(params);
  const locale = resolvedParams?.locale ?? "en";
  const providers = getEnabledAuthProviders();
  const session = await auth();
  const pendingActivation = Boolean(
    session?.user?.id && !session.user.isActive,
  );

  if (session?.user?.id && !pendingActivation) {
    redirect(`/${locale}`);
  }

  const resolvedSearchParams = await Promise.resolve(searchParams ?? {});
  const requestedCallback =
    typeof resolvedSearchParams?.callbackUrl === "string"
      ? resolvedSearchParams.callbackUrl
      : undefined;
  const callbackUrl =
    requestedCallback && requestedCallback.startsWith("/")
      ? requestedCallback
      : `/${locale}`;

  return (
    <div className="bg-muted/40 mx-auto max-w-2xl space-y-8 rounded-3xl border p-8">
      {pendingActivation && (
        <div className="space-y-2 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <div className="text-base font-semibold">
            Check your inbox to activate
          </div>
          <p>
            We sent a secure onboarding link to finish setting up your account.
            Complete the onboarding form before you can place orders.
          </p>
          <ResendVerificationButton locale={locale} className="mt-2" />
        </div>
      )}
      <p className="text-muted-foreground text-xs tracking-[0.4em] uppercase">
        Account
      </p>
      <h1 className="text-4xl font-semibold">Sign in or create an account.</h1>
      <p className="text-muted-foreground">
        Access order tracking, wishlist syncing, and saved checkout details.
        Continue with a secure provider to create or return to your profile.
      </p>
      <AccountLoginActions providers={providers} callbackUrl={callbackUrl} />
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
