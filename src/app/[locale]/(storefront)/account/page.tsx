import { redirect } from "next/navigation";

import { routing } from "@/i18n/routing";

type AccountRootProps = {
  params: Promise<{ locale: string }>;
};

const AccountRootPage = async ({ params }: AccountRootProps) => {
  const resolvedParams = await params;
  const locale = resolvedParams?.locale ?? routing.defaultLocale;
  redirect(`/${locale}/account/dashboard`);
};

export default AccountRootPage;
