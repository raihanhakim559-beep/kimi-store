import { Locale } from "next-intl";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale: _locale } = await params;
  void _locale;

  return <>home page</>;
}
