// ==================================================
// BENCHFLOW — TIMER ALERTS (NOTIF-01)
// ==================================================
//
// Everything here runs in the browser only (no backend, no push
// server). Each helper degrades silently when the browser lacks
// the API or the user refuses: the in-app alert shown by
// TimerPanel always remains the reliable fallback.

export type NotificationSupport =
  | "unsupported"
  | "default"
  | "granted"
  | "denied";

// --------------------------------------------------
// SOUND (Web Audio API — no audio file to cache)
// --------------------------------------------------

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;

  const Ctor =
    window.AudioContext ??
    (
      window as unknown as {
        webkitAudioContext?: typeof AudioContext;
      }
    ).webkitAudioContext;

  if (!Ctor) return null;

  audioContext ??= new Ctor();

  return audioContext;
}

/**
 * Browsers only allow sound after a user gesture.
 * Call this from the "Start" click so the beep can
 * play later, when the timer reaches zero.
 */
export function unlockAudio(): void {
  try {
    void getAudioContext()?.resume();
  } catch {
    // Sound is optional: ignore.
  }
}

/**
 * Play three short beeps. Returns false when the browser
 * blocks or does not support audio.
 */
export function playTimerSound(): boolean {
  try {
    const context = getAudioContext();

    if (!context || context.state !== "running") {
      return false;
    }

    for (let beep = 0; beep < 3; beep += 1) {
      const start = context.currentTime + beep * 0.35;
      const oscillator = context.createOscillator();
      const gain = context.createGain();

      oscillator.type = "sine";
      oscillator.frequency.value = 880;

      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.25, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.25);

      oscillator.connect(gain);
      gain.connect(context.destination);

      oscillator.start(start);
      oscillator.stop(start + 0.3);
    }

    return true;
  } catch {
    return false;
  }
}

// --------------------------------------------------
// SYSTEM NOTIFICATION (explicit user consent only)
// --------------------------------------------------

export function getNotificationSupport(): NotificationSupport {
  if (typeof Notification === "undefined") {
    return "unsupported";
  }

  return Notification.permission;
}

/**
 * Must be called from a click handler: the permission
 * prompt is never shown automatically.
 */
export async function requestNotificationPermission(): Promise<NotificationSupport> {
  if (typeof Notification === "undefined") {
    return "unsupported";
  }

  try {
    return await Notification.requestPermission();
  } catch {
    return getNotificationSupport();
  }
}

/**
 * Show a system notification when permission was granted.
 * Prefers the service worker (required on Android Chrome),
 * falls back to the Notification constructor on desktop.
 */
export async function showSystemNotification(
  title: string,
  body: string
): Promise<boolean> {
  if (getNotificationSupport() !== "granted") return false;

  try {
    const registration =
      "serviceWorker" in navigator
        ? await navigator.serviceWorker.getRegistration()
        : undefined;

    if (registration) {
      await registration.showNotification(title, {
        body,
        icon: "/icons/icon-192.png",
        tag: "benchflow-timer",
      });
    } else {
      new Notification(title, {
        body,
        icon: "/icons/icon-192.png",
        tag: "benchflow-timer",
      });
    }

    return true;
  } catch {
    return false;
  }
}

// --------------------------------------------------
// ALL-IN-ONE ALERT
// --------------------------------------------------

/**
 * Fire the sound and the system notification (if allowed)
 * for a finished timer. The visible banner is rendered by
 * the component itself and does not depend on this call.
 */
export async function alertTimerFinished(
  label: string
): Promise<{ sound: boolean; notification: boolean }> {
  const sound = playTimerSound();

  const notification = await showSystemNotification(
    "Timer finished",
    label
  );

  return { sound, notification };
}
