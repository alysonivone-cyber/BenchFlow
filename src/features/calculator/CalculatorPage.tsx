
import { useState } from "react";

import {
  convertVolume,
  solveDilution,
} from "./calculations";

import type {
  DilutionVariable,
  ConcentrationUnit,
  VolumeUnit,
} from "./calculations";

import { TimerPanel } from "../timer/TimerPanel";

// --------------------------------------------------
// DILUTION CALCULATOR CONFIGURATION
// --------------------------------------------------

const labels: Record<DilutionVariable, string> = {
  c1: "Stock concentration (C₁)",
  v1: "Stock volume (V₁)",
  c2: "Final concentration (C₂)",
  v2: "Final volume (V₂)",
};

const variables: DilutionVariable[] = [
  "c1",
  "v1",
  "c2",
  "v2",
];

type CalculatorUnits = {
  c1: ConcentrationUnit;
  c2: ConcentrationUnit;
  v1: VolumeUnit;
  v2: VolumeUnit;
};

const CONCENTRATION_UNITS: ConcentrationUnit[] = [
  "mg/mL",
  "µg/mL",
  "g/L",
];

const VOLUME_UNITS: VolumeUnit[] = [
  "µL",
  "mL",
];

// --------------------------------------------------
// SCIENTIFIC CALCULATOR
// --------------------------------------------------

export function CalculatorPage() {
  // Selected variable to calculate.
  const [target, setTarget] =
    useState<DilutionVariable>("v1");

  // Values used in the dilution equation.
  const [values, setValues] = useState<
    Record<DilutionVariable, string>
  >({
    c1: "1",
    v1: "",
    c2: "0.1",
    v2: "10",
  });

  // Measurement units for each variable.
  const [units, setUnits] = useState<CalculatorUnits>({
    c1: "mg/mL",
    c2: "mg/mL",
    v1: "mL",
    v2: "mL",
  });

  const [result, setResult] = useState<string | null>(
    null
  );

  const [error, setError] = useState("");

  // Volume converter values.
  const [volume, setVolume] = useState("500");

  const [unit, setUnit] =
    useState<VolumeUnit>("µL");

  // --------------------------------------------------
  // CALCULATE DILUTION
  // --------------------------------------------------

  function calculate() {
    try {
      const input = Object.fromEntries(
        variables.map((variable) => [
          variable,
          variable === target
            ? 0
            : values[variable].trim() === ""
              ? NaN
              : Number(values[variable]),
        ])
      ) as Record<DilutionVariable, number>;

      const calculatedValue = solveDilution(
        target,
        input,
        units
      );

      setResult(
        `${Number(calculatedValue.toPrecision(8))} ${units[target]}`
      );

      setError("");
    } catch (err) {
      setResult(null);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to calculate dilution."
      );
    }
  }

  // --------------------------------------------------
  // CONVERT VOLUME
  // --------------------------------------------------

  function displayConvertedVolume(): string {
    if (volume === "") {
      return "—";
    }

    try {
      const outputUnit: VolumeUnit =
        unit === "µL" ? "mL" : "µL";

      const convertedValue = convertVolume(
        Number(volume),
        unit,
        outputUnit
      );

      return `${convertedValue} ${outputUnit}`;
    } catch {
      return "Invalid volume";
    }
  }

  // --------------------------------------------------
  // CALCULATOR INTERFACE
  // --------------------------------------------------

  return (
    <>
      <div className="heading">
        <h1>Scientific Calculator</h1>

        <p>
          Tools for your laboratory calculations
          and preparations.
        </p>
      </div>

      <div className="two-cols">
        <section className="panel">
          <h2>Dilution Calculator</h2>

          <p className="muted">
            Solve any variable in C₁V₁ = C₂V₂.
            Use compatible concentration and
            volume units.
          </p>

          <div className="formula">
            C₁ × V₁ = C₂ × V₂
          </div>

          <label>
            Calculate which value?

            <select
              value={target}
              onChange={(event) => {
                const next =
                  event.target.value as DilutionVariable;

                setTarget(next);
                setResult(null);
                setError("");
              }}
            >
              {variables.map((variable) => (
                <option
                  key={variable}
                  value={variable}
                >
                  {labels[variable]}
                </option>
              ))}
            </select>
          </label>

          <div className="fields">
            {variables.map((variable) => (
              <label key={variable}>
                {labels[variable]}
                {variable === target
                  ? " (result)"
                  : ""}

                <input
                  type="number"
                  step="any"
                  min="0"
                  disabled={variable === target}
                  placeholder={
                    variable === target
                      ? "Calculated automatically"
                      : "Enter a positive value"
                  }
                  value={
                    variable === target
                      ? ""
                      : values[variable]
                  }
                  onChange={(event) => {
                    setValues((current) => ({
                      ...current,
                      [variable]: event.target.value,
                    }));

                    setResult(null);
                  }}
                />

                <select
                  aria-label={`${labels[variable]} unit`}
                  value={units[variable]}
                  onChange={(event) => {
                    setUnits((current) => ({
                      ...current,
                      [variable]: event.target.value,
                    }));

                    setResult(null);
                  }}
                >
                  {(variable.startsWith("c")
                    ? CONCENTRATION_UNITS
                    : VOLUME_UNITS
                  ).map((unitOption) => (
                    <option
                      key={unitOption}
                      value={unitOption}
                    >
                      {unitOption}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>

          <button
            type="button"
            className="btn primary"
            onClick={calculate}
          >
            Calculate
          </button>

          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}

          {result !== null && (
            <p className="success" role="status">
              {labels[target]} ={" "}
              <strong>{result}</strong>
            </p>
          )}

          <p className="hint">
            This calculator supports simple dilutions
            only; always verify the protocol and units.
          </p>

          <hr />

          <h3>Volume Converter</h3>

          <div className="fields">
            <label>
              Volume

              <input
                type="number"
                min="0"
                value={volume}
                onChange={(event) =>
                  setVolume(event.target.value)
                }
              />
            </label>

            <label>
              Input unit

              <select
                value={unit}
                onChange={(event) =>
                  setUnit(
                    event.target.value as VolumeUnit
                  )
                }
              >
                <option>µL</option>
                <option>mL</option>
              </select>
            </label>
          </div>

          <p className="formula">
            {displayConvertedVolume()}
          </p>
        </section>

        <section className="panel">
          <h2>Laboratory Timer</h2>

          <p className="muted">
            Standalone timer. Timers in experimental
            sessions are saved per step.
          </p>

          <TimerPanel />
        </section>
      </div>
    </>
  );
}
