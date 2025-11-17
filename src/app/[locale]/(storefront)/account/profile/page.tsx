import { desc, eq } from "drizzle-orm";
import Image from "next/image";
import { redirect } from "next/navigation";

import { updateProfileAddress, updateProfileDetails } from "@/actions/profile";
import { ResendVerificationButton } from "@/components/resend-verification-button";
import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { auth } from "@/lib/auth";
import { formatDate as formatDateValue } from "@/lib/formatters";
import { accounts, addresses, db, users } from "@/lib/schema";

const formatDateTime = (value?: Date | null) => {
  if (!value) {
    return "Not verified";
  }

  return formatDateValue(value, {
    locale: "en-US",
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const getInitials = (name?: string | null, email?: string | null) => {
  if (name) {
    const trimmed = name.trim();
    if (trimmed) {
      const [first, last] = trimmed.split(" ");
      return (first?.[0] ?? "").concat(last?.[0] ?? "").toUpperCase();
    }
  }

  if (email) {
    return email.charAt(0).toUpperCase();
  }

  return "?";
};

type AccountProfilePageProps = {
  params: Promise<{ locale?: string }>;
};

const AccountProfilePage = async ({ params }: AccountProfilePageProps) => {
  const { locale = "en" } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/${locale}/account/login`);
  }

  const userId = session.user.id;

  const [userRecord] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      image: users.image,
      phone: users.phone,
      emailVerified: users.emailVerified,
      stripeCustomerId: users.stripeCustomerId,
      isActive: users.isActive,
      hasAcceptedTerms: users.hasAcceptedTerms,
      onboardingCompletedAt: users.onboardingCompletedAt,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!userRecord) {
    redirect(`/${locale}/account/login`);
  }

  const providerAccounts = await db
    .select({
      provider: accounts.provider,
      providerAccountId: accounts.providerAccountId,
    })
    .from(accounts)
    .where(eq(accounts.userId, userId));

  const [primaryAddress] = await db
    .select({
      id: addresses.id,
      fullName: addresses.fullName,
      phone: addresses.phone,
      line1: addresses.line1,
      line2: addresses.line2,
      city: addresses.city,
      state: addresses.state,
      postalCode: addresses.postalCode,
      country: addresses.country,
    })
    .from(addresses)
    .where(eq(addresses.userId, userId))
    .orderBy(desc(addresses.isDefaultShipping), desc(addresses.createdAt))
    .limit(1);

  const initials = getInitials(userRecord.name, userRecord.email);

  const accountDetails = [
    { label: "User ID", value: userRecord.id },
    { label: "Name", value: userRecord.name ?? "Not provided" },
    { label: "Email", value: userRecord.email ?? "Not provided" },
    {
      label: "Phone",
      value: userRecord.phone ?? primaryAddress?.phone ?? "Not provided",
    },
    {
      label: "Email verified",
      value: formatDateTime(userRecord.emailVerified),
    },
    {
      label: "Stripe customer ID",
      value: userRecord.stripeCustomerId ?? "Pending assignment",
    },
    {
      label: "Membership status",
      value: userRecord.isActive ? "Active" : "Inactive",
    },
    {
      label: "Onboarding completed",
      value: userRecord.onboardingCompletedAt
        ? formatDateTime(userRecord.onboardingCompletedAt)
        : "Pending",
    },
    {
      label: "Terms accepted",
      value: userRecord.hasAcceptedTerms ? "Yes" : "No",
    },
  ];

  return (
    <div className="space-y-10">
      <header className="bg-muted/50 rounded-3xl border p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            {userRecord.image ? (
              <Image
                className="rounded-full border"
                src={userRecord.image}
                alt={userRecord.name ?? userRecord.email ?? "Profile photo"}
                width={80}
                height={80}
              />
            ) : (
              <div className="bg-primary/10 text-primary flex h-20 w-20 items-center justify-center rounded-full text-xl font-semibold uppercase">
                {initials}
              </div>
            )}
            <div>
              <p className="text-muted-foreground text-xs tracking-[0.4em] uppercase">
                Profile
              </p>
              <h1 className="mt-2 text-3xl font-semibold">
                {userRecord.name ?? "Your profile"}
              </h1>
              <p className="text-muted-foreground text-sm">
                {userRecord.email ?? "No email on file"}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/${locale}/account/dashboard`}
              className={buttonVariants({ variant: "outline" })}
            >
              Go to dashboard
            </Link>
            <Link href={`/${locale}/wishlist`} className={buttonVariants({})}>
              View wishlist
            </Link>
          </div>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border p-4">
            <p className="text-muted-foreground text-xs tracking-widest uppercase">
              Status
            </p>
            <p className="mt-1 text-xl font-semibold">
              {userRecord.isActive ? "Active" : "Inactive"}
            </p>
            <p className="text-muted-foreground text-xs">
              Stripe customer: {userRecord.stripeCustomerId ?? "pending"}
            </p>
          </div>
          <div className="rounded-2xl border p-4">
            <p className="text-muted-foreground text-xs tracking-widest uppercase">
              Email verification
            </p>
            <p className="mt-1 text-xl font-semibold">
              {userRecord.emailVerified ? "Verified" : "Unverified"}
            </p>
            <p className="text-muted-foreground text-xs">
              {formatDateTime(userRecord.emailVerified)}
            </p>
            {!userRecord.emailVerified && (
              <div className="mt-3">
                <ResendVerificationButton locale={locale} />
              </div>
            )}
          </div>
          <div className="rounded-2xl border p-4">
            <p className="text-muted-foreground text-xs tracking-widest uppercase">
              Account reference
            </p>
            <p className="mt-1 text-xl font-semibold">{userRecord.id}</p>
            <p className="text-muted-foreground text-xs">Internal user ID</p>
          </div>
        </div>
      </header>
      <section className="grid gap-6 md:grid-cols-2">
        <article className="rounded-2xl border p-6">
          <h2 className="text-xl font-semibold">Account details</h2>
          <dl className="mt-4 space-y-4 text-sm">
            {accountDetails.map((detail) => (
              <div
                key={detail.label}
                className="flex items-center justify-between gap-4 border-b pb-3 last:border-b-0 last:pb-0"
              >
                <dt className="text-muted-foreground">{detail.label}</dt>
                <dd className="text-right font-medium">{detail.value}</dd>
              </div>
            ))}
          </dl>
        </article>
        <article className="rounded-2xl border p-6">
          <h2 className="text-xl font-semibold">Connected providers</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {providerAccounts.length ? (
              providerAccounts.map((provider) => (
                <li
                  key={`${provider.provider}-${provider.providerAccountId}`}
                  className="rounded-xl border p-3"
                >
                  <p className="font-medium capitalize">{provider.provider}</p>
                  <p className="text-muted-foreground text-xs break-all">
                    {provider.providerAccountId}
                  </p>
                </li>
              ))
            ) : (
              <li className="text-muted-foreground text-sm">
                No authentication providers linked yet.
              </li>
            )}
          </ul>
        </article>
      </section>
      <section className="grid gap-6 md:grid-cols-2">
        <form
          action={updateProfileDetails}
          className="space-y-4 rounded-2xl border p-6"
        >
          <input type="hidden" name="locale" value={locale} />
          <h2 className="text-xl font-semibold">Profile settings</h2>
          <label className="space-y-1 text-sm">
            <span className="text-muted-foreground">Display name</span>
            <input
              className="w-full rounded-2xl border px-4 py-3 text-sm"
              name="name"
              defaultValue={userRecord.name ?? ""}
              required
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-muted-foreground">Phone</span>
            <input
              className="w-full rounded-2xl border px-4 py-3 text-sm"
              name="phone"
              defaultValue={userRecord.phone ?? ""}
              required
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-muted-foreground">Profile photo URL</span>
            <input
              className="w-full rounded-2xl border px-4 py-3 text-sm"
              name="image"
              defaultValue={userRecord.image ?? ""}
              placeholder="https://..."
            />
          </label>
          <button className={buttonVariants({ className: "w-full" })}>
            Save profile
          </button>
        </form>
        <form
          action={updateProfileAddress}
          className="space-y-4 rounded-2xl border p-6"
        >
          <input type="hidden" name="locale" value={locale} />
          <h2 className="text-xl font-semibold">Default address</h2>
          <label className="space-y-1 text-sm">
            <span className="text-muted-foreground">Recipient name</span>
            <input
              className="w-full rounded-2xl border px-4 py-3 text-sm"
              name="fullName"
              defaultValue={primaryAddress?.fullName ?? userRecord.name ?? ""}
              required
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-muted-foreground">Phone</span>
            <input
              className="w-full rounded-2xl border px-4 py-3 text-sm"
              name="phone"
              defaultValue={primaryAddress?.phone ?? userRecord.phone ?? ""}
              required
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-muted-foreground">Address line 1</span>
            <input
              className="w-full rounded-2xl border px-4 py-3 text-sm"
              name="line1"
              defaultValue={primaryAddress?.line1 ?? ""}
              required
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-muted-foreground">Address line 2</span>
            <input
              className="w-full rounded-2xl border px-4 py-3 text-sm"
              name="line2"
              defaultValue={primaryAddress?.line2 ?? ""}
            />
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1 text-sm">
              <span className="text-muted-foreground">City</span>
              <input
                className="w-full rounded-2xl border px-4 py-3 text-sm"
                name="city"
                defaultValue={primaryAddress?.city ?? ""}
                required
              />
            </label>
            <label className="space-y-1 text-sm">
              <span className="text-muted-foreground">State / Region</span>
              <input
                className="w-full rounded-2xl border px-4 py-3 text-sm"
                name="state"
                defaultValue={primaryAddress?.state ?? ""}
                required
              />
            </label>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1 text-sm">
              <span className="text-muted-foreground">Postal code</span>
              <input
                className="w-full rounded-2xl border px-4 py-3 text-sm"
                name="postalCode"
                defaultValue={primaryAddress?.postalCode ?? ""}
                required
              />
            </label>
            <label className="space-y-1 text-sm">
              <span className="text-muted-foreground">Country</span>
              <input
                className="w-full rounded-2xl border px-4 py-3 text-sm"
                name="country"
                defaultValue={primaryAddress?.country ?? "MY"}
                maxLength={2}
                required
              />
            </label>
          </div>
          <button
            className={buttonVariants({
              className: "w-full",
              variant: "secondary",
            })}
          >
            Save address
          </button>
        </form>
      </section>
    </div>
  );
};

export default AccountProfilePage;
