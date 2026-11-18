import { db } from "../../db/database";
import type { LabTimer } from "../../types/models";

type TimerAction = "start" | "pause" | "reset";

const DEFAULT_DURATION_MS = 30_000;

/**
 * Identity of the standalone timer (Scientific Calculator page).
 * It lives in the same `timers` table as the session timers but
 * under a reserved session id, so the two never interfere and
 * deleting a session or a protocol never touches it.
 */
export const GLOBAL_TIMER_SESSION_ID = "global";
export const GLOBAL_TIMER_STEP_ID = "calculator";
export const GLOBAL_TIMER_LABEL = "Calculator timer";

// --------------------------------------------------
// CALCULATE REMAINING TIME
// --------------------------------------------------

/**
 * Calculate the remaining time using the deadline.
 * This avoids relying on interval tick accuracy.
 */
export function remainingTime(
  timer: LabTimer,
  now = Date.now()
): number {
  if (
    timer.status === "running" &&
    timer.endsAt !== null
  ) {
    return Math.max(0, timer.endsAt - now);
  }

  return timer.remainingMs;
}

// --------------------------------------------------
// RECONCILE TIMER STATUS
// --------------------------------------------------

/**
 * Mark a running timer as finished
 * when its deadline has been reached.
 */
export function reconcileTimer(
  timer: LabTimer,
  now = Date.now()
): LabTimer {
  if (
    timer.status === "running" &&
    remainingTime(timer, now) === 0
  ) {
    return {
      ...timer,
      status: "finished",
      remainingMs: 0,
      endsAt: null,
      updatedAt: now,
    };
  }

  return timer;
}

// --------------------------------------------------
// PERSIST TIMER
// --------------------------------------------------

/**
 * Save a timer in IndexedDB.
 */
export async function setTimer(
  timer: LabTimer
): Promise<void> {
  await db.timers.put(timer);
}

// --------------------------------------------------
// GET OR CREATE TIMER
// --------------------------------------------------

/**
 * Retrieve the timer associated with a session step.
 * Create a default 30-second timer if none exists.
 * `label` is the readable name stored with the record.
 */
export async function ensureTimer(
  sessionId: string,
  stepId: string,
  label?: string
): Promise<LabTimer> {
  const id = `${sessionId}:${stepId}`;

  // Read + create in ONE read-write transaction: Dexie queues
  // concurrent transactions, so a second caller (e.g. React
  // StrictMode running the effect twice) sees the timer created
  // by the first one instead of hitting a ConstraintError.
  return db.transaction("rw", db.timers, async () => {
    const existingTimer = await db.timers.get(id);

    if (existingTimer) {
      // Timers saved before labels existed (or whose protocol was
      // renamed) get their readable label here, in the same transaction.
      if (label && existingTimer.label !== label) {
        const labelled = { ...existingTimer, label };

        await db.timers.put(labelled);

        return labelled;
      }

      return existingTimer;
    }

    const timer: LabTimer = {
      id,
      sessionId,
      stepId,
      durationMs: DEFAULT_DURATION_MS,
      remainingMs: DEFAULT_DURATION_MS,
      endsAt: null,
      status: "idle",
      updatedAt: Date.now(),
      label,
    };

    await db.timers.add(timer);

    return timer;
  });
}

// --------------------------------------------------
// FINISH DUE TIMERS (global watcher)
// --------------------------------------------------

/**
 * A timer that ended while the app was closed is marked finished
 * silently once it is older than this: an alert hours late would
 * only be confusing.
 */
export const LATE_ALERT_WINDOW_MS = 5 * 60_000;

/**
 * Mark every running timer whose deadline has passed as finished,
 * and return the ones that should raise an alert.
 *
 * Read and write happen in ONE read-write transaction, so each
 * timer is returned exactly once, even if several callers (or
 * several browser tabs) run this at the same time.
 */
export async function finishDueTimers(
  now = Date.now()
): Promise<LabTimer[]> {
  return db.transaction("rw", db.timers, async () => {
    const timers = await db.timers.toArray();
    const toAlert: LabTimer[] = [];

    for (const timer of timers) {
      if (
        timer.status !== "running" ||
        timer.endsAt === null ||
        timer.endsAt > now
      ) {
        continue;
      }

      await db.timers.put(reconcileTimer(timer, now));

      if (now - timer.endsAt <= LATE_ALERT_WINDOW_MS) {
        toAlert.push(timer);
      }
    }

    return toAlert;
  });
}

// --------------------------------------------------
// UPDATE TIMER STATE
// --------------------------------------------------

/**
 * Apply a timer action without directly modifying
 * the original timer object.
 */
export function updateTimer(
  timer: LabTimer,
  action: TimerAction,
  now = Date.now()
): LabTimer {
  if (action === "reset") {
    return {
      ...timer,
      status: "idle",
      remainingMs: timer.durationMs,
      endsAt: null,
      updatedAt: now,
    };
  }

  if (action === "pause") {
    return {
      ...timer,
      status: "paused",
      remainingMs: remainingTime(timer, now),
      endsAt: null,
      updatedAt: now,
    };
  }

  const remaining =
    timer.status === "finished"
      ? timer.durationMs
      : remainingTime(timer, now);

  return {
    ...timer,
    status: "running",
    remainingMs: remaining,
    endsAt: now + remaining,
    updatedAt: now,
  };
}
