import { describe, expect, it } from "vitest";

import {
  fileBaseName,
  formatDateStamp,
  formatSessionName,
  formatSessionStamp,
} from "./sessionLabel";

// Local-time constructor: the expected text does not depend
// on the time zone of the machine running the tests.
const NOV_11_2026_14_23 = new Date(2026, 10, 11, 14, 23).getTime();

describe("BenchFlow — readable session names", () => {
  it("formats the date as YYYYMMDD", () => {
    expect(formatDateStamp(NOV_11_2026_14_23)).toBe("20261111");
  });

  it("adds the time as HHmm", () => {
    expect(formatSessionStamp(NOV_11_2026_14_23)).toBe(
      "20261111-1423"
    );
  });

  it("pads single-digit months, days, hours and minutes", () => {
    const early = new Date(2026, 0, 5, 7, 4).getTime();

    expect(formatSessionStamp(early)).toBe("20260105-0704");
  });

  it("builds the name from date and protocol title", () => {
    expect(
      formatSessionName(NOV_11_2026_14_23, "Strawberry DNA Extraction")
    ).toBe("20261111-1423 · Strawberry DNA Extraction");
  });

  it("removes only the last extension of a file name", () => {
    expect(fileBaseName("protocol.v2.pdf")).toBe("protocol.v2");
    expect(fileBaseName("no-extension")).toBe("no-extension");
  });
});
