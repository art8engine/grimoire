/**
 * Safely parse a TipTap JSON string. Returns null if the string is empty,
 * null, or not valid JSON.
 */
export function safeParseTipTap(content: string | null | undefined): object | null {
  if (!content || content.trim() === "") return null;
  try {
    const parsed = JSON.parse(content);
    if (typeof parsed !== "object" || parsed === null) return null;
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Format a phone number string to Korean style: 010-XXXX-XXXX.
 * Strips all non-digit characters first, then applies formatting.
 * Returns the original string if it does not match expected digit lengths.
 */
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return phone;
}
