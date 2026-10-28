import { useState } from "react";
import { Link } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";

import {
  getAllProtocols,
  openSourcePdf,
} from "./protocolService";

export function ProtocolLibrary() {
  const protocols = useLiveQuery(
    () => getAllProtocols(),
    []
  );

  const [error, setError] = useState("");

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
      <div className="heading">
        <h1>Protocol Library</h1>
        <p>
          Browse protocols, consult original PDFs
          and start experimental sessions.
        </p>
      </div>

      <p>
        <Link
          className="btn primary"
          to="/protocols/new"
        >
          + Add New Protocol
        </Link>
      </p>

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      <div className="stack">
        {protocols?.map((protocol) => (
          <article
            className="listcard"
            key={protocol.id}
          >
            <div>
              <h3>{protocol.title}</h3>

              <span className="muted">
                {protocol.steps.length} steps
                {protocol.sourcePdf
                  ? " · PDF attached"
                  : ""}
              </span>
            </div>

            <div className="button-row">
              {protocol.sourcePdf && (
                <button
                  type="button"
                  className="btn soft"
                  onClick={() =>
                    void handleOpenPdf(protocol.id)
                  }
                >
                  View Original PDF ↗
                </button>
              )}

              <Link
                className="btn soft"
                to={`/protocols/${protocol.id}`}
              >
                View Protocol →
              </Link>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
