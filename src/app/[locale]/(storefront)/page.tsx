import { Locale } from "next-intl";

export default async function HomePage({
  params,
}: {
  params: { locale: Locale };
}) {
  const { locale: _locale } = params;
  void _locale;

  return <>home page</>;
}
