import { db } from "../../db/database";
import type { LabTimer } from "../../types/models";

type TimerAction = "start" | "pause" | "reset";

const DEFAULT_DURATION_MS = 30_000;

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
 */
export async function ensureTimer(
  sessionId: string,
  stepId: string
): Promise<LabTimer> {
  const id = `${sessionId}:${stepId}`;

  // Read + create in ONE read-write transaction: Dexie queues
  // concurrent transactions, so a second caller (e.g. React
  // StrictMode running the effect twice) sees the timer created
  // by the first one instead of hitting a ConstraintError.
  return db.transaction("rw", db.timers, async () => {
    const existingTimer = await db.timers.get(id);

    if (existingTimer) {
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
    };

    await db.timers.add(timer);

    return timer;
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
