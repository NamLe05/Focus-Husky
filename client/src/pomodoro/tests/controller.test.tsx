import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PomodoroController } from '../controller';

describe('PomodoroController', () => {
  const focusTime = 1500;
  const breakTime = 300;
  let controller: PomodoroController;
  let callback: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    callback = vi.fn();
    controller = new PomodoroController(focusTime, breakTime, callback);
  });

  it('calls callback on initialization with correct initial state', () => {
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(false, expect.objectContaining({
      state: 'focus',
      focusTime,
      breakTime,
      remainingTime: focusTime,
    }));
  });

  it('toggles timer start and pause and calls callback each time', () => {
    controller.toggleTimer(); // Start
    expect(callback).toHaveBeenLastCalledWith(true, expect.any(Object));

    controller.toggleTimer(); // Pause
    expect(callback).toHaveBeenLastCalledWith(false, expect.any(Object));
  });

  it('toggles between focus and break states', () => {
    controller.togglePomodoroState(); // to break
    expect(callback).toHaveBeenLastCalledWith(expect.any(Boolean), expect.objectContaining({
      state: 'break',
      remainingTime: breakTime,
    }));

    controller.togglePomodoroState(); // back to focus
    expect(callback).toHaveBeenLastCalledWith(expect.any(Boolean), expect.objectContaining({
      state: 'focus',
      remainingTime: focusTime,
    }));
  });

  it('resets the timer and sets remaining time to current state\'s duration', () => {
    controller.toggleTimer(); // start
    controller.resetTimer();  // should pause and reset

    expect(callback).toHaveBeenLastCalledWith(false, expect.objectContaining({
      remainingTime: focusTime,
    }));
  });

  it('sets new focus time and resets remaining time if in focus mode', () => {
    const newFocusTime = 1000;
    controller.setFocusTime(newFocusTime);

    expect(callback).toHaveBeenLastCalledWith(expect.any(Boolean), expect.objectContaining({
      focusTime: newFocusTime,
      remainingTime: newFocusTime,
      state: 'focus',
    }));
  });

  it('sets new break time and resets remaining time if in break mode', () => {
    controller.togglePomodoroState(); // go to break
    const newBreakTime = 200;
    controller.setBreakTime(newBreakTime);

    expect(callback).toHaveBeenLastCalledWith(expect.any(Boolean), expect.objectContaining({
      breakTime: newBreakTime,
      remainingTime: newBreakTime,
      state: 'break',
    }));
  });

  it('adjusts remaining time correctly', () => {
    const before = controller.getRemainingTime();
    controller.adjustRemainingTime(60);
    const after = controller.getRemainingTime();

    expect(after).toBe(before + 60);
  });
});
