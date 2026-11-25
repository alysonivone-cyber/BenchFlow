import { useEffect } from "react";

// --------------------------------------------------
// WAKE LOCK (L-01)
// Keeps the screen on while `active` is true, so the
// screen does not turn off during a lab session.
// The Screen Wake Lock API is not available in every
// browser: when it is missing, this hook does nothing.
// --------------------------------------------------

export function useWakeLock(active: boolean): void {
  useEffect(() => {
    if (!active || !("wakeLock" in navigator)) return;

    let sentinel: WakeLockSentinel | null = null;
    let cancelled = false;

    async function acquire(): Promise<void> {
      try {
        const lock = await navigator.wakeLock.request("screen");
        if (cancelled) {
          await lock.release();
          return;
        }
        sentinel = lock;
      } catch {
        // The browser can refuse (for example in battery saver mode).
        // The app keeps working: the screen may simply turn off.
      }
    }

    // The browser releases the lock by itself when the tab is hidden:
    // ask for it again when the tab becomes visible.
    function onVisibilityChange(): void {
      if (document.visibilityState === "visible" && (!sentinel || sentinel.released)) {
        void acquire();
      }
    }

    void acquire();
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisibilityChange);
      void sentinel?.release();
    };
  }, [active]);
}
