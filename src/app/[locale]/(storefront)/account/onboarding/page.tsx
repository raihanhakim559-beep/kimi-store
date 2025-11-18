import { completeOnboarding } from "@/actions/onboarding";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { auth } from "@/lib/auth";
import {
  getActiveOnboardingTokenForUser,
  getUserForOnboardingToken,
} from "@/lib/onboarding";

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

  return (
    <div className="mx-auto max-w-3xl space-y-6 lg:space-y-8">
      {showActivationNotice && (
        <Card className="border-emerald-200 bg-emerald-50">
          <CardHeader className="space-y-2">
            <Badge variant="secondary" className="w-fit text-emerald-900">
              Email sent
            </Badge>
            <CardTitle className="text-emerald-900">
              Check {bannerEmail}
            </CardTitle>
            <CardDescription className="text-emerald-900">
              We just sent a secure onboarding link. Keep this tab open and open
              the link in your inbox to validate the session.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
      <header className="bg-muted/40 rounded-3xl border p-8">
        <p className="text-muted-foreground text-xs tracking-[0.4em] uppercase">
          Onboarding
        </p>
        <h1 className="mt-4 text-4xl font-semibold">Confirm your details</h1>
        <p className="text-muted-foreground mt-4 text-sm">
          Complete each step below to unlock your account and checkout access.
        </p>
      </header>
      <OnboardingWizard
        action={completeOnboarding}
        token={token}
        locale={locale}
        email={pendingUser.email ?? ""}
        defaultName={safeName}
        defaultPhone={(pendingUser as { phone?: string | null })?.phone ?? ""}
        defaultCountry="MY"
        recoveredFromExpiredLink={recoveredFromExpiredLink}
      />
    </div>
  );
};

export default AccountOnboardingPage;
