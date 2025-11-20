import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { type DateInput, toDate } from '@/lib/utils/date';

function safeFormat(formatter: () => string, fallback: string = '—'): string {
  try {
    return formatter();
  } catch {
    return fallback;
  }
}

export function useLocaleFormatter(defaultCurrency?: string) {
  const { i18n } = useTranslation();

  const formatDateValue = useCallback(
    (value: DateInput, options?: Intl.DateTimeFormatOptions) =>
      safeFormat(() => new Intl.DateTimeFormat(i18n.language, options).format(toDate(value))),
    [i18n.language]
  );

  const formatTimeValue = useCallback(
    (value: DateInput, options?: Intl.DateTimeFormatOptions) =>
      safeFormat(() => new Intl.DateTimeFormat(i18n.language, options).format(toDate(value))),
    [i18n.language]
  );

  const formatDateTimeValue = useCallback(
    (value: DateInput, options?: Intl.DateTimeFormatOptions) =>
      safeFormat(() => new Intl.DateTimeFormat(i18n.language, options).format(toDate(value))),
    [i18n.language]
  );

  const formatCurrencyValue = useCallback(
    (amount: number, currency = defaultCurrency ?? 'CHF', options?: Intl.NumberFormatOptions) =>
      new Intl.NumberFormat(i18n.language, {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        ...options,
      }).format(amount),
    [i18n.language, defaultCurrency]
  );

  return {
    formatCurrency: formatCurrencyValue,
    formatDate: formatDateValue,
    formatTime: formatTimeValue,
    formatDateTime: formatDateTimeValue,
  } as const;
}
