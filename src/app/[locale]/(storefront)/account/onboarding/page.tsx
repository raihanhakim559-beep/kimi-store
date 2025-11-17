import { completeOnboarding } from "@/actions/onboarding";
import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { auth } from "@/lib/auth";
import {
  getActiveOnboardingTokenForUser,
  getUserForOnboardingToken,
} from "@/lib/onboarding";
import { cn } from "@/lib/utils";

const inputClass =
  "w-full rounded-2xl border px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

type OnboardingPageProps = {
  params: Promise<{ locale?: string }> | { locale?: string };
  searchParams?:
    | Promise<
        { token?: string } | Record<string, string | string[] | undefined>
      >
    | ({ token?: string } | Record<string, string | string[] | undefined>);
};

const MissingTokenState = ({ locale }: { locale: string }) => (
  <div className="space-y-4 rounded-3xl border p-8 text-center">
    <h1 className="text-3xl font-semibold">Activation link missing</h1>
    <p className="text-muted-foreground">
      We couldn&apos;t find an activation token. Please open the email we sent
      to your inbox or request a new activation link from the checkout page.
    </p>
    <div className="flex justify-center gap-3">
      <Link href={`/${locale}/account/login`} className={buttonVariants({})}>
        Return to login
      </Link>
    </div>
  </div>
);

const ExpiredTokenState = ({ locale }: { locale: string }) => (
  <div className="space-y-4 rounded-3xl border p-8 text-center">
    <h1 className="text-3xl font-semibold">Activation link expired</h1>
    <p className="text-muted-foreground">
      The onboarding link has expired. Request a new email from the checkout
      guard or contact support for help.
    </p>
    <div className="flex justify-center gap-3">
      <Link href={`/${locale}/contact`} className={buttonVariants({})}>
        Contact support
      </Link>
    </div>
  </div>
);

const AccountOnboardingPage = async ({
  params,
  searchParams,
}: OnboardingPageProps) => {
  const resolvedParams = await Promise.resolve(params);
  const locale = resolvedParams?.locale ?? "en";

  const resolvedSearchParams = (await Promise.resolve(
    searchParams ?? {},
  )) as Record<string, string | string[] | undefined>;
  const tokenParam = resolvedSearchParams?.token;
  let token = typeof tokenParam === "string" ? tokenParam : null;
  let recoveredFromExpiredLink = false;

  const ensureSession = async () => auth();

  if (!token) {
    const currentSession = await ensureSession();
    const userId = currentSession?.user?.id;

    if (userId) {
      token = await getActiveOnboardingTokenForUser(userId);
    }

    if (!token) {
      return <MissingTokenState locale={locale} />;
    }
  }

  let pendingUser = await getUserForOnboardingToken(token);

  if (!pendingUser) {
    const currentSession = await ensureSession();
    const userId = currentSession?.user?.id;

    if (userId) {
      const fallbackToken = await getActiveOnboardingTokenForUser(userId);
      if (fallbackToken && fallbackToken !== token) {
        token = fallbackToken;
        recoveredFromExpiredLink = true;
        pendingUser = await getUserForOnboardingToken(token);
      }
    }

    if (!pendingUser) {
      return <ExpiredTokenState locale={locale} />;
    }
  }

  const safeName = pendingUser.name ?? "";

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header className="bg-muted/40 rounded-3xl border p-8">
        <p className="text-muted-foreground text-xs tracking-[0.4em] uppercase">
          Onboarding
        </p>
        <h1 className="mt-4 text-4xl font-semibold">Confirm your details</h1>
        <p className="text-muted-foreground mt-4 text-sm">
          Enter your contact info, default shipping address, and accept the
          customer agreement to activate your Kimi Store account.
        </p>
      </header>
      <form
        action={completeOnboarding}
        className="space-y-6 rounded-3xl border p-8"
      >
        <input type="hidden" name="token" value={token} />
        <input type="hidden" name="locale" value={locale} />
        <section className="space-y-4">
          {recoveredFromExpiredLink && (
            <p className="text-xs text-amber-600">
              Your previous activation link expired, but we restored the latest
              one automatically.
            </p>
          )}
          <div>
            <p className="text-muted-foreground text-xs tracking-[0.4em] uppercase">
              Profile
            </p>
            <h2 className="text-2xl font-semibold">Contact details</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1 text-sm">
              <span className="text-muted-foreground">Full name</span>
              <input
                className={inputClass}
                name="name"
                defaultValue={safeName}
                required
              />
            </label>
            <label className="space-y-1 text-sm">
              <span className="text-muted-foreground">Profile photo URL</span>
              <input
                className={inputClass}
                name="image"
                placeholder="https://..."
                type="url"
              />
            </label>
            <label className="space-y-1 text-sm">
              <span className="text-muted-foreground">Email</span>
              <input
                className={cn(inputClass, "bg-muted/40")}
                defaultValue={pendingUser.email ?? ""}
                disabled
              />
            </label>
            <label className="space-y-1 text-sm">
              <span className="text-muted-foreground">Phone</span>
              <input className={inputClass} name="phone" required />
            </label>
          </div>
        </section>
        <section className="space-y-4">
          <div>
            <p className="text-muted-foreground text-xs tracking-[0.4em] uppercase">
              Shipping
            </p>
            <h2 className="text-2xl font-semibold">Default address</h2>
          </div>
          <div className="grid gap-4">
            <label className="space-y-1 text-sm">
              <span className="text-muted-foreground">Recipient name</span>
              <input
                className={inputClass}
                name="fullName"
                defaultValue={safeName}
                required
              />
            </label>
            <label className="space-y-1 text-sm">
              <span className="text-muted-foreground">Address line 1</span>
              <input className={inputClass} name="line1" required />
            </label>
            <label className="space-y-1 text-sm">
              <span className="text-muted-foreground">Address line 2</span>
              <input className={inputClass} name="line2" />
            </label>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-1 text-sm">
                <span className="text-muted-foreground">City</span>
                <input className={inputClass} name="city" required />
              </label>
              <label className="space-y-1 text-sm">
                <span className="text-muted-foreground">State / Region</span>
                <input className={inputClass} name="state" required />
              </label>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-1 text-sm">
                <span className="text-muted-foreground">Postal code</span>
                <input className={inputClass} name="postalCode" required />
              </label>
              <label className="space-y-1 text-sm">
                <span className="text-muted-foreground">Country</span>
                <input
                  className={inputClass}
                  name="country"
                  defaultValue="MY"
                  maxLength={2}
                  required
                />
              </label>
            </div>
          </div>
        </section>
        <section className="space-y-4">
          <label className="flex items-center gap-3 text-sm">
            <input type="checkbox" name="acceptTerms" required />
            <span>
              I agree to the customer terms, privacy policy, and shipping
              policies. I consent to receiving transactional communications.
            </span>
          </label>
          <button
            className={buttonVariants({ size: "lg", className: "w-full" })}
          >
            Activate account
          </button>
        </section>
      </form>
    </div>
  );
};

export default AccountOnboardingPage;
