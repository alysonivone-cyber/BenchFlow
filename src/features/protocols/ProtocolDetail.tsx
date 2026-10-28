
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";

import { createSession } from "../sessions/sessionService";
import {
  getProtocol,
  openSourcePdf,
  saveSourcePdf,
} from "./protocolService";

export function ProtocolDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const protocol = useLiveQuery(
    () => (id ? getProtocol(id) : undefined),
    [id]
  );

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (protocol === undefined) {
    return <p>Loading protocol…</p>;
  }

  if (!protocol) {
    return <p>Protocol not found.</p>;
  }

  async function startSession() {
    if (!protocol) return;

    setBusy(true);
    setError("");

    try {
      const session = await createSession(protocol.id);
      navigate(`/sessions/${session.id}`);
    } catch {
      setError("Unable to save session.");
      setBusy(false);
    }
  }

  async function uploadPdf(file?: File) {
    if (!file || !protocol) return;

    try {
      await saveSourcePdf(protocol.id, file);
      setError("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to attach PDF."
      );
    }
  }

  async function viewPdf() {
    if (!protocol) return;

    try {
      await openSourcePdf(protocol.id);
      setError("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to open PDF."
      );
    }
  }

  return (
    <>
      <div className="heading">
        <h1>{protocol.title}</h1>
        <p>{protocol.description}</p>
      </div>

      <div className="detailgrid">
        <div className="stack">
          <section className="panel">
            <h3>Objective</h3>
            <p>{protocol.objective}</p>
          </section>

          <section className="panel">
            <h3>Required Materials</h3>
            <ul>
              {protocol.materials.map((material) => (
                <li key={material}>{material}</li>
              ))}
            </ul>
          </section>

          <section className="panel">
            <h3>Expected Results</h3>
            <p>{protocol.expectedResults}</p>
          </section>

          <section className="panel">
            <h3>Original Protocol PDF</h3>

            {protocol.sourcePdf ? (
              <button
                type="button"
                className="btn soft"
                onClick={() => void viewPdf()}
              >
                View Original PDF ↗
              </button>
            ) : (
              <p className="muted">
                No original PDF attached yet.
              </p>
            )}

            <label>
              Attach / replace PDF (max 15 MB)
              <input
                type="file"
                accept="application/pdf,.pdf"
                onChange={(event) =>
                  void uploadPdf(event.target.files?.[0])
                }
              />
            </label>
          </section>
        </div>

        <div className="stack">
          <div className="chips">
            <span>{protocol.steps.length} steps</span>
            <span>~ {protocol.duration}</span>
          </div>

          <h2>Protocol Steps</h2>

          {protocol.steps.map((step, index) => (
            <details
              className="step-preview"
              key={step.id}
            >
              <summary>
                <span className="step-number">
                  {index + 1}
                </span>

                <span>
                  <strong>{step.title}</strong>
                  <small>{step.description}</small>
                </span>
              </summary>

              <ol>
                {step.instructions.map(
                  (instruction, instructionIndex) => (
                    <li key={instructionIndex}>
                      {instruction}
                    </li>
                  )
                )}
              </ol>
            </details>
          ))}

          <button
            type="button"
            className="btn primary wide"
            onClick={() => void startSession()}
            disabled={busy}
          >
            {busy
              ? "Creating session…"
              : "▶ Start New Session"}
          </button>

          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}

          <p className="hint">
            BenchFlow assists execution; use your
            laboratory's approved procedures and
            safety rules.
          </p>
        </div>
      </div>
    </>
  );
}
