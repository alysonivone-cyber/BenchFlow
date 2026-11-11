import { useEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import { db } from "../../db/database";
import {
  getAllProtocols,
  getProtocol,
} from "../protocols/protocolService";
import {
  createSession,
  saveNote,
  saveSession,
} from "./sessionService";
import { TimerPanel } from "../timer/TimerPanel";
import {
  formatSessionName,
  formatSessionStamp,
} from "./sessionLabel";
import { Chip } from "../../components/Chip";
import {
  btn,
  errorMessage,
  heading,
  inCard,
  listCard,
  mutedText,
  panel,
  stack,
  twoCols,
} from "../../components/ui";
import { DeleteProtocolButton } from "../protocols/DeleteProtocolButton";
import { useDeleteProtocol } from "../protocols/useDeleteProtocol";

// Tailwind classes for the session status badge.
const STATUS_STYLES = {
  "in-progress": "bg-status-ok text-status-ok-ink",
  paused: "bg-status-paused text-status-paused-ink",
  completed: "bg-status-done text-status-done-ink",
} as const;

// Footer buttons share the row equally (wrap on phones).
const FOOTER_BUTTON = "flex-1 phone:flex-[1_1_40%]";

// --------------------------------------------------
// SAVED SESSIONS
// --------------------------------------------------

export function SessionsPage() {
  const sessions = useLiveQuery(
    () =>
      db.sessions
        .orderBy("updatedAt")
        .reverse()
        .toArray(),
    []
  );

  const protocols = useLiveQuery(
    () => getAllProtocols(),
    []
  );

  const navigate = useNavigate();
  const [error, setError] = useState("");
  const { requestDelete, dialog } = useDeleteProtocol(setError);

  async function newSession(protocolId: string) {
    try {
      const session = await createSession(protocolId);
      navigate(`/sessions/${session.id}`);
    } catch {
      setError("Unable to save the new session.");
    }
  }

  return (
    <>
      <div className={heading}>
        <h1>Smart Experimental Workflow</h1>
        <p>Choose or start a new session.</p>
      </div>

      <div className="mb-5 flex items-center justify-between gap-5">
        <h2 className="m-0">Saved Sessions</h2>

        <select
          aria-label="Start a new session"
          className="max-w-60 rounded-lg border-0 bg-primary px-[15px] py-3 text-white"
          value=""
          onChange={(event) =>
            void newSession(event.target.value)
          }
        >
          <option value="" disabled>
            + New Session
          </option>

          {(protocols ?? []).map((protocol) => (
            <option
              key={protocol.id}
              value={protocol.id}
            >
              {protocol.title}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <p className={errorMessage} role="alert">
          {error}
        </p>
      )}

      <div className={stack}>
        {sessions?.length ? (
          sessions.map((session) => {
            const protocol = protocols?.find(
              (item) => item.id === session.protocolId
            );

            if (!protocol) return null;

            const percent = Math.round(
              (session.completedStepIds.length /
                protocol.steps.length) *
                100
            );

            return (
              <article
                className={listCard(
                  "items-end phone:flex-col phone:items-stretch"
                )}
                key={session.id}
              >
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-5">
                    <h3 className="m-0 text-[1.13rem]">
                      {formatSessionName(
                        session.createdAt,
                        protocol.title
                      )}
                    </h3>

                    <span
                      className={`rounded-full px-[10px] py-[6px] text-[.76rem] ${STATUS_STYLES[session.status]}`}
                    >
                      {session.status === "in-progress"
                        ? "In progress"
                        : session.status === "paused"
                          ? "Paused"
                          : "Completed"}
                    </span>
                  </div>

                  <p className={mutedText}>
                    Step{" "}
                    {Math.min(
                      session.currentStep + 1,
                      protocol.steps.length
                    )}
                    /{protocol.steps.length}
                    {" · "}
                    {percent}%
                  </p>

                  <div className="mt-[13px] h-2 overflow-hidden rounded-[20px] bg-track">
                    <div
                      className="h-full rounded-[20px] bg-fill"
                      style={{
                        width: `${percent}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap justify-end gap-2">
                  <Link
                    className={btn("soft", inCard)}
                    to={`/sessions/${session.id}`}
                  >
                    {session.status === "completed"
                      ? "View Session"
                      : "Resume Session"}{" "}
                    →
                  </Link>

                  <DeleteProtocolButton
                    protocol={protocol}
                    onClick={requestDelete}
                    label="Delete protocol"
                  />
                </div>
              </article>
            );
          })
        ) : (
          <div className={panel}>
            <p>
              No saved sessions yet. Start your first
              experiment using the selector above or
              the Protocol Library.
            </p>

            <Link
              className={btn("primary")}
              to="/protocols"
            >
              Browse Protocols
            </Link>
          </div>
        )}
      </div>

      {dialog}
    </>
  );
}

// --------------------------------------------------
// SESSION DETAILS AND EXPERIMENTAL WORKFLOW
// --------------------------------------------------

export function SessionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Retrieve the active session.
  // undefined = still loading, null = no such session.
  const session = useLiveQuery(
    async () => (id ? ((await db.sessions.get(id)) ?? null) : null),
    [id]
  );

  // Retrieve the protocol associated with the session.
  // Same convention: undefined = loading, null = not found.
  const protocol = useLiveQuery(
    async () =>
      session?.protocolId
        ? ((await getProtocol(session.protocolId)) ?? null)
        : null,
    [session?.protocolId]
  );

  const [noteText, setNoteText] = useState("");
  const [error, setError] = useState("");

  // Identify the current experimental step.
  const step =
    protocol?.steps[session?.currentStep ?? 0];

  // Retrieve notes associated with this step.
  const note = useLiveQuery(
    () =>
      session && step
        ? db.notes.get(`${session.id}:${step.id}`)
        : undefined,
    [session?.id, step?.id]
  );

  // Synchronize the notes field when changing steps.
  useEffect(() => {
    setNoteText(note?.text ?? "");
  }, [note?.id, note?.text, step?.id]);

  // Wait for the session, then for its protocol.
  if (
    session === undefined ||
    (session !== null && protocol === undefined)
  ) {
    return <p>Loading session…</p>;
  }

  if (!session || !protocol || !step) {
    return (
      <p>
        Session not found.{" "}
        <Link to="/sessions">
          Back to sessions
        </Link>
      </p>
    );
  }

  // --------------------------------------------------
  // SAVE EXPERIMENT NOTES
  // --------------------------------------------------

  async function saveNotes() {
    try {
      await saveNote(
        session!.id,
        step!.id,
        noteText
      );

      setError("");
    } catch {
      setError(
        "Unable to save notes. Check browser storage."
      );
    }
  }

  // --------------------------------------------------
  // NEXT STEP / COMPLETE EXPERIMENT
  // --------------------------------------------------

  async function goNext() {
    try {
      await saveNotes();

      const completed = [
        ...new Set([
          ...session!.completedStepIds,
          step!.id,
        ]),
      ];

      const final =
        completed.length === protocol!.steps.length;

      await saveSession({
        ...session!,
        completedStepIds: completed,
        currentStep: final
          ? session!.currentStep
          : session!.currentStep + 1,
        status: final
          ? "completed"
          : "in-progress",
      });

      if (final) {
        navigate("/sessions");
      }
    } catch {
      setError("Unable to save progress.");
    }
  }

  // --------------------------------------------------
  // PREVIOUS STEP
  // --------------------------------------------------

  async function goPrevious() {
    if (session!.currentStep === 0) return;

    try {
      await saveNotes();

      await saveSession({
        ...session!,
        currentStep: session!.currentStep - 1,
        status: "in-progress",
      });
    } catch {
      setError("Unable to change step.");
    }
  }

  // --------------------------------------------------
  // SAVE AND EXIT
  // --------------------------------------------------

  async function saveExit() {
    try {
      await saveNotes();

      await saveSession({
        ...session!,
        status:
          session!.status === "completed"
            ? "completed"
            : "paused",
      });

      navigate("/sessions");
    } catch {
      setError("Unable to save session.");
    }
  }

  // --------------------------------------------------
  // WORKFLOW INTERFACE
  // --------------------------------------------------

  return (
    <>
      <div className="mb-[22px] text-[.88rem] text-crumbs">
        <Link to={`/protocols/${protocol.id}`}>
          {protocol.title}
        </Link>
        {" › "}
        Session {formatSessionStamp(session.createdAt)}
      </div>

      <div className={`${heading} flex items-center gap-[17px]`}>
        <span className="inline-grid size-[60px] flex-none place-items-center rounded-full bg-step text-[1.8rem] font-extrabold text-step-ink">
          {session.currentStep + 1}
        </span>

        <div>
          <h1>{step.title}</h1>
          <p>{step.description}</p>
        </div>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-[10px]">
        <Chip tone="blue">
          ~ {step.estimatedMinutes ?? "—"} min
        </Chip>

        <Chip tone="violet">
          Materials ({step.materials.length} items)
        </Chip>

        <Chip tone="blue">Experiment Notes</Chip>

        <Chip tone="violet">
          {session.completedStepIds.length}/
          {protocol.steps.length} steps completed
        </Chip>
      </div>

      <div className={twoCols}>
        <div className={stack}>
          <section className={panel}>
            <h2>Required Materials</h2>

            <ul>
              {step.materials.map((material) => (
                <li key={material}>
                  {material}
                </li>
              ))}
            </ul>
          </section>

          <section className={panel}>
            <h2>Instructions</h2>

            <ol className="[&_li]:border-b [&_li]:border-line-row [&_li]:py-[9px]">
              {step.instructions.map(
                (instruction) => (
                  <li key={instruction}>
                    {instruction}
                  </li>
                )
              )}
            </ol>
          </section>
        </div>

        <div className={stack}>
          <section className={panel}>
            <h2>Experiment Notes</h2>

            <textarea
              rows={6}
              value={noteText}
              onChange={(event) =>
                setNoteText(event.target.value)
              }
              placeholder="Record your observations, volumes, remarks…"
            />

            <button
              className={btn("soft")}
              onClick={() => void saveNotes()}
            >
              Save Notes
            </button>
          </section>

          <section className={panel}>
            <h2>Step Timer</h2>

            <TimerPanel
              key={`${session.id}:${step.id}`}
              sessionId={session.id}
              stepId={step.id}
              stepTitle={step.title}
            />
          </section>

          <Link
            to="/calculator"
            className={btn("soft")}
          >
            Open Scientific Calculator →
          </Link>
        </div>
      </div>

      {error && (
        <p className={errorMessage} role="alert">
          {error}
        </p>
      )}

      <div className="mt-[30px] flex justify-between gap-[15px] phone:flex-wrap">
        <button
          className={btn("soft", FOOTER_BUTTON)}
          onClick={() => void goPrevious()}
          disabled={session.currentStep === 0}
        >
          ← Previous Step
        </button>

        <button
          className={btn("soft", FOOTER_BUTTON)}
          onClick={() => void saveExit()}
        >
          Save and Exit
        </button>

        <button
          className={btn("primary", FOOTER_BUTTON)}
          onClick={() => void goNext()}
          disabled={session.status === "completed"}
        >
          {session.currentStep ===
          protocol.steps.length - 1
            ? "Complete Experiment"
            : "Next Step →"}
        </button>
      </div>
    </>
  );
}
