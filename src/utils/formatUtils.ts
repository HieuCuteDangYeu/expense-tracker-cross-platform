/**
 * Currency formatting utility — replaces FormatUtils.kt.
 * Uses Intl.NumberFormat, the JS equivalent of Java's NumberFormat.
 */

export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    // Fallback if currency code is invalid
    return `$${Math.round(amount).toLocaleString()}`;
  }
}

/**
 * Formats a currency amount with decimals (for detailed views).
 */
export function formatCurrencyDetailed(
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `$${amount.toFixed(2)}`;
  }
}
