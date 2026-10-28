import { useEffect, useState } from 'react';
import { db } from '../../db/database';
import {
  ensureTimer,
  reconcileTimer,
  remainingTime,
  setTimer,
  updateTimer,
} from './timerService';
import type { LabTimer } from '../../types/models';

const TIMER_PRESETS = [
  { label: '30 sec', seconds: 30 },
  { label: '1 min', seconds: 60 },
  { label: '5 min', seconds: 300 },
  { label: '10 min', seconds: 600 },
  { label: '15 min', seconds: 900 },
  { label: '30 min', seconds: 1800 },
  { label: '45 min', seconds: 2700 },
  { label: '1 hour', seconds: 3600 },
  { label: '2 hours', seconds: 7200 },
  { label: '3 hours', seconds: 10800 },
];

function formatRemaining(milliseconds: number): string {
  const totalSeconds = Math.floor(Math.max(0, milliseconds) / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const twoDigits = (value: number) => String(value).padStart(2, '0');

  return hours > 0
    ? `${twoDigits(hours)}:${twoDigits(minutes)}:${twoDigits(seconds)}`
    : `${twoDigits(minutes)}:${twoDigits(seconds)}`;
}

export function TimerPanel({
  sessionId,
  stepId,
}: {
  sessionId?: string;
  stepId?: string;
}) {
  const [timer, setLocalTimer] = useState<LabTimer | null>(null);
  const [duration, setDuration] = useState(30);
  const [now, setNow] = useState(Date.now());
  const [error, setError] = useState('');
  const persistent = Boolean(sessionId && stepId);

  useEffect(() => {
    let live = true;

    if (sessionId && stepId) {
      ensureTimer(sessionId, stepId)
        .then((savedTimer) => {
          if (!live) return;
          const restored = reconcileTimer(savedTimer);
          setLocalTimer(restored);
          setDuration(Math.round(restored.durationMs / 1000));
        })
        .catch(() => {
          if (live) setError('Timer storage unavailable.');
        });
    } else {
      setLocalTimer({
        id: 'practice',
        sessionId: '',
        stepId: '',
        durationMs: 30000,
        remainingMs: 30000,
        endsAt: null,
        status: 'idle',
        updatedAt: Date.now(),
      });
      setDuration(30);
    }

    return () => {
      live = false;
    };
  }, [sessionId, stepId]);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (timer?.status === 'running' && remainingTime(timer, now) === 0) {
      const finished = reconcileTimer(timer, now);
      setLocalTimer(finished);
      if (persistent) {
        void setTimer(finished).catch(() => setError('Could not save timer.'));
      }
    }
  }, [now, timer, persistent]);

  async function apply(action: 'start' | 'pause' | 'reset') {
    if (!timer) return;
    const next = updateTimer(timer, action);
    setLocalTimer(next);
    if (persistent) {
      try {
        await setTimer(next);
      } catch {
        setError('Could not save timer.');
      }
    }
  }

  async function changeDuration(seconds: number) {
    if (!timer || !Number.isFinite(seconds) || seconds < 1 || seconds > 86400) return;

    setDuration(seconds);
    const next: LabTimer = {
      ...timer,
      durationMs: seconds * 1000,
      remainingMs: seconds * 1000,
      endsAt: null,
      status: 'idle',
      updatedAt: Date.now(),
    };
    setLocalTimer(next);

    if (persistent) {
      try {
        await db.timers.put(next);
      } catch {
        setError('Could not save timer.');
      }
    }
  }

  const remaining = timer ? remainingTime(timer, now) : 0;

  return (
    <div className="timer">
      <div className="clock" aria-live="off">{formatRemaining(remaining)}</div>

      <p className="muted">
        {timer?.status === 'finished'
          ? 'Time is up!'
          : timer?.status === 'running'
            ? 'Timer running'
            : timer?.status === 'paused'
              ? 'Timer paused'
              : 'Ready to start'}
      </p>

      {timer?.status === 'finished' && (
        <p className="success" role="alert">
          Timer completed{stepId ? ' for this experimental step' : ''}.
        </p>
      )}

      <div className="button-row">
        <button
          className="btn primary"
          disabled={!timer || timer.status === 'running'}
          onClick={() => void apply('start')}
        >
          ▶ {timer?.status === 'paused' ? 'Resume' : 'Start'}
        </button>
        <button
          className="btn soft"
          disabled={timer?.status !== 'running'}
          onClick={() => void apply('pause')}
        >
          Pause
        </button>
        <button
          className="btn soft"
          disabled={!timer}
          onClick={() => void apply('reset')}
        >
          Reset
        </button>
      </div>

      <label className="duration-label">
        Duration (seconds)
        <input
          type="number"
          min="1"
          max="86400"
          value={duration}
          onChange={(event) => setDuration(Number(event.target.value))}
          onBlur={() => void changeDuration(duration)}
        />
      </label>

      <div className="button-row presets">
        {TIMER_PRESETS.map(({ label, seconds }) => (
          <button
            key={seconds}
            type="button"
            className="btn soft"
            disabled={!timer}
            onClick={() => void changeDuration(seconds)}
          >
            {label}
          </button>
        ))}
      </div>

      {error && <p role="alert" className="error">{error}</p>}
    </div>
  );
}
