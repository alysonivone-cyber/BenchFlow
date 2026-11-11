import { useEffect, useRef, type ReactNode } from "react";

import { btn } from "./ui";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  children: ReactNode;
  confirmLabel: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

/**
 * Accessible confirmation dialog built on the native <dialog>
 * element: showModal() provides the focus trap, the Escape key
 * and the backdrop without any extra library.
 */
export function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel,
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Keep the native dialog in sync with the `open` prop.
  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className="m-auto w-[min(440px,calc(100vw-32px))] rounded-[14px] border-0 p-[26px] shadow-dialog backdrop:bg-[#0f2a5266]"
      aria-labelledby="confirm-dialog-title"
      onCancel={(event) => {
        // Escape key: let React state close the dialog.
        event.preventDefault();
        if (!busy) onCancel();
      }}
    >
      <h2 id="confirm-dialog-title" className="mb-3">{title}</h2>

      <div className="[&_p]:mb-2 [&_p]:text-dialog-ink">{children}</div>

      <div className="mt-[18px] mb-[15px] flex flex-wrap justify-end gap-2">
        <button
          type="button"
          className={btn("soft")}
          onClick={onCancel}
          disabled={busy}
          autoFocus
        >
          Cancel
        </button>

        <button
          type="button"
          className={btn("danger")}
          onClick={onConfirm}
          disabled={busy}
        >
          {busy ? "Deleting…" : confirmLabel}
        </button>
      </div>
    </dialog>
  );
}
