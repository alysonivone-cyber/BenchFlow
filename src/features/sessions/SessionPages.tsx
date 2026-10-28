
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
      <div className="heading">
        <h1>Smart Experimental Workflow</h1>
        <p>Choose or start a new session.</p>
      </div>

      <div className="section-title">
        <h2>Saved Sessions</h2>

        <select
          aria-label="Start a new session"
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
        <p className="error" role="alert">
          {error}
        </p>
      )}

      <div className="stack">
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
                className="listcard sessioncard"
                key={session.id}
              >
                <div className="session-info">
                  <div className="session-heading">
                    <h3>{protocol.title}</h3>

                    <span
                      className={`status ${session.status}`}
                    >
                      {session.status === "in-progress"
                        ? "In progress"
                        : session.status === "paused"
                          ? "Paused"
                          : "Completed"}
                    </span>
                  </div>

                  <p className="muted">
                    {session.id.slice(0, 8)}
                    {" · "}
                    Step{" "}
                    {Math.min(
                      session.currentStep + 1,
                      protocol.steps.length
                    )}
                    /{protocol.steps.length}
                    {" · "}
                    {percent}%
                  </p>

                  <div className="progress">
                    <div
                      style={{
                        width: `${percent}%`,
                      }}
                    />
                  </div>
                </div>

                <Link
                  className="btn soft"
                  to={`/sessions/${session.id}`}
                >
                  {session.status === "completed"
                    ? "View Session"
                    : "Resume Session"}{" "}
                  →
                </Link>
              </article>
            );
          })
        ) : (
          <div className="panel">
            <p>
              No saved sessions yet. Start your first
              experiment using the selector above or
              the Protocol Library.
            </p>

            <Link
              className="btn primary"
              to="/protocols"
            >
              Browse Protocols
            </Link>
          </div>
        )}
      </div>
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
  const session = useLiveQuery(
    () => (id ? db.sessions.get(id) : undefined),
    [id]
  );

  // Retrieve the protocol associated with the session.
  const protocol = useLiveQuery(
    () =>
      session?.protocolId
        ? getProtocol(session.protocolId)
        : undefined,
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

  if (session === undefined) {
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
      <div className="breadcrumbs">
        <Link to={`/protocols/${protocol.id}`}>
          {protocol.title}
        </Link>
        {" › "}
        Session {session.id.slice(0, 8)}
      </div>

      <div className="heading step-heading">
        <span className="large-number">
          {session.currentStep + 1}
        </span>

        <div>
          <h1>{step.title}</h1>
          <p>{step.description}</p>
        </div>
      </div>

      <div className="chips">
        <span>
          ~ {step.estimatedMinutes ?? "—"} min
        </span>

        <span>
          Materials ({step.materials.length} items)
        </span>

        <span>Experiment Notes</span>

        <span>
          {session.completedStepIds.length}/
          {protocol.steps.length} steps completed
        </span>
      </div>

      <div className="two-cols">
        <div className="stack">
          <section className="panel">
            <h2>Required Materials</h2>

            <ul>
              {step.materials.map((material) => (
                <li key={material}>
                  {material}
                </li>
              ))}
            </ul>
          </section>

          <section className="panel">
            <h2>Instructions</h2>

            <ol className="instructions">
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

        <div className="stack">
          <section className="panel">
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
              className="btn soft"
              onClick={() => void saveNotes()}
            >
              Save Notes
            </button>
          </section>

          <section className="panel">
            <h2>Step Timer</h2>

            <TimerPanel
              key={`${session.id}:${step.id}`}
              sessionId={session.id}
              stepId={step.id}
            />
          </section>

          <Link
            to="/calculator"
            className="btn soft"
          >
            Open Scientific Calculator →
          </Link>
        </div>
      </div>

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      <div className="footer-actions">
        <button
          className="btn soft"
          onClick={() => void goPrevious()}
          disabled={session.currentStep === 0}
        >
          ← Previous Step
        </button>

        <button
          className="btn soft"
          onClick={() => void saveExit()}
        >
          Save and Exit
        </button>

        <button
          className="btn primary"
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
