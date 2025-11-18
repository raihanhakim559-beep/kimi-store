import { completeOnboarding } from "@/actions/onboarding";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
  const noticeParam = resolvedSearchParams?.notice;
  let token = typeof tokenParam === "string" ? tokenParam : null;
  let recoveredFromExpiredLink = false;
  const showActivationNotice =
    typeof noticeParam === "string" && noticeParam === "activation";

  if (!token) {
    return <MissingTokenState locale={locale} />;
  }

  const ensureSession = async () => auth();

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
  const bannerEmail = pendingUser.email ?? "your inbox";

  const steps = [
    {
      title: "Profile",
      description: "Tell us how to address and contact you.",
    },
    {
      title: "Shipping",
      description: "Set the default address we can use at checkout.",
    },
    {
      title: "Agreement",
      description: "Review policies and activate the account.",
    },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header className="bg-muted/40 rounded-3xl border p-8">
        <p className="text-muted-foreground text-xs tracking-[0.4em] uppercase">
          Onboarding
        </p>
        <h1 className="mt-4 text-4xl font-semibold">Confirm your details</h1>
        <p className="text-muted-foreground mt-4 text-sm">
          Move through each step below to finish onboarding in a single session.
        </p>
      </header>
      <ol className="grid gap-4 sm:grid-cols-3">
        {steps.map((step, index) => (
          <li key={step.title} className="rounded-2xl border p-4">
            <Badge variant="secondary" className="text-xs">
              Step {index + 1}
            </Badge>
            <p className="mt-3 text-lg font-semibold">{step.title}</p>
            <p className="text-muted-foreground text-sm">{step.description}</p>
          </li>
        ))}
      </ol>
      <form action={completeOnboarding} className="space-y-6">
        <input type="hidden" name="token" value={token} />
        <input type="hidden" name="locale" value={locale} />
        {recoveredFromExpiredLink && (
          <p className="text-xs text-amber-600">
            Your previous activation link expired, but we restored the latest
            one automatically.
          </p>
        )}
        <Card>
          <CardHeader>
            <CardTitle>Step 1 · Profile</CardTitle>
            <CardDescription>
              Basic contact details so we know who&apos;s activating the
              account.
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                <span className="text-muted-foreground">Email</span>
                <input
                  className={cn(inputClass, "bg-muted/40")}
                  defaultValue={pendingUser.email ?? ""}
                  disabled
                />
              </label>
              <label className="space-y-1 text-sm md:col-span-2">
                <span className="text-muted-foreground">Phone</span>
                <input className={inputClass} name="phone" required />
              </label>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Step 2 · Shipping</CardTitle>
            <CardDescription>
              We&apos;ll store this address for future orders and receipts.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Step 3 · Agreements</CardTitle>
            <CardDescription>
              Accept the customer terms to activate your membership.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="flex items-center gap-3 text-sm">
              <input type="checkbox" name="acceptTerms" required />
              <span>
                I agree to the terms, privacy policy, and shipping policies.
              </span>
            </label>
            <Separator />
            <button
              className={buttonVariants({ size: "lg", className: "w-full" })}
            >
              Activate account
            </button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default AccountOnboardingPage;
