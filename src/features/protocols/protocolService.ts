
import { db } from "../../db/database";
import { protocols } from "../../data/protocols";
import type { Protocol } from "../../types/models";

const MAX_PDF_SIZE = 15 * 1024 * 1024;

/**
 * Retrieve a protocol from local storage
 * or from the built-in demonstration protocols
 * (unless the user deleted that demo protocol).
 */
export async function getProtocol(
  id: string
): Promise<Protocol | undefined> {
  const customProtocol = await db.customProtocols.get(id);

  if (customProtocol) return customProtocol;

  if (await db.deletedProtocols.get(id)) return undefined;

  return protocols.find((protocol) => protocol.id === id);
}

/**
 * Retrieve all available protocols.
 * Custom protocols override built-in protocols
 * when they share the same identifier, and built-in
 * protocols deleted by the user are left out.
 */
export async function getAllProtocols(): Promise<Protocol[]> {
  const savedProtocols = await db.customProtocols.toArray();

  const deletedIds = new Set(
    await db.deletedProtocols.toCollection().primaryKeys()
  );

  const builtInProtocols = protocols.filter(
    (protocol) =>
      !deletedIds.has(protocol.id) &&
      !savedProtocols.some(
        (saved) => saved.id === protocol.id
      )
  );

  return [...builtInProtocols, ...savedProtocols];
}

/**
 * Save a custom protocol to IndexedDB.
 */
export async function saveCustomProtocol(
  protocol: Protocol
): Promise<void> {
  await db.customProtocols.put(protocol);
}

/**
 * Attach or replace the source PDF of a protocol.
 */
export async function saveSourcePdf(
  id: string,
  file: File
): Promise<void> {
  if (
    file.type !== "application/pdf" ||
    file.size > MAX_PDF_SIZE
  ) {
    throw new Error(
      "Select a PDF smaller than 15 MB."
    );
  }

  const existingProtocol = await getProtocol(id);

  if (!existingProtocol) {
    throw new Error("Protocol not found.");
  }

  await db.customProtocols.put({
    ...existingProtocol,
    sourcePdf: file,
    sourcePdfName: file.name,
  });
}

/**
 * Open the attached PDF in a new browser tab.
 */
export async function openSourcePdf(
  id: string
): Promise<void> {
  const protocol = await getProtocol(id);

  if (!protocol?.sourcePdf) {
    throw new Error("No source PDF is attached.");
  }

  const pdfUrl = URL.createObjectURL(
    protocol.sourcePdf
  );

  const link = document.createElement("a");

  link.href = pdfUrl;
  link.target = "_blank";
  link.rel = "noopener noreferrer";

  link.click();

  // Release the temporary URL after opening the PDF.
  setTimeout(() => {
    URL.revokeObjectURL(pdfUrl);
  }, 60000);
}

// --------------------------------------------------
// DELETE A PROTOCOL
// --------------------------------------------------

/**
 * Number of saved sessions that use this protocol.
 * Shown in the confirmation dialog before deleting.
 */
export async function countSessionsForProtocol(
  id: string
): Promise<number> {
  return db.sessions.where("protocolId").equals(id).count();
}

/**
 * Delete any protocol AND everything that depends on it
 * (sessions, their notes and their timers).
 *
 * A built-in demo protocol lives in the source code, so it
 * cannot be erased: its id is stored in `deletedProtocols`
 * and it is hidden instead (see restoreDemoProtocols).
 *
 * All changes run in one transaction: either everything is
 * removed or nothing is, so no orphan note or timer can remain.
 * Returns the number of deleted sessions.
 */
export async function deleteProtocol(
  id: string
): Promise<number> {
  return db.transaction(
    "rw",
    [
      db.customProtocols,
      db.deletedProtocols,
      db.sessions,
      db.notes,
      db.timers,
    ],
    async () => {
      const sessionIds = (await db.sessions
        .where("protocolId")
        .equals(id)
        .primaryKeys()) as string[];

      await db.notes
        .where("sessionId")
        .anyOf(sessionIds)
        .delete();

      await db.timers
        .where("sessionId")
        .anyOf(sessionIds)
        .delete();

      await db.sessions.bulkDelete(sessionIds);
      await db.customProtocols.delete(id);

      if (protocols.some((protocol) => protocol.id === id)) {
        await db.deletedProtocols.put({ id });
      }

      return sessionIds.length;
    }
  );
}

/**
 * Bring back every demo protocol the user deleted.
 * Their sessions are not restored.
 */
export async function restoreDemoProtocols(): Promise<void> {
  await db.deletedProtocols.clear();
}
