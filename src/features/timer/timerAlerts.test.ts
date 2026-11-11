import { afterEach, describe, expect, it, vi } from "vitest";

import {
  alertTimerFinished,
  getNotificationSupport,
  requestNotificationPermission,
  showSystemNotification,
} from "./timerAlerts";

describe("BenchFlow — Timer alerts (NOTIF-01)", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("reports 'unsupported' when the Notification API is missing", () => {
    expect(getNotificationSupport()).toBe("unsupported");
  });

  it("never throws and returns false without permission", async () => {
    expect(await showSystemNotification("t", "b")).toBe(false);

    const result = await alertTimerFinished("Step done");

    expect(result).toEqual({ sound: false, notification: false });
  });

  it("does not notify when the user refused", async () => {
    const ctor = vi.fn();
    vi.stubGlobal("Notification", Object.assign(ctor, { permission: "denied" }));

    expect(getNotificationSupport()).toBe("denied");
    expect(await showSystemNotification("t", "b")).toBe(false);
    expect(ctor).not.toHaveBeenCalled();
  });

  it("returns the permission chosen by the user", async () => {
    vi.stubGlobal("Notification", {
      permission: "default",
      requestPermission: vi.fn().mockResolvedValue("granted"),
    });

    expect(await requestNotificationPermission()).toBe("granted");
  });

  it("falls back safely if the permission prompt throws", async () => {
    vi.stubGlobal("Notification", {
      permission: "default",
      requestPermission: vi.fn().mockRejectedValue(new Error("blocked")),
    });

    expect(await requestNotificationPermission()).toBe("default");
  });
});
