import { useLiveQuery } from "dexie-react-hooks";
import { useEffect } from "react";

import { db } from "../../db/database";
import { alertTimerFinished } from "./timerAlerts";
import { finishDueTimers } from "./timerService";

/**
 * Global watcher, mounted once in the Layout: it raises the
 * end-of-timer alert for EVERY running timer (session steps and
 * calculator), whatever page is displayed. It renders nothing.
 *
 * Limit: this is a local alert. If the app is closed, nothing can
 * run (a push server would be needed, outside the V1 scope).
 */
export function TimerWatcher() {
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
        await alertTimerFinished(
          timer.label
            ? `Timer "${timer.label}" is complete.`
            : "Your timer is complete."
        );
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

  return null;
}
