import { useState } from "react";

import { ConfirmDialog } from "../../components/ConfirmDialog";
import type { Protocol } from "../../types/models";
import {
  countSessionsForProtocol,
  deleteProtocol,
} from "./protocolService";

/**
 * Shared "delete a protocol" flow used by the Protocol Library
 * and the Smart Experimental Workflow pages.
 *
 * `requestDelete(protocol)` opens the confirmation dialog,
 * `dialog` must be rendered once by the page.
 */
export function useDeleteProtocol(
  onError: (message: string) => void
) {
  // Protocol waiting for confirmation (null = dialog closed).
  const [pending, setPending] = useState<Protocol | null>(null);
  const [sessionCount, setSessionCount] = useState(0);
  const [busy, setBusy] = useState(false);

  async function requestDelete(protocol: Protocol) {
    try {
      setSessionCount(
        await countSessionsForProtocol(protocol.id)
      );
      setPending(protocol);
    } catch {
      onError("Unable to read local storage.");
    }
  }

  async function confirm() {
    if (!pending) return;

    setBusy(true);

    try {
      await deleteProtocol(pending.id);
    } catch (err) {
      onError(
        err instanceof Error
          ? err.message
          : "Unable to delete the protocol."
      );
    } finally {
      setBusy(false);
      setPending(null);
    }
  }

  const dialog = (
    <ConfirmDialog
      open={pending !== null}
      title={`Delete protocol "${pending?.title ?? ""}"?`}
      confirmLabel="Delete"
      busy={busy}
      onConfirm={() => void confirm()}
      onCancel={() => setPending(null)}
    >
      <p>
        {sessionCount > 0
          ? `This also removes ${sessionCount} session${
              sessionCount > 1 ? "s" : ""
            } using this protocol, with their notes and timers.`
          : "No session uses this protocol."}
      </p>
      <p>This cannot be undone.</p>
    </ConfirmDialog>
  );

  return { requestDelete, dialog };
}
