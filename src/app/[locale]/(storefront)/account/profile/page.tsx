import { eq } from "drizzle-orm";
import Image from "next/image";
import { redirect } from "next/navigation";

import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { auth } from "@/lib/auth";
import { accounts, db, users } from "@/lib/schema";

const formatDateTime = (value?: Date | null) => {
  if (!value) {
    return "Not verified";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
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

const AccountProfilePage = async () => {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/account/login");
  }

  const userId = session.user.id;

  const [userRecord] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      image: users.image,
      emailVerified: users.emailVerified,
      stripeCustomerId: users.stripeCustomerId,
      isActive: users.isActive,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!userRecord) {
    redirect("/account/login");
  }

  const providerAccounts = await db
    .select({
      provider: accounts.provider,
      providerAccountId: accounts.providerAccountId,
    })
    .from(accounts)
    .where(eq(accounts.userId, userId));

  const initials = getInitials(userRecord.name, userRecord.email);

  const accountDetails = [
    { label: "User ID", value: userRecord.id },
    { label: "Name", value: userRecord.name ?? "Not provided" },
    { label: "Email", value: userRecord.email ?? "Not provided" },
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
              href="/account/dashboard"
              className={buttonVariants({ variant: "outline" })}
            >
              Go to dashboard
            </Link>
            <Link href="/wishlist" className={buttonVariants({})}>
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
    </div>
  );
};

export default AccountProfilePage;
