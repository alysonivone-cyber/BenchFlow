import "fake-indexeddb/auto";

import { beforeEach, describe, expect, it } from "vitest";

import { db } from "../../db/database";
import type { Protocol } from "../../types/models";
import {
  countSessionsForProtocol,
  deleteProtocol,
  getAllProtocols,
  getProtocol,
  restoreDemoProtocols,
} from "./protocolService";
import { createSession, saveNote } from "../sessions/sessionService";
import { ensureTimer } from "../timer/timerService";

function customProtocol(id: string): Protocol {
  return {
    id,
    title: `Custom ${id}`,
    description: "",
    objective: "",
    materials: [],
    expectedResults: "",
    duration: "5 min",
    steps: [
      {
        id: `${id}-1`,
        title: "Step",
        description: "",
        materials: [],
        instructions: [],
      },
    ],
  };
}

describe("BenchFlow — Delete protocol", () => {
  beforeEach(async () => {
    await Promise.all([
      db.customProtocols.clear(),
      db.sessions.clear(),
      db.notes.clear(),
      db.timers.clear(),
      db.deletedProtocols.clear(),
    ]);
  });

  it("removes the protocol with its sessions, notes and timers only", async () => {
    await db.customProtocols.bulkPut([
      customProtocol("a"),
      customProtocol("b"),
    ]);

    const a1 = await createSession("a");
    const a2 = await createSession("a");
    const b1 = await createSession("b");

    for (const session of [a1, a2, b1]) {
      await saveNote(session.id, "step", "note");
      await ensureTimer(session.id, "step");
    }

    expect(await countSessionsForProtocol("a")).toBe(2);
    expect(await deleteProtocol("a")).toBe(2);

    const ids = (await getAllProtocols()).map((p) => p.id);
    expect(ids).not.toContain("a");
    expect(ids).toContain("b");

    // Protocol "b" and its session are untouched.
    expect(await db.sessions.count()).toBe(1);
    expect(await db.sessions.get(b1.id)).toBeDefined();
    expect(await db.notes.count()).toBe(1);
    expect(await db.timers.count()).toBe(1);
  });

  it("deletes a built-in demo protocol (hidden) with its sessions, and can restore it", async () => {
    const session = await createSession("dna");
    await saveNote(session.id, "dna-1", "note");
    await createSession("dilution");

    expect(await deleteProtocol("dna")).toBe(1);

    const ids = (await getAllProtocols()).map((p) => p.id);
    expect(ids).not.toContain("dna");
    expect(ids).toContain("dilution");
    expect(await getProtocol("dna")).toBeUndefined();
    expect(await db.notes.count()).toBe(0);
    expect(await db.sessions.count()).toBe(1);

    await restoreDemoProtocols();

    expect(
      (await getAllProtocols()).map((p) => p.id)
    ).toContain("dna");
  });

  it("deletes a built-in protocol that has a saved copy (e.g. attached PDF)", async () => {
    await db.customProtocols.put(customProtocol("dna"));

    await deleteProtocol("dna");

    expect(await getProtocol("dna")).toBeUndefined();
    expect(await db.customProtocols.count()).toBe(0);
  });

  it("works when the protocol has no session", async () => {
    await db.customProtocols.put(customProtocol("solo"));

    expect(await deleteProtocol("solo")).toBe(0);
    expect(await db.customProtocols.count()).toBe(0);
  });
});
