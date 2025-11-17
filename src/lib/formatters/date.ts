export type DateFormatterOptions = Intl.DateTimeFormatOptions & {
  locale?: string;
};

const normalizeDateInput = (value: string | number | Date) => {
  if (value instanceof Date) {
    return value;
  }

  return new Date(value);
};

export const createDateFormatter = ({
  locale = "en",
  ...options
}: DateFormatterOptions = {}) => {
  const formatter = new Intl.DateTimeFormat(locale, options);

  return (value: string | number | Date) =>
    formatter.format(normalizeDateInput(value));
};

export const formatDate = (
  value: string | number | Date,
  options?: DateFormatterOptions,
) => createDateFormatter(options)(value);
