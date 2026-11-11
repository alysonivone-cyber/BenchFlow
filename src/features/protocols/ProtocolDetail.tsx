
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { ChevronDown, Clock, ListOrdered } from "lucide-react";

import { Chip } from "../../components/Chip";
import {
  btn,
  detailGrid,
  detailsCard,
  errorMessage,
  heading,
  hintText,
  mutedText,
  panel,
  stack,
} from "../../components/ui";

import { createSession } from "../sessions/sessionService";
import {
  getProtocol,
  openSourcePdf,
  saveSourcePdf,
} from "./protocolService";

export function ProtocolDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // undefined = still loading, null = no such protocol.
  // (getProtocol returns undefined when nothing is found, which
  // useLiveQuery cannot tell apart from "loading": hence `?? null`.)
  const protocol = useLiveQuery(
    async () => (id ? ((await getProtocol(id)) ?? null) : null),
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
      <div className={heading}>
        <h1>{protocol.title}</h1>
        <p>{protocol.description}</p>
      </div>

      <div className={detailGrid}>
        <div className={stack}>
          <section className={panel}>
            <h3>Objective</h3>
            <p>{protocol.objective}</p>
          </section>

          <section className={panel}>
            <h3>Required Materials</h3>
            <ul>
              {protocol.materials.map((material) => (
                <li key={material}>{material}</li>
              ))}
            </ul>
          </section>

          <section className={panel}>
            <h3>Expected Results</h3>
            <p>{protocol.expectedResults}</p>
          </section>

          <section className={panel}>
            <h3>Original Protocol PDF</h3>

            {protocol.sourcePdf ? (
              <button
                type="button"
                className={btn("soft")}
                onClick={() => void viewPdf()}
              >
                View Original PDF ↗
              </button>
            ) : (
              <p className={mutedText}>
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

        <div className={stack}>
          <div className="mb-5 flex flex-wrap items-center gap-[10px]">
            <Chip tone="blue">
              <ListOrdered size={16} aria-hidden="true" />
              {protocol.steps.length} steps
            </Chip>
            <Chip tone="violet">
              <Clock size={16} aria-hidden="true" />~{" "}
              {protocol.duration}
            </Chip>
          </div>

          <h2>Protocol Steps</h2>

          {protocol.steps.map((step, index) => (
            <details
              className={detailsCard}
              key={step.id}
            >
              <summary className="group/summary flex cursor-pointer list-none items-center gap-[14px] rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-open-ink [&::-webkit-details-marker]:hidden">
                <span className="inline-grid size-8 flex-none place-items-center rounded-full bg-step font-extrabold text-step-ink">
                  {index + 1}
                </span>

                <span className="min-w-0 flex-1">
                  <strong>{step.title}</strong>
                  <small className="mt-[5px] block text-[13.333px] text-step-desc">
                    {step.description}
                  </small>
                </span>

                {/* Green badge: tells the user the step can be expanded. */}
                <span className="inline-flex flex-none items-center gap-[5px] rounded-full border border-open-line bg-open px-3 py-[6px] text-[.8rem] font-bold text-open-ink [details:not([open])>summary:hover_&]:bg-open-hover group-open/step:border-close-line group-open/step:bg-close group-open/step:text-close-ink">
                  <span className="group-open/step:hidden">Open me</span>
                  <span className="hidden group-open/step:inline">Close</span>
                  <ChevronDown
                    size={14}
                    aria-hidden="true"
                    className="transition-transform duration-200 group-open/step:rotate-180 motion-reduce:transition-none"
                  />
                </span>
              </summary>

              <ol className="my-4 list-decimal pl-10 leading-[1.7] text-body-soft">
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
            className={btn("primary", "w-full")}
            onClick={() => void startSession()}
            disabled={busy}
          >
            {busy
              ? "Creating session…"
              : "▶ Start New Session"}
          </button>

          {error && (
            <p className={errorMessage} role="alert">
              {error}
            </p>
          )}

          <p className={hintText}>
            BenchFlow assists execution; use your
            laboratory's approved procedures and
            safety rules.
          </p>
        </div>
      </div>
    </>
  );
}
