import { describe, expect, it } from "vitest";

import { formatClock, twoDigits } from "./format";

describe("twoDigits", () => {
  it("adds a leading zero to single-digit numbers", () => {
    expect(twoDigits(7)).toBe("07");
  });

  it("keeps numbers that already have two digits", () => {
    expect(twoDigits(42)).toBe("42");
  });
});

describe("formatClock", () => {
  it("shows minutes and seconds under one hour", () => {
    expect(formatClock(272_000)).toBe("04:32");
  });

  it("shows hours from one hour", () => {
    expect(formatClock(3_725_000)).toBe("01:02:05");
  });

  it("rounds up so 00:00 only appears at the end", () => {
    expect(formatClock(100)).toBe("00:01");
    expect(formatClock(0)).toBe("00:00");
  });

  it("never goes negative", () => {
    expect(formatClock(-5000)).toBe("00:00");
  });
});
