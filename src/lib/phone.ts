/**
 * Lebanese phone number utility.
 * Strips non-digits, removes leading "0", prepends +961.
 */
export function getFullPhone(localNumber: string): string {
  const digits = localNumber.replace(/\D/g, "");
  const cleaned = digits.startsWith("0") ? digits.slice(1) : digits;
  return `+961${cleaned}`;
}
