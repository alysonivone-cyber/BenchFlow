import { TimerView } from "./TimerView";
import { useLabTimer } from "./useLabTimer";

type TimerPanelProps = {
  sessionId: string;
  stepId: string;
  /** Readable name stored with the timer record. */
  label?: string;
  /** Shown in the "Timer completed" banner (e.g. "Cell Lysis"). */
  stepTitle?: string;
};

export function TimerPanel({
  sessionId,
  stepId,
  label,
  stepTitle,
}: TimerPanelProps) {
  const lab = useLabTimer({ sessionId, stepId, label });

  return <TimerView {...lab} stepTitle={stepTitle} />;
}
