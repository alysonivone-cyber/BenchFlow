
import { db } from "../../db/database";
import type { ExperimentSession } from "../../types/models";

// --------------------------------------------------
// CREATE EXPERIMENTAL SESSION
// --------------------------------------------------

/**
 * Create a new experimental session for a protocol.
 * The session starts at the first step.
 */
export async function createSession(
  protocolId: string
): Promise<ExperimentSession> {
  const now = Date.now();

  const session: ExperimentSession = {
    id: crypto.randomUUID(),
    protocolId,
    status: "in-progress",
    currentStep: 0,
    completedStepIds: [],
    createdAt: now,
    updatedAt: now,
  };

  await db.sessions.add(session);

  return session;
}

// --------------------------------------------------
// SAVE SESSION PROGRESS
// --------------------------------------------------

/**
 * Save the session state and update its timestamp.
 */
export async function saveSession(
  session: ExperimentSession
): Promise<void> {
  await db.sessions.put({
    ...session,
    updatedAt: Date.now(),
  });
}

// --------------------------------------------------
// SAVE EXPERIMENT NOTES
// --------------------------------------------------

/**
 * Create or update the notes associated with
 * a specific experimental step.
 */
export async function saveNote(
  sessionId: string,
  stepId: string,
  text: string
): Promise<void> {
  const noteId = `${sessionId}:${stepId}`;

  await db.notes.put({
    id: noteId,
    sessionId,
    stepId,
    text,
    updatedAt: Date.now(),
  });
}
