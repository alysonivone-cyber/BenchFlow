
import { describe, expect, it } from "vitest";

import {
  remainingTime,
  reconcileTimer,
  updateTimer,
} from "./timerService";

import type { LabTimer } from "../../types/models";

const base: LabTimer = {
  id: "a",
  sessionId: "s",
  stepId: "x",
  durationMs: 30_000,
  remainingMs: 30_000,
  endsAt: null,
  status: "idle",
  updatedAt: 0,
};

describe("Timer Service", () => {
  it("uses timestamps rather than interval counts", () => {
    const started = updateTimer(base, "start", 1_000);

    expect(
      remainingTime(started, 11_000)
    ).toBe(20_000);

    expect(
      updateTimer(started, "pause", 11_000).remainingMs
    ).toBe(20_000);
  });

  it("finishes after the deadline", () => {
    const started = updateTimer(base, "start", 0);

    const finished = reconcileTimer(
      started,
      31_000
    );

    expect(finished.status).toBe("finished");
    expect(finished.remainingMs).toBe(0);
    expect(finished.endsAt).toBeNull();
  });

  it("resumes a paused timer", () => {
    const started = updateTimer(base, "start", 0);
    const paused = updateTimer(started, "pause", 10_000);
    const resumed = updateTimer(paused, "start", 15_000);

    expect(resumed.status).toBe("running");
    expect(resumed.remainingMs).toBe(20_000);
    expect(resumed.endsAt).toBe(35_000);
  });

  it("resets a timer to its initial duration", () => {
    const started = updateTimer(base, "start", 0);
    const reset = updateTimer(started, "reset", 10_000);

    expect(reset.status).toBe("idle");
    expect(reset.remainingMs).toBe(30_000);
    expect(reset.endsAt).toBeNull();
  });

  it("does not finish before the deadline", () => {
    const started = updateTimer(base, "start", 0);
    const result = reconcileTimer(started, 20_000);

    expect(result.status).toBe("running");
    expect(remainingTime(result, 20_000)).toBe(10_000);
  });
});
