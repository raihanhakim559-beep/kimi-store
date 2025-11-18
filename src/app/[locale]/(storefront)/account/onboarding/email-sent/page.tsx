import { redirect } from "next/navigation";

import { ResendVerificationButton } from "@/components/resend-verification-button";
import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { auth } from "@/lib/auth";
import {
  getActiveOnboardingTokenForUser,
  getUserForOnboardingToken,
} from "@/lib/onboarding";
import { cn } from "@/lib/utils";

const containerClass =
  "mx-auto max-w-2xl space-y-8 rounded-3xl border p-8 text-center";

const infoCardClass = "rounded-2xl border p-4 text-left text-sm";

const headingLabelClass =
  "text-muted-foreground text-xs tracking-[0.4em] uppercase";

const ActivationEmailSentPage = async ({
  params,
}: {
  params: Promise<{ locale?: string }> | { locale?: string };
}) => {
  const resolvedParams = await Promise.resolve(params);
  const locale = resolvedParams?.locale ?? "en";
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/${locale}/account/login`);
  }

  if (session.user.isActive) {
    redirect(`/${locale}`);
  }

  const userId = session.user.id;
  const token = await getActiveOnboardingTokenForUser(userId);
  const pendingUser = token ? await getUserForOnboardingToken(token) : null;
  const pendingEmail = pendingUser?.email ?? session.user.email ?? null;
  const hasActiveToken = Boolean(token && pendingUser);

  return (
    <div className={containerClass}>
      <p className={headingLabelClass}>Activation</p>
      <h1 className="text-4xl font-semibold">Check your inbox</h1>
      <p className="text-muted-foreground">
        We&apos;re sending a secure onboarding link to{" "}
        <span className="font-semibold">{pendingEmail ?? "your inbox"}</span>.
        Keep this page open—once the email arrives you can only open the
        onboarding form from that secure link.
      </p>
      <div className="flex justify-center">
        <Link
          href={`/${locale}`}
          className={buttonVariants({
            variant: "outline",
            size: "lg",
            className: "w-full sm:w-auto",
          })}
        >
          Return home
        </Link>
      </div>
      <div className={cn(infoCardClass, "text-center sm:text-left")}>
        <p className="font-semibold">Didn&apos;t get the email?</p>
        <p className="text-muted-foreground">
          {hasActiveToken
            ? "If it doesn’t arrive after a minute, check spam or resend the activation email."
            : "We couldn’t issue a link yet. Use the resend button and we’ll generate a fresh one."}
        </p>
        <div className="mt-3">
          <ResendVerificationButton locale={locale} />
        </div>
      </div>
      <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-left text-sm text-amber-900">
        <p className="font-semibold">Why this step?</p>
        <p>
          We verify new accounts with email plus the onboarding form to keep
          customer data secure. Completing the form unlocks checkout and your
          profile dashboard.
        </p>
      </div>
    </div>
  );
};

export default ActivationEmailSentPage;
