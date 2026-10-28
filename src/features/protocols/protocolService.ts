
import { db } from "../../db/database";
import { protocols } from "../../data/protocols";
import type { Protocol } from "../../types/models";

const MAX_PDF_SIZE = 15 * 1024 * 1024;

/**
 * Retrieve a protocol from local storage
 * or from the built-in demonstration protocols.
 */
export async function getProtocol(
  id: string
): Promise<Protocol | undefined> {
  const customProtocol = await db.customProtocols.get(id);

  return (
    customProtocol ??
    protocols.find((protocol) => protocol.id === id)
  );
}

/**
 * Retrieve all available protocols.
 * Custom protocols override built-in protocols
 * when they share the same identifier.
 */
export async function getAllProtocols(): Promise<Protocol[]> {
  const savedProtocols = await db.customProtocols.toArray();

  const builtInProtocols = protocols.filter(
    (protocol) =>
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
