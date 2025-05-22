export type TimerState = 'focus' | 'break';

export interface PomodoroState {
  state: TimerState;
  focusTime: number; // Focus time in seconds
  breakTime: number; // Break time in seconds
  remainingTime: number; // Remaining time in seconds for the current state
}

export class PomodoroTimerModel {
  private state: PomodoroState;
  private timerInterval: NodeJS.Timeout | null = null;
  private onTick?: (state: PomodoroState) => void;

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
      if (this.state.remainingTime > 0) {
        this.state.remainingTime -= 1;
      } else {
        this.switchState();
      }

      // 🔔 Notify the controller on every tick
      this.onTick?.({...this.state});
    }, 1000);
  }

  public pause(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  public reset(): void {
    this.state.remainingTime = this.state.focusTime;
  }

  public switchState(): void {
    if (this.state.state === 'focus') {
      this.state.state = 'break';
      this.state.remainingTime = this.state.breakTime;
    } else {
      this.state.state = 'focus';
      this.state.remainingTime = this.state.focusTime;
    }

    // 🔔 Trigger tick after state switch
    this.onTick?.({...this.state});
  }

  public getState(): PomodoroState {
    return this.state;
  }

  public setFocusTime(focusTime: number): void {
    this.state.focusTime = focusTime;
    if (this.state.state === 'focus') {
      this.state.remainingTime = focusTime;
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

  // 👇 Add this to allow the controller to register a tick handler
  public setOnTick(callback: (state: PomodoroState) => void): void {
    this.onTick = callback;
  }
}
