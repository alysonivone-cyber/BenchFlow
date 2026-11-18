import { useEffect, useRef, useState } from "react";

import type { LabTimer } from "../../types/models";

import {
  getNotificationSupport,
  requestNotificationPermission,
  unlockAudio,
  type NotificationSupport,
} from "./timerAlerts";

import {
  ensureTimer,
  reconcileTimer,
  remainingTime,
  setTimer,
  updateTimer,
} from "./timerService";

export type TimerAction = "start" | "pause" | "reset";

export type UseLabTimerOptions = {
  sessionId: string;
  stepId: string;
  /** Readable name stored with the timer record. */
  label?: string;
};

const STORAGE_ERROR =
  "Timer storage unavailable. The timer will still work, but changes may not be saved.";

function createLocalTimer(
  sessionId: string,
  stepId: string,
  label?: string,
  seconds = 30
): LabTimer {
  return {
    id: `${sessionId}:${stepId}`,
    sessionId,
    stepId,
    durationMs: seconds * 1000,
    remainingMs: seconds * 1000,
    endsAt: null,
    status: "idle",
    updatedAt: Date.now(),
    label,
  };
}

/**
 * Timer logic shared by the session timer and the calculator
 * timer: loading, persistence in IndexedDB, ticking, and the
 * running -> finished transition. The display lives in TimerView.
 */
export function useLabTimer({
  sessionId,
  stepId,
  label,
}: UseLabTimerOptions) {
  const [timer, setLocalTimer] = useState<LabTimer | null>(
    null
  );

  const [duration, setDuration] = useState(30);
  const [now, setNow] = useState(Date.now());
  const [error, setError] = useState("");
  const [notificationSupport, setNotificationSupport] =
    useState<NotificationSupport>(getNotificationSupport);

  const timerRef = useRef<LabTimer | null>(null);

  function updateLocalTimer(next: LabTimer) {
    timerRef.current = next;
    setLocalTimer(next);
  }

  useEffect(() => {
    let active = true;

    setError("");

    // Nothing is displayed until the saved timer is loaded: a
    // temporary 30 s timer would flash on screen after a refresh.
    timerRef.current = null;
    setLocalTimer(null);
    setDuration(30);

    ensureTimer(sessionId, stepId, label)
      .then((savedTimer) => {
        if (!active) return;

        // Take the time NOW: the `now` state may be up to 250 ms old,
        // which made the display show one second too much and then
        // drop by one second at the next tick.
        const loadedAt = Date.now();
        const restored = reconcileTimer(savedTimer, loadedAt);

        setNow(loadedAt);
        updateLocalTimer(restored);
        setDuration(
          Math.max(
            1,
            Math.round(restored.durationMs / 1000)
          )
        );
      })
      .catch(() => {
        if (!active) return;

        // The timer still works in memory, but is not saved.
        updateLocalTimer(
          createLocalTimer(sessionId, stepId, label)
        );
        setError(STORAGE_ERROR);
      });

    return () => {
      active = false;
    };
  }, [sessionId, stepId, label]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, 250);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  async function persist(next: LabTimer) {
    // A failure is reported but never disables saving:
    // the next action simply tries again.
    try {
      await setTimer(next);
      setError("");
    } catch {
      setError(STORAGE_ERROR);
    }
  }

  // Refresh the display as soon as the app returns to the
  // foreground: intervals are throttled in background tabs,
  // but the remaining time is derived from `endsAt`.
  useEffect(() => {
    function refresh() {
      if (document.visibilityState === "visible") {
        setNow(Date.now());
      }
    }

    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("focus", refresh);

    return () => {
      document.removeEventListener("visibilitychange", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, []);

  // Show the running -> finished transition on screen. Marking
  // the record as finished and raising the alert is the job of
  // TimerWatcher (mounted in the Layout), so it also works on the
  // pages where this timer is not displayed.
  useEffect(() => {
    const current = timerRef.current;

    if (
      current?.status === "running" &&
      remainingTime(current, now) === 0
    ) {
      updateLocalTimer(reconcileTimer(current, now));
    }
  }, [now]);

  async function apply(action: TimerAction) {
    const current = timerRef.current;

    if (!current) return;

    // Start is a user gesture: allow the end-of-timer beep.
    if (action === "start") unlockAudio();

    const next = updateTimer(current, action);

    updateLocalTimer(next);
    setNow(Date.now());

    await persist(next);
  }

  async function changeDuration(seconds: number) {
    const current = timerRef.current;

    if (
      !current ||
      !Number.isFinite(seconds) ||
      seconds < 1 ||
      seconds > 86400
    ) {
      return;
    }

    const next: LabTimer = {
      ...current,
      durationMs: seconds * 1000,
      remainingMs: seconds * 1000,
      endsAt: null,
      status: "idle",
      updatedAt: Date.now(),
    };

    setDuration(seconds);
    updateLocalTimer(next);

    await persist(next);
  }

  const remaining = timer
    ? remainingTime(timer, now)
    : 0;

  async function enableNotifications() {
    setNotificationSupport(
      await requestNotificationPermission()
    );
  }

  return {
    timer,
    remaining,
    duration,
    setDuration,
    error,
    notificationSupport,
    enableNotifications,
    apply,
    changeDuration,
  };
}
