// ==================================================
// BENCHFLOW — SMALL SHARED FORMATTING HELPERS
// ==================================================

/** Pads a number to two digits, e.g. 7 -> "07". */
export function twoDigits(value: number): string {
  return String(value).padStart(2, "0");
}
