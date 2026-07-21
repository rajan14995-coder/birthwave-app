// Validates and normalizes Indian mobile numbers to E.164 (+91XXXXXXXXXX)
const INDIA_MOBILE_REGEX = /^[6-9]\d{9}$/;

export function normalizeIndianPhone(raw: string): string | null {
  const digitsOnly = raw.replace(/[^\d]/g, "");

  // Strip leading country code variants: 91XXXXXXXXXX or 0091XXXXXXXXXX
  let local = digitsOnly;
  if (local.startsWith("0091")) local = local.slice(4);
  else if (local.startsWith("91") && local.length === 12) local = local.slice(2);
  else if (local.startsWith("0") && local.length === 11) local = local.slice(1);

  if (!INDIA_MOBILE_REGEX.test(local)) return null;
  return `+91${local}`;
}

export function maskPhone(phone: string): string {
  // +91XXXXXX1234 -> +91XXXXXX1234 masked as +91******1234
  if (phone.length < 6) return phone;
  const last4 = phone.slice(-4);
  return `${phone.slice(0, 3)}${"*".repeat(phone.length - 7)}${last4}`;
}
