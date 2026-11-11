// ==================================================
// BENCHFLOW — READABLE NAMES FOR SESSIONS AND IMPORTS
// ==================================================
//
// The `id` of a session stays a random UUID (it is the key used by
// Dexie for notes and timers). The readable name is computed from
// `createdAt`, so no stored data has to change.

function twoDigits(value: number): string {
  return String(value).padStart(2, "0");
}

/** Local date as YYYYMMDD, e.g. 20261111. */
export function formatDateStamp(timestamp: number): string {
  const date = new Date(timestamp);

  return (
    String(date.getFullYear()) +
    twoDigits(date.getMonth() + 1) +
    twoDigits(date.getDate())
  );
}

/** Local date and time as YYYYMMDD-HHmm, e.g. 20261111-1423. */
export function formatSessionStamp(timestamp: number): string {
  const date = new Date(timestamp);

  return (
    `${formatDateStamp(timestamp)}-` +
    twoDigits(date.getHours()) +
    twoDigits(date.getMinutes())
  );
}

/** Readable session name: "20261111-1423 · Protocol title". */
export function formatSessionName(
  timestamp: number,
  protocolTitle: string
): string {
  return `${formatSessionStamp(timestamp)} · ${protocolTitle}`;
}

/** File name without its extension: "my-protocol.pdf" -> "my-protocol". */
export function fileBaseName(fileName: string): string {
  return fileName.replace(/\.[^./\\]+$/, "");
}
