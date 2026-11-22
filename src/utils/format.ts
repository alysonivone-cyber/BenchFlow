// ==================================================
// BENCHFLOW — SMALL SHARED FORMATTING HELPERS
// ==================================================

/** Pads a number to two digits, e.g. 7 -> "07". */
export function twoDigits(value: number): string {
  return String(value).padStart(2, "0");
}

/**
 * Formats a duration as a clock: "MM:SS", or "HH:MM:SS" from one hour.
 * Rounds up, so a timer never shows 00:00 before it is really over.
 */
export function formatClock(milliseconds: number): string {
  const totalSeconds = Math.ceil(
    Math.max(0, milliseconds) / 1000
  );

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return hours > 0
    ? `${twoDigits(hours)}:${twoDigits(minutes)}:${twoDigits(seconds)}`
    : `${twoDigits(minutes)}:${twoDigits(seconds)}`;
}
