export type CurrencyFormatterOptions = Intl.NumberFormatOptions & {
  locale?: string;
  currency?: string;
};

export const createCurrencyFormatter = ({
  locale = "en-US",
  currency = "USD",
  style = "currency",
  ...options
}: CurrencyFormatterOptions = {}) => {
  const formatter = new Intl.NumberFormat(locale, {
    style,
    currency,
    ...options,
  });

  return (value: number | bigint) => formatter.format(value);
};

export const formatCurrency = (
  value: number | bigint,
  options?: CurrencyFormatterOptions,
) => createCurrencyFormatter(options)(value);
