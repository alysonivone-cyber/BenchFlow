import { useState } from "react";
import { Link } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";

import {
  btn,
  buttonRow,
  errorMessage,
  heading,
  inCard,
  listCard,
  mutedText,
  stack,
} from "../../components/ui";
import { DeleteProtocolButton } from "./DeleteProtocolButton";
import {
  getAllProtocols,
  openSourcePdf,
  restoreDemoProtocols,
} from "./protocolService";
import { useDeleteProtocol } from "./useDeleteProtocol";
import { db } from "../../db/database";

export function ProtocolLibrary() {
  const protocols = useLiveQuery(
    () => getAllProtocols(),
    []
  );

  const [error, setError] = useState("");

  const { requestDelete, dialog } = useDeleteProtocol(setError);

  // Number of demo protocols the user deleted (can be restored).
  const hiddenDemoCount = useLiveQuery(
    () => db.deletedProtocols.count(),
    []
  );

  async function handleOpenPdf(id: string) {
    try {
      setError("");
      await openSourcePdf(id);
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
        <h1>Protocol Library</h1>
        <p>
          Browse protocols, consult original PDFs
          and start experimental sessions.
        </p>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        <Link
          className={btn("primary")}
          to="/protocols/new"
        >
          + Add New Protocol
        </Link>

        {Boolean(hiddenDemoCount) && (
          <button
            type="button"
            className={btn("soft")}
            onClick={() => void restoreDemoProtocols()}
          >
            Restore {hiddenDemoCount} demo protocol
            {hiddenDemoCount === 1 ? "" : "s"}
          </button>
        )}
      </div>

      {error && (
        <p className={errorMessage} role="alert">
          {error}
        </p>
      )}

      <div className={stack}>
        {protocols?.map((protocol) => (
          <article
            className={listCard("items-center phone:items-start")}
            key={protocol.id}
          >
            <div>
              <h3 className="mb-2 text-[1.13rem]">{protocol.title}</h3>

              <span className={mutedText}>
                {protocol.steps.length} steps
                {protocol.sourcePdf
                  ? " · PDF attached"
                  : ""}
              </span>
            </div>

            <div className={buttonRow}>
              {protocol.sourcePdf && (
                <button
                  type="button"
                  className={btn("soft", inCard)}
                  onClick={() =>
                    void handleOpenPdf(protocol.id)
                  }
                >
                  View Original PDF ↗
                </button>
              )}

              <Link
                className={btn("soft", inCard)}
                to={`/protocols/${protocol.id}`}
              >
                View Protocol →
              </Link>

              <DeleteProtocolButton
                protocol={protocol}
                onClick={requestDelete}
              />
            </div>
          </article>
        ))}
      </div>

      {dialog}
    </>
  );
}
