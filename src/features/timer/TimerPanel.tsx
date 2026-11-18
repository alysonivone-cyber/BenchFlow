import { TimerView } from "./TimerView";
import { useLabTimer } from "./useLabTimer";

type TimerPanelProps = {
  sessionId: string;
  stepId: string;
  /** Readable name stored with the timer record. */
  label?: string;
  /** Shown in the end-of-timer alert (e.g. "Cell Lysis"). */
  stepTitle?: string;
};

export function TimerPanel({
  sessionId,
  stepId,
  label,
  stepTitle,
}: TimerPanelProps) {
  const lab = useLabTimer({
    sessionId,
    stepId,
    label,
    stepTitle,
  });

  return <TimerView {...lab} stepTitle={stepTitle} />;
}
