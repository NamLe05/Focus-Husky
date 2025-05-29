import {PomodoroTimerModel, PomodoroState} from './model';

export class PomodoroController {
  private timerModel: PomodoroTimerModel;
  private viewUpdateCallback: (
    timerState: boolean,
    pomodoroState: PomodoroState,
  ) => void;
  private timerState = false;

  constructor(
  focusTime: number,
  breakTime: number,
  callback: (timerState: boolean, pomodoroState: PomodoroState) => void,
) {
  this.viewUpdateCallback = callback;
  this.timerModel = new PomodoroTimerModel(focusTime, breakTime);

  // 🔁 Forward tick updates to the view
  this.timerModel.setOnTick(updatedState => {
    this.viewUpdateCallback(this.timerState, updatedState);
  });

  // invoke callback with initial state
  this.viewUpdateCallback(this.timerState, this.timerModel.getState());
}

  public toggleTimer(): void {
    if (this.timerState) {
      this.timerModel.pause();
    } else {
      this.timerModel.start();
    }

    this.timerState = !this.timerState;
    this.updateViewState();
  }

  public togglePomodoroState(): void {
    this.timerModel.switchState();
    this.updateViewState();
  }

  public resetTimer(): void {
    this.timerModel.reset();
    this.timerState = false;
    this.updateViewState();
  }

  private updateViewState(): void {
    const pomodoroState = this.timerModel.getState();
    this.viewUpdateCallback(this.timerState, pomodoroState);
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
