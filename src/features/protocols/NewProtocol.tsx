
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { saveCustomProtocol } from "./protocolService";

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

export function NewProtocol() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [objective, setObjective] = useState("");
  const [materials, setMaterials] = useState("");
  const [expectedResults, setExpectedResults] =
    useState("");
  const [duration, setDuration] = useState("");

  const [steps, setSteps] = useState<StepForm[]>([
    { ...EMPTY_STEP },
  ]);

  const [pdf, setPdf] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

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

  async function save() {
    if (
      !title.trim() ||
      steps.some(
        (step) =>
          !step.title.trim() ||
          !step.instructions.trim()
      )
    ) {
      setError(
        "Enter a title and at least one instruction for every step."
      );
      return;
    }

    if (
      pdf &&
      (pdf.type !== "application/pdf" ||
        pdf.size > 15 * 1024 * 1024)
    ) {
      setError("PDF must be smaller than 15 MB.");
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
          title: step.title,
          description: step.description,
          materials: splitLines(step.materials),
          instructions: splitLines(step.instructions),
          estimatedMinutes: step.estimatedMinutes
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
      setSaving(false);
    }
  }

  return (
    <>
      <div className="heading">
        <h1>Add New Protocol</h1>
        <p>
          Manually structure the protocol. Attaching a
          PDF does not automatically extract steps.
        </p>
      </div>

      <div className="stack">
        <section className="panel">
          <div className="fields">
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

            <label>
              Original PDF (optional)
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={(event) =>
                  setPdf(event.target.files?.[0] ?? null)
                }
              />
            </label>
          </div>
        </section>

        {steps.map((step, index) => (
          <section className="panel" key={index}>
            <h3>Step {index + 1}</h3>

            <div className="fields">
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
                className="btn soft"
                onClick={() => removeStep(index)}
              >
                Remove Step
              </button>
            )}
          </section>
        ))}

        <div className="button-row">
          <button
            type="button"
            className="btn soft"
            onClick={addStep}
          >
            + Add Step
          </button>

          <button
            type="button"
            className="btn primary"
            disabled={saving}
            onClick={() => void save()}
          >
            {saving ? "Saving…" : "Save Protocol"}
          </button>
        </div>

        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
      </div>
    </>
  );
}
