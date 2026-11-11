import { Trash2 } from "lucide-react";

import { btn, inCard } from "../../components/ui";
import type { Protocol } from "../../types/models";

type DeleteProtocolButtonProps = {
  protocol: Protocol;
  onClick: (protocol: Protocol) => void;
  /** Visible text; defaults to "Delete". */
  label?: string;
};

/** Soft red outline button shared by every "delete protocol" entry point. */
export function DeleteProtocolButton({
  protocol,
  onClick,
  label = "Delete",
}: DeleteProtocolButtonProps) {
  return (
    <button
      type="button"
      className={btn("dangerOutline", inCard)}
      onClick={() => onClick(protocol)}
      aria-label={`Delete protocol ${protocol.title}`}
    >
      <Trash2 size={16} aria-hidden="true" />
      {label}
    </button>
  );
}
