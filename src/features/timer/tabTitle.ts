import { formatClock } from "../../utils/format";

/** Title of the BenchFlow tab when no timer is running. */
export const BASE_TAB_TITLE = "BenchFlow";

/**
 * Tab title while a timer runs, e.g. "⏱ 04:32 · BenchFlow", so the
 * remaining time stays visible from another tab or window.
 */
export function timerTabTitle(
  remainingMs: number | null
): string {
  return remainingMs === null
    ? BASE_TAB_TITLE
    : `⏱ ${formatClock(remainingMs)} · ${BASE_TAB_TITLE}`;
}
