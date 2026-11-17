
import Dexie, { type Table } from "dexie";

import type {
  ExperimentSession,
  ExperimentNote,
  LabTimer,
  Protocol,
} from "../types/models";

// --------------------------------------------------
// BENCHFLOW DATABASE
// --------------------------------------------------

/**
 * Local IndexedDB database powered by Dexie.
 *
 * Stores experimental sessions, notes, timers,
 * and user-created protocols.
 */
class BenchFlowDatabase extends Dexie {
  sessions!: Table<ExperimentSession, string>;

  notes!: Table<ExperimentNote, string>;

  timers!: Table<LabTimer, string>;

  customProtocols!: Table<Protocol, string>;

  // Ids of built-in demo protocols the user deleted (hidden).
  deletedProtocols!: Table<{ id: string }, string>;

  constructor() {
    super("benchflow-v1");

    // --------------------------------------------------
    // VERSION 1 — INITIAL DATABASE
    // --------------------------------------------------

    this.version(1).stores({
      sessions: "id,protocolId,updatedAt",
      notes: "id,[sessionId+stepId],sessionId",
      timers: "id,[sessionId+stepId],sessionId",
    });

    // --------------------------------------------------
    // VERSION 2 — CUSTOM PROTOCOLS
    // --------------------------------------------------

    this.version(2).stores({
      sessions: "id,protocolId,updatedAt",
      notes: "id,[sessionId+stepId],sessionId",
      timers: "id,[sessionId+stepId],sessionId",
      customProtocols: "id,title",
    });

    // --------------------------------------------------
    // VERSION 3 — DELETED BUILT-IN PROTOCOLS
    // --------------------------------------------------

    this.version(3).stores({
      sessions: "id,protocolId,updatedAt",
      notes: "id,[sessionId+stepId],sessionId",
      timers: "id,[sessionId+stepId],sessionId",
      customProtocols: "id,title",
      deletedProtocols: "id",
    });
  }
}

// Shared database instance.
export const db = new BenchFlowDatabase();
