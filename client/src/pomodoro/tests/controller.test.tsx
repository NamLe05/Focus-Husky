import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PomodoroController } from '../controller';

describe('PomodoroController', () => {
  const focusTime = 1500;
  const breakTime = 300;
  let controller: PomodoroController;
  let callback: ReturnType<typeof vi.fn>;

  // Mocks for electronAPI methods
  let incrementFocusCountMock: ReturnType<typeof vi.fn>;
  let incrementTotalTimeMock: ReturnType<typeof vi.fn>;
  let notifyFocusSessionEndedMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    callback = vi.fn();

    incrementFocusCountMock = vi.fn();
    incrementTotalTimeMock = vi.fn();
    notifyFocusSessionEndedMock = vi.fn();

    // Mock the global electronAPI object for each test
    (window as any).electronAPI = {
      incrementFocusCount: incrementFocusCountMock,
      incrementTotalTime: incrementTotalTimeMock,
      notifyFocusSessionEnded: notifyFocusSessionEndedMock,
    };

    controller = new PomodoroController(focusTime, breakTime, callback);
  });

  afterEach(() => {
    // Cleanup the global mock
    delete (window as any).electronAPI;
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


  // API call tests

 it('calls electronAPI.incrementFocusCount and incrementTotalTime and notifyFocusSessionEnded on focus session completion', () => {
  // Mock getFocusElapsed to simulate 120 seconds elapsed
  let elapsed = 120;
  (controller as any).timerModel.getFocusElapsed = () => elapsed;

  // Clear mocks to isolate calls from this action
  incrementFocusCountMock.mockClear();
  incrementTotalTimeMock.mockClear();
  notifyFocusSessionEndedMock.mockClear();

  // Toggling state from focus to break triggers completion logic
  controller.togglePomodoroState();

  expect(incrementFocusCountMock).toHaveBeenCalledTimes(1);
  expect(incrementTotalTimeMock).toHaveBeenCalledWith(120);
  expect(notifyFocusSessionEndedMock).toHaveBeenCalled();
});

it('calls electronAPI.incrementTotalTime and notifyFocusSessionEnded when timer is paused', () => {
  controller.toggleTimer(); // start timer

  // Simulate 90 seconds elapsed
  let elapsed = 90;
  (controller as any).timerModel.getFocusElapsed = () => elapsed;

  incrementTotalTimeMock.mockClear();
  notifyFocusSessionEndedMock.mockClear();

  controller.toggleTimer(); // pause timer, triggers calls

  expect(incrementTotalTimeMock).toHaveBeenCalledWith(90);
  expect(notifyFocusSessionEndedMock).toHaveBeenCalledTimes(1);
});

it('calls electronAPI.incrementTotalTime periodically when timer is running and focus', async () => {
  vi.useFakeTimers();

  // Recreate controller here with fake timers active
  controller = new PomodoroController(focusTime, breakTime, callback);

  // Start timer
  controller.toggleTimer();

  let elapsed = 0;
  (controller as any).timerModel.getFocusElapsed = () => elapsed;

  // Advance time - no increment yet because elapsed = 0
  await vi.advanceTimersByTimeAsync(10 * 1000);
  expect(incrementTotalTimeMock).not.toHaveBeenCalled();

  // Increase elapsed beyond 60 seconds
  elapsed = 61;
  await vi.advanceTimersByTimeAsync(10 * 1000);

  expect(incrementTotalTimeMock).toHaveBeenCalledWith(61);

  vi.useRealTimers();
});
});




