import "fake-indexeddb/auto";

import { beforeEach, describe, expect, it } from "vitest";

import { db } from "../../db/database";
import {
  ensureTimer,
  finishDueTimers,
  GLOBAL_TIMER_SESSION_ID,
  GLOBAL_TIMER_STEP_ID,
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

  it("keeps the calculator timer independent from session timers", async () => {
    const session = await ensureTimer(
      "session-test",
      "step-1"
    );

    const calculator = await ensureTimer(
      GLOBAL_TIMER_SESSION_ID,
      GLOBAL_TIMER_STEP_ID
    );

    await setTimer(
      updateTimer(
        { ...session, durationMs: 45_000, remainingMs: 45_000 },
        "start",
        1_000
      )
    );

    await setTimer(
      updateTimer(
        { ...calculator, durationMs: 900_000, remainingMs: 900_000 },
        "start",
        1_000
      )
    );

    const savedSession = await db.timers.get(session.id);
    const savedCalculator = await db.timers.get(calculator.id);

    expect(savedSession?.endsAt).toBe(46_000);
    expect(savedCalculator?.endsAt).toBe(901_000);
    expect(savedCalculator?.id).toBe("global:calculator");
  });

  it("stores a readable label and adds it to an older unlabelled timer", async () => {
    const created = await ensureTimer(
      "session-test",
      "step-1",
      "20261118-1141 · DNA Extraction · Cell Lysis"
    );

    expect(created.label).toBe(
      "20261118-1141 · DNA Extraction · Cell Lysis"
    );

    // Timer saved before labels existed.
    await db.timers.put({ ...created, id: "old:step", label: undefined });

    const backfilled = await ensureTimer("old", "step", "Readable name");

    expect(backfilled.label).toBe("Readable name");
    expect((await db.timers.get("old:step"))?.label).toBe("Readable name");
  });

  it("finishes due timers once and alerts only recent ones", async () => {
    const due = updateTimer(
      await ensureTimer("s", "due", "Due"),
      "start",
      0
    ); // ends at 30 000
    const later = updateTimer(
      await ensureTimer("s", "later", "Later"),
      "start",
      0
    );
    const old = updateTimer(
      await ensureTimer("s", "old", "Old"),
      "start",
      0
    );

    await setTimer(due);
    await setTimer({ ...later, endsAt: 900_000 });
    await setTimer({ ...old, endsAt: 1_000 });

    const alerts = await finishDueTimers(40_000);

    expect(alerts.map((timer) => timer.stepId).sort()).toEqual([
      "due",
      "old",
    ]);
    expect((await db.timers.get("s:due"))?.status).toBe("finished");
    expect((await db.timers.get("s:later"))?.status).toBe("running");

    // Second call: nothing left to alert (exactly-once).
    expect(await finishDueTimers(40_000)).toEqual([]);
  });

  it("marks a long-expired timer finished without alerting", async () => {
    const timer = updateTimer(
      await ensureTimer("s", "stale"),
      "start",
      0
    );

    await setTimer(timer);

    expect(await finishDueTimers(10 * 60_000)).toEqual([]);
    expect((await db.timers.get("s:stale"))?.status).toBe("finished");
  });
});
