import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PomodoroTimerModel } from '../model';

describe('PomodoroTimerModel', () => {
  let timer: PomodoroTimerModel;
  const focusTime = 1500; // 25 mins
  const breakTime = 900;  // 15 mins

  beforeEach(() => {
    timer = new PomodoroTimerModel(focusTime, breakTime);
    vi.useFakeTimers();
  });

  afterEach(() => {
    timer.pause();
    vi.useRealTimers();
  });

  it('initializes with focus state and correct remaining time', () => {
    const state = timer.getState();
    expect(state.state).toBe('focus');
    expect(state.remainingTime).toBe(focusTime);
  });

  it('starts and ticks down the timer', () => {
    const tickCallback = vi.fn();
    timer.setOnTick(tickCallback);

    timer.start();

    // Advance 1 second
    vi.advanceTimersByTime(1000);

    // Remaining time should decrease by 1
    const state = timer.getState();
    expect(state.remainingTime).toBe(focusTime - 1);
    expect(tickCallback).toHaveBeenCalled();
  });

  it('does not start multiple intervals if already running', () => {
    timer.start();
    const interval1 = (timer as any).timerInterval;

    timer.start();
    const interval2 = (timer as any).timerInterval;

    expect(interval1).toBe(interval2);
  });

  it('pauses the timer and clears interval', () => {
    timer.start();
    timer.pause();

    expect((timer as any).timerInterval).toBeNull();
  });

  it('resets remaining time to current state time', () => {
    timer.start();
    vi.advanceTimersByTime(5000); // decrease time by 5 seconds
    timer.reset();

    const state = timer.getState();
    expect(state.remainingTime).toBe(focusTime);
  });

  it('switches state from focus to break and resets remaining time', () => {
    timer.switchState();
    const state = timer.getState();

    expect(state.state).toBe('break');
    expect(state.remainingTime).toBe(breakTime);
  });

  it('switches state from break to focus and resets remaining time', () => {
    timer.switchState(); // to break first
    timer.switchState(); // back to focus
    const state = timer.getState();

    expect(state.state).toBe('focus');
    expect(state.remainingTime).toBe(focusTime);
  });

  it('setFocusTime updates focus time and remaining time if in focus state', () => {
    const newFocusTime = 1200;
    timer.setFocusTime(newFocusTime);

    const state = timer.getState();
    expect(state.focusTime).toBe(newFocusTime);
    expect(state.remainingTime).toBe(newFocusTime);
  });

  it('setBreakTime updates break time and remaining time if in break state', () => {
    timer.switchState(); // switch to break
    const newBreakTime = 600;
    timer.setBreakTime(newBreakTime);

    const state = timer.getState();
    expect(state.breakTime).toBe(newBreakTime);
    expect(state.remainingTime).toBe(newBreakTime);
  });

  it('adjustRemainingTime increases remaining time correctly', () => {
    const tickCallback = vi.fn();
    timer.setOnTick(tickCallback);

    timer.adjustRemainingTime(60); // +1 minute
    const state = timer.getState();

    expect(state.remainingTime).toBe(focusTime + 60);
    expect(tickCallback).toHaveBeenCalled();
  });

  it('adjustRemainingTime decreases remaining time and switches state when <= 0', () => {
    const tickCallback = vi.fn();
    timer.setOnTick(tickCallback);

    // Decrease more than remaining time to trigger switchState
    timer.adjustRemainingTime(-(focusTime + 10));

    const state = timer.getState();
    expect(state.state).toBe('break');
    expect(state.remainingTime).toBe(breakTime);
    expect(tickCallback).toHaveBeenCalled();
  });
});
