import { pomodoroSessionPoints } from "../rewards-store/controller";

export type TimerState = 'focus' | 'break';

export interface PomodoroState {
  state: TimerState;
  focusTime: number;   // Focus length in seconds
  breakTime: number;   // Break length in seconds
  remainingTime: number;
}

// Stats
export type PomodoroStats = {
  _id: string;        // always "focus-counter"
  focusCount: number;
  totalTime: number;  // accumulated real focus seconds
};

export class PomodoroTimerModel {
  private state: PomodoroState;
  private timerInterval: NodeJS.Timeout | null = null;
  private onTick?: (state: PomodoroState) => void;

  // Track how many seconds have truly elapsed in the current focus session
  private focusElapsed = 0;

  constructor(focusTime: number, breakTime: number) {
    this.state = {
      state: 'focus',
      focusTime,
      breakTime,
      remainingTime: focusTime,
    };
  }

  public start(): void {
    if (this.timerInterval) return;

    this.timerInterval = setInterval(() => {
      // Only increment focusElapsed if we are in focus mode and time is ticking down
      if (this.state.state === 'focus' && this.state.remainingTime > 0) {
        this.focusElapsed += 1;
        this.state.remainingTime -= 1;
      } else if (this.state.remainingTime > 0) {
        // if in break, just tick down
        this.state.remainingTime -= 1;
      } else {
        // remainingTime reached 0 (or below) → switch states
        this.switchState();
      }

      this.onTick?.({ ...this.state });
    }, 1000);
  }

  public pause(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  public reset(): void {
    this.state.remainingTime =
      this.state.state === 'focus'
        ? this.state.focusTime
        : this.state.breakTime;
  }

  public switchState(): void {
    const justFinishedFocus = this.state.state === 'focus';

    if (justFinishedFocus) {
      // Pass focusElapsed to callback, then reset it
      this.onFocusComplete?.(this.focusElapsed);
      this.focusElapsed = 0;
      pomodoroSessionPoints(5);
      window.electronAPI?.updatePoints?.();
      // Now switch to break
      this.state.state = 'break';
      this.state.remainingTime = this.state.breakTime;
    } else {
      // Switch back to focus
      this.state.state = 'focus';
      this.state.remainingTime = this.state.focusTime;
    }

    this.onTick?.({ ...this.state });
  }

  public getState(): PomodoroState {
    return this.state;
  }

  public setFocusTime(focusTime: number): void {
    this.state.focusTime = focusTime;
    if (this.state.state === 'focus') {
      this.state.remainingTime = focusTime;
      this.focusElapsed = 0;
    }
  }

  public setBreakTime(breakTime: number): void {
    this.state.breakTime = breakTime;
    if (this.state.state === 'break') {
      this.state.remainingTime = breakTime;
    }
  }

  public getRemainingTime(): number {
    return this.state.remainingTime;
  }
  

  public setOnTick(callback: (state: PomodoroState) => void): void {
    this.onTick = callback;
  }

  public adjustRemainingTime(delta: number): void {
    this.state.remainingTime += delta;
    // Do NOT change focusElapsed here—manual jumps don't count as elapsed
    if (this.state.remainingTime <= 0) {
      this.switchState();
    } else {
      this.onTick?.({ ...this.state });
    }
  }

  // onFocusComplete now receives actual elapsed focus‐seconds
  private onFocusComplete?: (elapsedSeconds: number) => void;
  public setOnFocusComplete(callback: (elapsedSeconds: number) => void): void {
    this.onFocusComplete = callback;
  }

  public getFocusElapsed(): number {
    return this.focusElapsed;
  }
}
