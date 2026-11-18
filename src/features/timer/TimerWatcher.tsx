import { useLiveQuery } from "dexie-react-hooks";
import { useEffect, useState } from "react";

import { db } from "../../db/database";
import { alertTimerFinished, timerFinishedMessage } from "./timerAlerts";
import { finishDueTimers } from "./timerService";

type FinishedBanner = { id: string; message: string };

/**
 * Global watcher, mounted once in the Layout: it raises the
 * end-of-timer alert (sound, system notification and an in-app
 * banner) for EVERY running timer (session steps and calculator),
 * whatever page is displayed.
 *
 * Banners stay until the user closes them: in the lab, an alert
 * that disappears by itself can be missed.
 *
 * Limit: this is a local alert. If the app is closed, nothing can
 * run (a push server would be needed, outside the V1 scope).
 */
export function TimerWatcher() {
  const [banners, setBanners] = useState<FinishedBanner[]>([]);

  // Earliest deadline among the running timers; the query is
  // live, so it updates when a timer starts, pauses or resets.
  const nextDeadline = useLiveQuery(async () => {
    const deadlines = (await db.timers.toArray())
      .filter(
        (timer) =>
          timer.status === "running" && timer.endsAt !== null
      )
      .map((timer) => timer.endsAt as number);

    return deadlines.length > 0 ? Math.min(...deadlines) : null;
  });

  useEffect(() => {
    if (nextDeadline == null) return;

    async function check() {
      for (const timer of await finishDueTimers()) {
        const message = timerFinishedMessage(timer.label);

        setBanners((current) => [
          ...current,
          { id: `${timer.id}:${Date.now()}`, message },
        ]);

        await alertTimerFinished(message);
      }
    }

    function checkWhenVisible() {
      if (document.visibilityState === "visible") {
        void check();
      }
    }

    const timeoutId = window.setTimeout(
      () => void check(),
      Math.max(0, nextDeadline - Date.now()) + 50
    );

    // Timeouts are throttled in background tabs: check again
    // as soon as the app is back in the foreground.
    document.addEventListener("visibilitychange", checkWhenVisible);
    window.addEventListener("focus", checkWhenVisible);

    return () => {
      window.clearTimeout(timeoutId);
      document.removeEventListener("visibilitychange", checkWhenVisible);
      window.removeEventListener("focus", checkWhenVisible);
    };
  }, [nextDeadline]);

  if (banners.length === 0) return null;

  return (
    <div className="fixed inset-x-0 top-3 z-50 mx-auto grid w-[min(92vw,560px)] gap-2">
      {banners.map((banner) => (
        <div
          key={banner.id}
          role="alert"
          className="flex items-center justify-between gap-3 rounded-[10px] border border-alert-line bg-alert px-[14px] py-3 font-bold text-alert-ink shadow-lg motion-safe:animate-timer-pulse"
        >
          <span>⏰ {banner.message}</span>

          <button
            type="button"
            className="rounded-[8px] px-2 py-1 text-[.85rem] underline"
            onClick={() =>
              setBanners((current) =>
                current.filter(({ id }) => id !== banner.id)
              )
            }
          >
            Close
          </button>
        </div>
      ))}
    </div>
  );
}
