
import { useEffect, useRef, useState } from "react";

import {
  btn,
  buttonRow,
  errorMessage,
  mutedText,
} from "../../components/ui";
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

type TimerPanelProps = {
  sessionId?: string;
  stepId?: string;
  /** Shown in the end-of-timer alert (e.g. "Cell Lysis"). */
  stepTitle?: string;
};

type TimerAction = "start" | "pause" | "reset";

const STORAGE_ERROR =
  "Timer storage unavailable. The timer will still work, but changes may not be saved.";

const TIMER_PRESETS = [
  { label: "30 sec", seconds: 30 },
  { label: "1 min", seconds: 60 },
  { label: "5 min", seconds: 300 },
  { label: "10 min", seconds: 600 },
  { label: "15 min", seconds: 900 },
  { label: "30 min", seconds: 1800 },
  { label: "45 min", seconds: 2700 },
  { label: "1 hour", seconds: 3600 },
  { label: "2 hours", seconds: 7200 },
  { label: "3 hours", seconds: 10800 },
];

function formatRemaining(milliseconds: number): string {
  const totalSeconds = Math.ceil(
    Math.max(0, milliseconds) / 1000
  );

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const twoDigits = (value: number) =>
    String(value).padStart(2, "0");

  return hours > 0
    ? `${twoDigits(hours)}:${twoDigits(minutes)}:${twoDigits(seconds)}`
    : `${twoDigits(minutes)}:${twoDigits(seconds)}`;
}

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

export function TimerPanel({
  sessionId,
  stepId,
  stepTitle,
}: TimerPanelProps) {
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

  return (
    <div className="text-center">
      <div
        className="p-6 text-[3.8rem] font-extrabold tracking-[-.05em] text-clock"
        aria-live="off"
      >
        {formatRemaining(remaining)}
      </div>

      <p className={mutedText}>
        {timer?.status === "finished"
          ? "Time is up!"
          : timer?.status === "running"
            ? "Timer running"
            : timer?.status === "paused"
              ? "Timer paused"
              : "Ready to start"}
      </p>

      {timer?.status === "finished" && (
        <p
          className="rounded-[10px] border border-alert-line bg-alert px-[14px] py-3 font-bold text-alert-ink motion-safe:animate-timer-pulse"
          role="alert"
        >
          ⏰ Timer completed
          {stepTitle ? ` — ${stepTitle}` : ""}.
        </p>
      )}

      <div className={buttonRow}>
        <button
          type="button"
          className={btn("primary")}
          disabled={
            !timer || timer.status === "running"
          }
          onClick={() => void apply("start")}
        >
          ▶ {timer?.status === "paused"
            ? "Resume"
            : "Start"}
        </button>

        <button
          type="button"
          className={btn("soft")}
          disabled={timer?.status !== "running"}
          onClick={() => void apply("pause")}
        >
          Pause
        </button>

        <button
          type="button"
          className={btn("soft")}
          disabled={!timer}
          onClick={() => void apply("reset")}
        >
          Reset
        </button>
      </div>

      <label className="mx-auto my-5 grid max-w-[210px] gap-[7px] text-left text-[.85rem] font-[650]">
        Duration (seconds)

        <input
          type="number"
          min="1"
          max="86400"
          value={duration}
          onChange={(event) =>
            setDuration(Number(event.target.value))
          }
          onBlur={() =>
            void changeDuration(duration)
          }
        />
      </label>

      <div className={buttonRow}>
        {TIMER_PRESETS.map(({ label, seconds }) => (
          <button
            key={seconds}
            type="button"
            className={btn("soft")}
            disabled={!timer}
            onClick={() =>
              void changeDuration(seconds)
            }
          >
            {label}
          </button>
        ))}
      </div>

      {notificationSupport === "default" && (
        <button
          type="button"
          className={btn("soft", "mt-2")}
          onClick={async () =>
            setNotificationSupport(
              await requestNotificationPermission()
            )
          }
        >
          🔔 Enable system notifications
        </button>
      )}

      {notificationSupport === "denied" && (
        <p className={`${mutedText} text-[.85rem]`}>
          System notifications are blocked: the in-app
          alert and sound remain active.
        </p>
      )}

      {error && (
        <p role="alert" className={errorMessage}>
          {error}
        </p>
      )}
    </div>
  );
}
