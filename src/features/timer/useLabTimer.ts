import { useEffect, useRef, useState } from "react";

import type { LabTimer } from "../../types/models";

import {
  alertTimerFinished,
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
  sessionId?: string;
  stepId?: string;
  /** Shown in the end-of-timer alert (e.g. "Cell Lysis"). */
  stepTitle?: string;
};

const STORAGE_ERROR =
  "Timer storage unavailable. The timer will still work, but changes may not be saved.";

function createLocalTimer(
  sessionId = "",
  stepId = "",
  seconds = 30
): LabTimer {
  return {
    id:
      sessionId && stepId
        ? `${sessionId}:${stepId}`
        : "practice",
    sessionId,
    stepId,
    durationMs: seconds * 1000,
    remainingMs: seconds * 1000,
    endsAt: null,
    status: "idle",
    updatedAt: Date.now(),
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
  stepTitle,
}: UseLabTimerOptions) {
  const [timer, setLocalTimer] = useState<LabTimer | null>(
    null
  );

  const [duration, setDuration] = useState(30);
  const [now, setNow] = useState(Date.now());
  const [error, setError] = useState("");
  const [notificationSupport, setNotificationSupport] =
    useState<NotificationSupport>(getNotificationSupport);

  const persistent = Boolean(sessionId && stepId);

  const timerRef = useRef<LabTimer | null>(null);

  function updateLocalTimer(next: LabTimer) {
    timerRef.current = next;
    setLocalTimer(next);
  }

  useEffect(() => {
    let active = true;

    setError("");

    const fallback = createLocalTimer(
      sessionId,
      stepId
    );

    timerRef.current = fallback;
    setLocalTimer(fallback);
    setDuration(30);

    if (sessionId && stepId) {
      ensureTimer(sessionId, stepId)
        .then((savedTimer) => {
          if (!active) return;

          const restored = reconcileTimer(savedTimer);

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

          setError(STORAGE_ERROR);
        });
    }

    return () => {
      active = false;
    };
  }, [sessionId, stepId]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, 250);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  async function persist(next: LabTimer) {
    if (!persistent) return;

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

  // Detect the running -> finished transition while the app
  // is open. The ref check guarantees the alert fires once,
  // even if this effect runs twice (React StrictMode).
  useEffect(() => {
    const current = timerRef.current;

    if (
      current?.status === "running" &&
      remainingTime(current, now) === 0
    ) {
      const finished = reconcileTimer(current, now);

      updateLocalTimer(finished);
      void persist(finished);

      void alertTimerFinished(
        stepTitle
          ? `Step "${stepTitle}" is complete.`
          : "Your timer is complete."
      );
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
