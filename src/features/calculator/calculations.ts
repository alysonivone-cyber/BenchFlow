
// --------------------------------------------------
// SCIENTIFIC CALCULATOR TYPES
// --------------------------------------------------

export type DilutionVariable = "c1" | "v1" | "c2" | "v2";

export type VolumeUnit = "µL" | "mL";

export type ConcentrationUnit =
  | "mg/mL"
  | "µg/mL"
  | "g/L";

type DilutionValues = Record<DilutionVariable, number>;

type DilutionUnits = {
  c1: ConcentrationUnit;
  c2: ConcentrationUnit;
  v1: VolumeUnit;
  v2: VolumeUnit;
};

// --------------------------------------------------
// UNIT CONVERSION FACTORS
// --------------------------------------------------

// Concentrations are normalized to mg/mL.
const concentrationFactor: Record<
  ConcentrationUnit,
  number
> = {
  "mg/mL": 1,
  "µg/mL": 0.001,
  "g/L": 1,
};

// Volumes are normalized to mL.
const volumeFactor: Record<VolumeUnit, number> = {
  "µL": 0.001,
  "mL": 1,
};

// --------------------------------------------------
// DILUTION EQUATION
// C1 × V1 = C2 × V2
// --------------------------------------------------

/**
 * Solve a simple dilution equation for the
 * selected unknown variable.
 *
 * All values are converted to common units
 * before calculation.
 */
export function solveDilution(
  target: DilutionVariable,
  inputs: DilutionValues,
  units: DilutionUnits
): number {
  const normalized: DilutionValues = {
    c1: inputs.c1 * concentrationFactor[units.c1],
    c2: inputs.c2 * concentrationFactor[units.c2],
    v1: inputs.v1 * volumeFactor[units.v1],
    v2: inputs.v2 * volumeFactor[units.v2],
  };

  // Validate the three known values.
  for (const variable of [
    "c1",
    "c2",
    "v1",
    "v2",
  ] as DilutionVariable[]) {
    if (
      variable !== target &&
      (!Number.isFinite(normalized[variable]) ||
        normalized[variable] <= 0)
    ) {
      throw new Error(
        "Enter three positive, valid values."
      );
    }
  }

  let value: number;

  // Solve for the selected variable.
  switch (target) {
    case "c1":
      value =
        (normalized.c2 * normalized.v2) /
        normalized.v1;
      break;

    case "v1":
      value =
        (normalized.c2 * normalized.v2) /
        normalized.c1;
      break;

    case "c2":
      value =
        (normalized.c1 * normalized.v1) /
        normalized.v2;
      break;

    case "v2":
      value =
        (normalized.c1 * normalized.v1) /
        normalized.c2;
      break;
  }

  normalized[target] = value;

  // A simple dilution cannot increase concentration.
  if (normalized.c2 > normalized.c1 + 1e-10) {
    throw new Error(
      "A simple dilution cannot increase concentration (C₂ > C₁)."
    );
  }

  // Stock volume cannot exceed final volume.
  if (normalized.v1 > normalized.v2 + 1e-10) {
    throw new Error(
      "Stock volume V₁ cannot exceed final volume V₂."
    );
  }

  // Convert the result back to the selected unit.
  if (target === "c1" || target === "c2") {
    return (
      value / concentrationFactor[units[target]]
    );
  }

  return value / volumeFactor[units[target]];
}

// --------------------------------------------------
// SIMPLE DILUTION CALCULATOR
// --------------------------------------------------

/**
 * Calculate the required stock volume V1
 * using C1, C2 and V2.
 *
 * Concentrations: mg/mL
 * Volumes: mL
 */
export function calculateDilution(
  c1: number,
  c2: number,
  v2: number
): number {
  return solveDilution(
    "v1",
    {
      c1,
      c2,
      v2,
      v1: 0,
    },
    {
      c1: "mg/mL",
      c2: "mg/mL",
      v1: "mL",
      v2: "mL",
    }
  );
}

// --------------------------------------------------
// VOLUME CONVERTER
// --------------------------------------------------

/**
 * Convert a non-negative volume between
 * microliters and milliliters.
 */
export function convertVolume(
  value: number,
  from: VolumeUnit,
  to: VolumeUnit
): number {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(
      "Enter a valid, non-negative volume."
    );
  }

  return (
    (value * volumeFactor[from]) /
    volumeFactor[to]
  );
}
