// ==================================================
// BENCHFLOW — DATA MODELS
// ==================================================

// --------------------------------------------------
// PROTOCOLS
// --------------------------------------------------

/**
 * A single step within a laboratory protocol.
 */
export interface ProtocolStep {
  id: string;
  title: string;
  description: string;
  materials: string[];
  instructions: string[];
  estimatedMinutes?: number;
}

/**
 * A laboratory protocol containing its instructions,
 * materials, expected results, and optional source PDF.
 */
export interface Protocol {
  id: string;
  title: string;
  description: string;
  objective: string;
  materials: string[];
  expectedResults: string;
  duration: string;
  steps: ProtocolStep[];
  sourcePdf?: Blob;
  sourcePdfName?: string;
  /** When the protocol was added to BenchFlow (ms since epoch). */
  importedAt?: number;
}

// --------------------------------------------------
// EXPERIMENTAL SESSIONS
// --------------------------------------------------

export type SessionStatus =
  | "in-progress"
  | "paused"
  | "completed";

/**
 * Tracks the progress of an experiment.
 */
export interface ExperimentSession {
  id: string;
  protocolId: string;
  status: SessionStatus;
  currentStep: number;
  completedStepIds: string[];
  createdAt: number;
  updatedAt: number;
}

// --------------------------------------------------
// EXPERIMENT NOTES
// --------------------------------------------------

/**
 * Notes associated with a specific experimental step.
 */
export interface ExperimentNote {
  id: string;
  sessionId: string;
  stepId: string;
  text: string;
  updatedAt: number;
}

// --------------------------------------------------
// LABORATORY TIMERS
// --------------------------------------------------

export type TimerStatus =
  | "idle"
  | "running"
  | "paused"
  | "finished";

/**
 * Timer state associated with an experimental step.
 *
 * Durations are expressed in milliseconds.
 * endsAt is an absolute Unix timestamp in milliseconds.
 */
export interface LabTimer {
  id: string;
  sessionId: string;
  stepId: string;
  durationMs: number;
  remainingMs: number;
  endsAt: number | null;
  status: TimerStatus;
  updatedAt: number;
}
