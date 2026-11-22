const php = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  currencyDisplay: "code",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Formats a peso amount as e.g. "PHP 45,000.00" (ISO code, never a symbol). */
export function formatPHP(amount: number): string {
  return php.format(amount).replace(/ /g, " ");
}
