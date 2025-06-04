/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-floating-promises */
import { pomodoroSessionPoints } from '../rewards-store/controller';
import { PomodoroTimerModel, PomodoroState } from './model';

export class PomodoroController {
  private timerModel: PomodoroTimerModel;
  private viewUpdateCallback: (
    timerState: boolean,
    pomodoroState: PomodoroState
  ) => void;
  private timerState = false;

  private lastSentElapsed = 0;
  private periodicUpdateInterval: NodeJS.Timeout | null = null;

  constructor(
    focusTime: number,
    breakTime: number,
    callback: (timerState: boolean, pomodoroState: PomodoroState) => void
  ) {
    this.viewUpdateCallback = callback;
    this.timerModel = new PomodoroTimerModel(focusTime, breakTime);

    // Forward tick updates to the view
    this.timerModel.setOnTick((updatedState) => {
      this.viewUpdateCallback(this.timerState, updatedState);
    });

    // Send initial state
    this.viewUpdateCallback(this.timerState, this.timerModel.getState());

    // When a focus session finishes naturally
    this.timerModel.setOnFocusComplete((elapsedSeconds: number) => {
      // Increment focus count
      window.electronAPI?.incrementFocusCount?.();

      // Send any remaining elapsed seconds not yet counted
      const delta = elapsedSeconds - this.lastSentElapsed;
      if (delta > 0) {
        window.electronAPI?.incrementTotalTime?.(delta);
        const pointsToAdd = Math.floor(delta / 60);
        if (pointsToAdd > 0) {
          pomodoroSessionPoints(pointsToAdd);
          window.electronAPI?.updatePoints?.();
        }
      }

      window.electronAPI?.notifyFocusSessionEnded?.();
      this.lastSentElapsed = 0;
      this.clearPeriodicUpdate();
    });

    // Start periodic updates (in case timer starts immediately)
    this.startPeriodicUpdate();
  }

  private startPeriodicUpdate() {
    if (this.periodicUpdateInterval) return; // already running

    this.periodicUpdateInterval = setInterval(() => {
      if (this.timerState && this.timerModel.getState().state === 'focus') {
        const elapsed = this.timerModel.getFocusElapsed();
        const delta = elapsed - this.lastSentElapsed;

        if (delta >= 60) { // every 60 seconds increment total time
          window.electronAPI?.incrementTotalTime?.(delta);

          const pointsToAdd = Math.floor(delta / 60);
          if (pointsToAdd > 0) {
            pomodoroSessionPoints(pointsToAdd);
            window.electronAPI?.updatePoints?.();
          }
          this.lastSentElapsed = elapsed;
        }
      }
    }, 10 * 1000); // check every 10 seconds
  }

  private clearPeriodicUpdate() {
    if (this.periodicUpdateInterval) {
      clearInterval(this.periodicUpdateInterval);
      this.periodicUpdateInterval = null;
    }
  }

  public toggleTimer(): void {
    if (this.timerState) {
      // If currently running, pause the timer and send any leftover elapsed seconds
      if (this.timerModel.getState().state === 'focus') {
        const elapsed = this.timerModel.getFocusElapsed();
        const delta = elapsed - this.lastSentElapsed;
        if (delta > 0) {
          window.electronAPI?.incrementTotalTime?.(delta);
          window.electronAPI?.notifyFocusSessionEnded?.();
          const pointsToAdd = Math.floor(delta / 60);
          if (pointsToAdd > 0) {
            pomodoroSessionPoints(pointsToAdd);
            window.electronAPI?.updatePoints?.();
          }
          this.lastSentElapsed = elapsed;
        }
      }
      this.timerModel.pause();
      this.clearPeriodicUpdate();
    } else {
      this.timerModel.start();
      this.startPeriodicUpdate();
    }
    this.timerState = !this.timerState;
    this.updateViewState();
  }

  public togglePomodoroState(): void {
    // On switching state, send any leftover elapsed seconds
    if (this.timerModel.getState().state === 'focus') {
      const elapsed = this.timerModel.getFocusElapsed();
      const delta = elapsed - this.lastSentElapsed;
      if (delta > 0) {
        window.electronAPI?.incrementTotalTime?.(delta);
        window.electronAPI?.notifyFocusSessionEnded?.();
        this.lastSentElapsed = elapsed;
      }
    }
    this.timerModel.switchState();
    this.updateViewState();
  }

  public resetTimer(): void {
    this.timerModel.reset();
    this.timerState = false;
    this.lastSentElapsed = 0;
    this.clearPeriodicUpdate();
    this.updateViewState();
  }

  private updateViewState(): void {
    this.viewUpdateCallback(this.timerState, this.timerModel.getState());
  }

  public getRemainingTime(): number {
    return this.timerModel.getRemainingTime();
  }

  public setFocusTime(focusTime: number): void {
    this.timerModel.setFocusTime(focusTime);
    this.updateViewState();
  }

  public setBreakTime(breakTime: number): void {
    this.timerModel.setBreakTime(breakTime);
    this.updateViewState();
  }

  public adjustRemainingTime(deltaSeconds: number): void {
    this.timerModel.adjustRemainingTime(deltaSeconds);
  }
}
