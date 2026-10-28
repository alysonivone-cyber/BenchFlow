
import { describe, expect, it } from "vitest";

import {
  calculateDilution,
  convertVolume,
  solveDilution,
} from "./calculations";

// --------------------------------------------------
// SCIENTIFIC CALCULATOR TESTS
// --------------------------------------------------

describe("Scientific Calculator", () => {
  const units = {
    c1: "mg/mL" as const,
    c2: "mg/mL" as const,
    v1: "mL" as const,
    v2: "mL" as const,
  };

  // --------------------------------------------------
  // SIMPLE DILUTION
  // --------------------------------------------------

  it("calculates a dilution", () => {
    expect(calculateDilution(1, 0.1, 10)).toBe(1);
  });

  it("rejects impossible dilutions", () => {
    expect(() =>
      calculateDilution(1, 2, 10)
    ).toThrow();
  });

  // --------------------------------------------------
  // SOLVE ALL DILUTION VARIABLES
  // --------------------------------------------------

  it("calculates stock concentration C1", () => {
    expect(
      solveDilution(
        "c1",
        { c1: 0, v1: 1, c2: 0.1, v2: 10 },
        units
      )
    ).toBe(1);
  });

  it("calculates stock volume V1", () => {
    expect(
      solveDilution(
        "v1",
        { c1: 1, v1: 0, c2: 0.1, v2: 10 },
        units
      )
    ).toBe(1);
  });

  it("calculates final concentration C2", () => {
    expect(
      solveDilution(
        "c2",
        { c1: 1, v1: 1, c2: 0, v2: 10 },
        units
      )
    ).toBeCloseTo(0.1);
  });

  it("calculates final volume V2", () => {
    expect(
      solveDilution(
        "v2",
        { c1: 1, v1: 1, c2: 0.1, v2: 0 },
        units
      )
    ).toBe(10);
  });

  // --------------------------------------------------
  // UNIT CONVERSIONS
  // --------------------------------------------------

  it("converts µL to mL", () => {
    expect(convertVolume(500, "µL", "mL")).toBe(0.5);
  });

  it("converts mL to µL", () => {
    expect(convertVolume(1.5, "mL", "µL")).toBe(1500);
  });

  it("converts concentrations correctly", () => {
    const result = solveDilution(
      "v1",
      {
        c1: 1000,
        v1: 0,
        c2: 0.1,
        v2: 10,
      },
      {
        c1: "µg/mL",
        c2: "mg/mL",
        v1: "mL",
        v2: "mL",
      }
    );

    expect(result).toBe(1);
  });

  // --------------------------------------------------
  // INPUT VALIDATION
  // --------------------------------------------------

  it("rejects negative concentrations", () => {
    expect(() =>
      calculateDilution(-1, 0.1, 10)
    ).toThrow();
  });

  it("rejects zero stock concentration", () => {
    expect(() =>
      calculateDilution(0, 0.1, 10)
    ).toThrow();
  });

  it("rejects negative volumes", () => {
    expect(() =>
      convertVolume(-10, "mL", "µL")
    ).toThrow();
  });

  it("rejects invalid volume values", () => {
    expect(() =>
      convertVolume(NaN, "mL", "µL")
    ).toThrow();
  });
});
