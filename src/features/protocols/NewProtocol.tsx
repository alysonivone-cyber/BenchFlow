
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  btn,
  buttonRow,
  errorMessage,
  fields,
  heading,
  hintText,
  mutedText,
  panel,
  stack,
  successMessage,
} from "../../components/ui";
import { saveCustomProtocol } from "./protocolService";

// --------------------------------------------------
// TYPES
// --------------------------------------------------

type StepForm = {
  title: string;
  description: string;
  materials: string;
  instructions: string;
  estimatedMinutes: string;
};

const EMPTY_STEP: StepForm = {
  title: "",
  description: "",
  materials: "",
  instructions: "",
  estimatedMinutes: "",
};

const STEP_FIELDS = [
  "title",
  "description",
  "materials",
  "instructions",
  "estimatedMinutes",
] as const;

// --------------------------------------------------
// HELPERS
// --------------------------------------------------

function splitLines(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function fieldLabel(field: keyof StepForm): string {
  switch (field) {
    case "estimatedMinutes":
      return "Estimated minutes";

    case "instructions":
      return "Instructions (one per line)";

    case "materials":
      return "Materials (one per line)";

    default:
      return field[0].toUpperCase() + field.slice(1);
  }
}

// --------------------------------------------------
// NEW PROTOCOL PAGE
// --------------------------------------------------

export function NewProtocol() {
  const navigate = useNavigate();

  // Protocol information.
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [objective, setObjective] = useState("");
  const [materials, setMaterials] = useState("");
  const [expectedResults, setExpectedResults] = useState("");
  const [duration, setDuration] = useState("");

  // Experimental steps.
  const [steps, setSteps] = useState<StepForm[]>([
    { ...EMPTY_STEP },
  ]);

  // Original PDF.
  const [pdf, setPdf] = useState<File | null>(null);

  // UI states.
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisMessage, setAnalysisMessage] = useState("");

  // --------------------------------------------------
  // STEP MANAGEMENT
  // --------------------------------------------------

  function updateStep(
    index: number,
    field: keyof StepForm,
    value: string
  ) {
    setSteps((current) =>
      current.map((step, stepIndex) =>
        stepIndex === index
          ? { ...step, [field]: value }
          : step
      )
    );
  }

  function addStep() {
    setSteps((current) => [
      ...current,
      { ...EMPTY_STEP },
    ]);
  }

  function removeStep(index: number) {
    setSteps((current) =>
      current.filter((_, stepIndex) => stepIndex !== index)
    );
  }

  // --------------------------------------------------
  // PDF SELECTION
  // --------------------------------------------------

  function handlePdfChange(file: File | null) {
    setPdf(file);
    setError("");
    setAnalysisMessage("");
  }

  // --------------------------------------------------
  // GENERATE STEPS FROM PDF
  // --------------------------------------------------

  async function analyzePdf() {
    if (!pdf || analyzing || saving) {
      return;
    }

    const hasManualContent = steps.some(
      (step) =>
        step.title.trim() ||
        step.description.trim() ||
        step.materials.trim() ||
        step.instructions.trim() ||
        step.estimatedMinutes.trim()
    );

    if (
      hasManualContent &&
      !window.confirm(
        "Generating steps from the PDF will replace the steps currently in this form. Other fields you have filled in will be preserved. Continue?"
      )
    ) {
      return;
    }

    setAnalyzing(true);
    setError("");
    setAnalysisMessage("");

    try {
      // Loaded on demand: pdf.js is large, so it stays out of the
      // main bundle until the user actually analyzes a PDF.
      const { extractProtocolFromPdf } = await import(
        "./pdfExtractor"
      );

      const extracted = await extractProtocolFromPdf(pdf);

      // Preserve a manually entered title.
      setTitle((current) =>
        current.trim() ? current : extracted.title
      );

      // Fill protocol-level fields only when the user has not entered a value.
      setDescription((current) => current.trim() ? current : extracted.description);
      setObjective((current) => current.trim() ? current : extracted.objective);
      setMaterials((current) => current.trim() ? current : extracted.materials);
      setExpectedResults((current) => current.trim() ? current : extracted.expectedResults);
      setDuration((current) => current.trim() ? current : extracted.duration);

      // Populate the existing editable step form.
      setSteps(
        extracted.steps.map((step) => ({
          title: step.title,
          description: step.description,
          materials: step.materials,
          instructions: step.instructions,
          estimatedMinutes: step.estimatedMinutes,
        }))
      );

      setAnalysisMessage(
        `${extracted.steps.length} step(s) extracted from ` +
          `${extracted.pageCount} PDF page(s). ` +
          "Please review all instructions before saving."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to analyze this PDF."
      );
    } finally {
      setAnalyzing(false);
    }
  }

  // --------------------------------------------------
  // SAVE PROTOCOL
  // --------------------------------------------------

  async function save() {
    if (saving || analyzing) {
      return;
    }

    if (
      !title.trim() ||
      steps.length === 0 ||
      steps.some(
        (step) =>
          !step.title.trim() ||
          !step.instructions.trim()
      )
    ) {
      setError(
        "Enter a protocol title and at least one instruction for every step."
      );
      return;
    }

    if (
      pdf &&
      (pdf.type !== "application/pdf" ||
        pdf.size > 15 * 1024 * 1024)
    ) {
      setError("Select a PDF smaller than 15 MB.");
      return;
    }

    const invalidDuration = steps.some(
      (step) =>
        step.estimatedMinutes.trim() !== "" &&
        (!Number.isFinite(Number(step.estimatedMinutes)) ||
          Number(step.estimatedMinutes) < 0)
    );

    if (invalidDuration) {
      setError(
        "Estimated minutes must be a valid non-negative number."
      );
      return;
    }

    setSaving(true);
    setError("");

    try {
      const id = `custom-${crypto.randomUUID()}`;

      await saveCustomProtocol({
        id,
        title: title.trim(),
        description,
        objective,
        materials: splitLines(materials),
        expectedResults,
        duration: duration || "Variable",

        steps: steps.map((step, index) => ({
          id: `${id}-step-${index + 1}`,
          title: step.title.trim(),
          description: step.description.trim(),
          materials: splitLines(step.materials),
          instructions: splitLines(step.instructions),
          estimatedMinutes: step.estimatedMinutes.trim()
            ? Number(step.estimatedMinutes)
            : undefined,
        })),

        sourcePdf: pdf ?? undefined,
        sourcePdfName: pdf?.name,
      });

      navigate(`/protocols/${id}`);
    } catch {
      setError(
        "Unable to save protocol to local storage."
      );
    } finally {
      setSaving(false);
    }
  }

  // --------------------------------------------------
  // PAGE INTERFACE
  // --------------------------------------------------

  return (
    <>
      <div className={heading}>
        <h1>Add New Protocol</h1>

        <p>
          Upload a protocol PDF to generate experimental
          steps, or create and edit them manually.
        </p>
      </div>

      <div className={stack}>
        {/* ------------------------------------------ */}
        {/* PROTOCOL INFORMATION */}
        {/* ------------------------------------------ */}

        <section className={panel}>
          <h2>Protocol Information</h2>

          <div className={fields}>
            <label>
              Title
              <input
                value={title}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
              />
            </label>

            <label>
              Description
              <input
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
              />
            </label>

            <label>
              Objective
              <textarea
                value={objective}
                onChange={(event) =>
                  setObjective(event.target.value)
                }
              />
            </label>

            <label>
              Materials (one per line)
              <textarea
                value={materials}
                onChange={(event) =>
                  setMaterials(event.target.value)
                }
              />
            </label>

            <label>
              Expected results
              <textarea
                value={expectedResults}
                onChange={(event) =>
                  setExpectedResults(event.target.value)
                }
              />
            </label>

            <label>
              Estimated duration
              <input
                value={duration}
                placeholder="30–45 min"
                onChange={(event) =>
                  setDuration(event.target.value)
                }
              />
            </label>
          </div>
        </section>

        {/* ------------------------------------------ */}
        {/* PDF IMPORT */}
        {/* ------------------------------------------ */}

        <section className={panel}>
          <h2>Original Protocol PDF</h2>

          <p className={mutedText}>
            Upload a PDF to automatically extract
            clearly numbered experimental steps.
            Maximum file size: 15 MB.
          </p>

          <label>
            Select PDF
            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={(event) =>
                handlePdfChange(
                  event.target.files?.[0] ?? null
                )
              }
            />
          </label>

          {pdf && (
            <div className={buttonRow}>
              <button
                type="button"
                className={btn("primary")}
                disabled={analyzing || saving}
                onClick={() => void analyzePdf()}
              >
                {analyzing
                  ? "Analyzing PDF…"
                  : "Generate Steps from PDF"}
              </button>
            </div>
          )}

          {analysisMessage && (
            <p className={successMessage} role="status">
              {analysisMessage}
            </p>
          )}

          <p className={hintText}>
            Generated steps must be reviewed before
            use. Scanned PDFs and complex layouts
            may require manual entry.
          </p>
        </section>

        {/* ------------------------------------------ */}
        {/* EXPERIMENTAL STEPS */}
        {/* ------------------------------------------ */}

        {steps.map((step, index) => (
          <section className={panel} key={index}>
            <h3>Step {index + 1}</h3>

            <div className={fields}>
              {STEP_FIELDS.map((field) => (
                <label key={field}>
                  {fieldLabel(field)}

                  {field === "instructions" ||
                  field === "materials" ? (
                    <textarea
                      value={step[field]}
                      onChange={(event) =>
                        updateStep(
                          index,
                          field,
                          event.target.value
                        )
                      }
                    />
                  ) : (
                    <input
                      type={
                        field === "estimatedMinutes"
                          ? "number"
                          : "text"
                      }
                      min={
                        field === "estimatedMinutes"
                          ? "0"
                          : undefined
                      }
                      value={step[field]}
                      onChange={(event) =>
                        updateStep(
                          index,
                          field,
                          event.target.value
                        )
                      }
                    />
                  )}
                </label>
              ))}
            </div>

            {steps.length > 1 && (
              <button
                type="button"
                className={btn("soft")}
                onClick={() => removeStep(index)}
              >
                Remove Step
              </button>
            )}
          </section>
        ))}

        {/* ------------------------------------------ */}
        {/* ACTIONS */}
        {/* ------------------------------------------ */}

        <div className={buttonRow}>
          <button
            type="button"
            className={btn("soft")}
            disabled={saving || analyzing}
            onClick={addStep}
          >
            + Add Step
          </button>

          <button
            type="button"
            className={btn("primary")}
            disabled={saving || analyzing}
            onClick={() => void save()}
          >
            {saving ? "Saving…" : "Save Protocol"}
          </button>
        </div>

        {error && (
          <p className={errorMessage} role="alert">
            {error}
          </p>
        )}
      </div>
    </>
  );
}
