import {
  btn,
  buttonRow,
  errorMessage,
  mutedText,
} from "../../components/ui";
import { twoDigits } from "../../utils/format";

import type { useLabTimer } from "./useLabTimer";

type TimerViewProps = ReturnType<typeof useLabTimer> & {
  /** Shown in the "Timer completed" banner. */
  stepTitle?: string;
};

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

  return hours > 0
    ? `${twoDigits(hours)}:${twoDigits(minutes)}:${twoDigits(seconds)}`
    : `${twoDigits(minutes)}:${twoDigits(seconds)}`;
}

export function TimerView({
  timer,
  remaining,
  duration,
  setDuration,
  error,
  notificationSupport,
  enableNotifications,
  apply,
  changeDuration,
  stepTitle,
}: TimerViewProps) {
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
          onClick={() => void enableNotifications()}
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
