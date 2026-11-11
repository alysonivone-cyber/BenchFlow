import type { ReactNode } from "react";

type ChipProps = {
  tone: "blue" | "violet";
  children: ReactNode;
};

const tones = {
  blue: "border-chip-blue-line bg-chip-blue text-chip-blue-ink",
  violet: "border-chip-violet-line bg-chip-violet text-chip-violet-ink",
} as const;

/** Small rounded label (e.g. "6 steps", "~ 25 minutes"). */
export function Chip({ tone, children }: ChipProps) {
  return (
    <span
      className={`inline-flex items-center gap-[7px] rounded-full border px-[14px] py-[7px] text-[.84rem] leading-[1.2] font-bold ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
