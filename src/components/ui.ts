// ==================================================
// BENCHFLOW — SHARED TAILWIND CLASS GROUPS
// ==================================================
//
// Patterns used in many screens live here once, so a style
// change (a button color, a card radius) is made in one place.
// Class names are written in full so Tailwind can detect them.

// --------------------------------------------------
// BUTTONS  (work for <button> and <Link>)
// --------------------------------------------------

const buttonBase =
  "inline-flex items-center justify-center gap-[7px] rounded-[9px] px-[17px] py-3 text-center text-[.89rem] font-bold disabled:cursor-not-allowed disabled:opacity-50";

const buttonVariants = {
  primary: "bg-primary text-white hover:bg-primary-hover",
  soft: "bg-soft text-soft-ink hover:bg-soft-hover",
  danger: "bg-danger text-white hover:bg-danger-hover",
  dangerOutline:
    "border border-danger-line bg-white text-danger-ink hover:bg-danger-soft",
} as const;

export type ButtonVariant = keyof typeof buttonVariants;

/** Join class names, ignoring empty values. */
export function cx(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function btn(variant: ButtonVariant, extra?: string) {
  return cx(buttonBase, buttonVariants[variant], extra);
}

/** Smaller buttons when they sit inside a list card on phones. */
export const inCard = "phone:px-[10px] phone:py-[10px] phone:text-[.75rem]";

// --------------------------------------------------
// CARDS, PANELS, LAYOUT
// --------------------------------------------------

const cardSurface =
  "rounded-[14px] border border-line-card bg-white shadow-card";

/** Content panel; also styles the headings and lists it contains. */
export const panel = cx(
  cardSurface,
  "p-[23px] [&_h2]:mb-3 [&_h3]:mb-3",
  "[&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-[23px] [&_ol]:leading-[1.85]",
  "[&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-[23px] [&_ul]:leading-[1.85]"
);

/** Row card (library, sessions). Alignment is chosen per screen. */
export function listCard(extra?: string) {
  return cx(
    cardSurface,
    "flex justify-between gap-5 px-6 py-[22px] phone:px-4 phone:py-4",
    extra
  );
}

export const detailsCard = cx(
  cardSurface,
  "group/step px-[18px] py-[13px]"
);

/** Vertical stack of blocks; `minmax(0,1fr)` lets children shrink. */
export const stack = "grid min-w-0 grid-cols-[minmax(0,1fr)] gap-4";

export const detailGrid =
  "grid grid-cols-[1fr_1.25fr] gap-6 tablet:grid-cols-[minmax(0,1fr)]";

export const twoCols =
  "grid grid-cols-2 gap-6 tablet:grid-cols-[minmax(0,1fr)]";

/** Page title block. */
export const heading =
  "mb-8 [&_p]:text-[1.05rem] [&_p]:text-subtle";

/** Row of buttons. */
export const buttonRow = "my-[15px] flex flex-wrap justify-center gap-2";

// --------------------------------------------------
// FORMS
// --------------------------------------------------

/** Two-column form grid whose labels stack their input. */
export const fields = cx(
  "my-[18px] grid grid-cols-2 gap-[14px] phone:grid-cols-[minmax(0,1fr)]",
  "[&_label]:grid [&_label]:gap-[7px] [&_label]:text-[.85rem] [&_label]:font-[650]",
  "[&_input]:w-full [&_select]:w-full"
);

// --------------------------------------------------
// FEEDBACK MESSAGES
// --------------------------------------------------

export const successMessage =
  "mt-[14px] rounded-[9px] bg-ok p-3 text-ok-ink";

export const errorMessage = "rounded-[9px] bg-err p-3 text-err-ink";

export const mutedText = "text-muted";

export const hintText = "text-[.82rem] text-hint";
