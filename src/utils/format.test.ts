import { describe, expect, it } from "vitest";

import { twoDigits } from "./format";

describe("twoDigits", () => {
  it("adds a leading zero to single-digit numbers", () => {
    expect(twoDigits(7)).toBe("07");
  });

  it("keeps numbers that already have two digits", () => {
    expect(twoDigits(42)).toBe("42");
  });
});
