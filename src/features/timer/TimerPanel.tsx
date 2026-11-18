import { TimerView } from "./TimerView";
import { useLabTimer } from "./useLabTimer";

type TimerPanelProps = {
  sessionId?: string;
  stepId?: string;
  /** Shown in the end-of-timer alert (e.g. "Cell Lysis"). */
  stepTitle?: string;
};

export function TimerPanel({
  sessionId,
  stepId,
  stepTitle,
}: TimerPanelProps) {
  const lab = useLabTimer({ sessionId, stepId, stepTitle });

  return <TimerView {...lab} stepTitle={stepTitle} />;
}
