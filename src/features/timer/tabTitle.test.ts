import { describe, expect, it } from "vitest";

import { BASE_TAB_TITLE, timerTabTitle } from "./tabTitle";

describe("timerTabTitle", () => {
  it("shows the remaining time before the app name", () => {
    expect(timerTabTitle(272_000)).toBe("⏱ 04:32 · BenchFlow");
  });

  it("restores the plain title when no timer runs", () => {
    expect(timerTabTitle(null)).toBe(BASE_TAB_TITLE);
  });
});
