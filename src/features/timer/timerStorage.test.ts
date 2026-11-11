import "fake-indexeddb/auto";

import { beforeEach, describe, expect, it } from "vitest";

import { db } from "../../db/database";
import {
  ensureTimer,
  setTimer,
  updateTimer,
} from "./timerService";

describe("BenchFlow — Timer IndexedDB Storage", () => {
  beforeEach(async () => {
    // Only clears the simulated test database.
    await db.timers.clear();
  });

  it("creates a timer for a new protocol session", async () => {
    const timer = await ensureTimer(
      "session-test",
      "step-test"
    );

    expect(timer.id).toBe("session-test:step-test");
    expect(timer.status).toBe("idle");
    expect(timer.durationMs).toBe(30_000);
  });

  it("retrieves an existing timer", async () => {
    const first = await ensureTimer(
      "session-test",
      "step-test"
    );

    const second = await ensureTimer(
      "session-test",
      "step-test"
    );

    expect(second.id).toBe(first.id);
    expect(second.updatedAt).toBe(first.updatedAt);
  });

  it("saves the timer after starting it", async () => {
    const timer = await ensureTimer(
      "session-test",
      "step-test"
    );

    const started = updateTimer(
      timer,
      "start",
      1_000
    );

    await setTimer(started);

    const saved = await db.timers.get(started.id);

    expect(saved?.status).toBe("running");
    expect(saved?.endsAt).toBe(31_000);
  });

  it("keeps timers independent between steps", async () => {
    const first = await ensureTimer(
      "session-test",
      "step-1"
    );

    const second = await ensureTimer(
      "session-test",
      "step-2"
    );

    expect(first.id).not.toBe(second.id);

    const started = updateTimer(
      first,
      "start",
      1_000
    );

    await setTimer(started);

    const savedSecond = await db.timers.get(second.id);

    expect(savedSecond?.status).toBe("idle");
  });

  it("survives two concurrent ensureTimer calls (React StrictMode double effect)", async () => {
    const [a, b] = await Promise.all([
      ensureTimer("session-race", "step-race"),
      ensureTimer("session-race", "step-race"),
    ]);

    expect(a.id).toBe(b.id);
    expect(
      await db.timers.where("sessionId").equals("session-race").count()
    ).toBe(1);
  });
});
