import { TimerView } from "./TimerView";
import {
  GLOBAL_TIMER_LABEL,
  GLOBAL_TIMER_SESSION_ID,
  GLOBAL_TIMER_STEP_ID,
} from "./timerService";
import { useLabTimer } from "./useLabTimer";

export function GlobalTimer() {
  const lab = useLabTimer({
    sessionId: GLOBAL_TIMER_SESSION_ID,
    stepId: GLOBAL_TIMER_STEP_ID,
    label: GLOBAL_TIMER_LABEL,
  });

  return <TimerView {...lab} />;
}
