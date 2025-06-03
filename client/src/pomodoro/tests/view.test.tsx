import {describe, it, expect, vi, beforeEach, afterEach, beforeAll} from 'vitest';
import {render, screen, fireEvent} from '@testing-library/react';
import React from 'react';
import PomodoroView from '../view';

describe('PomodoroView - timer control buttons', () => {
  beforeAll(() => {
    (window as any).electronAPI = {
      getPetState: vi.fn().mockResolvedValue([]),
      openOrFocusMainHome: vi.fn(),
      onPetStateUpdate: vi.fn(),
      removePetStateUpdateListener: vi.fn(),
      // Add other methods as needed
    };
  });

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts and stops the timer when play/pause button is clicked', () => {
    render(<PomodoroView />);

    const playPauseButton = screen.getByText('▶');

    // Click to start
    fireEvent.click(playPauseButton);
    expect(screen.getByText('◼')).toBeTruthy(); // State should now show pause symbol

    // Click to stop
    fireEvent.click(screen.getByText('◼'));
    expect(screen.getByText('▶')).toBeTruthy(); // Should toggle back to play symbol
  });

  it('increases the remaining time by 60 seconds on "+" click', () => {
    render(<PomodoroView />);

    const timerDisplay = screen.getByText('25:00');
    const increaseButton = screen.getByText('+');

    fireEvent.click(increaseButton);
    expect(screen.getByText('26:00')).toBeTruthy();
  });

  it('decreases the remaining time by 60 seconds on "−" click', () => {
    render(<PomodoroView />);

    const timerDisplay = screen.getByText('25:00');
    const decreaseButton = screen.getByText('−');

    fireEvent.click(decreaseButton);
    expect(screen.getByText('24:00')).toBeTruthy();
  });

  it('does not go below 0 when decreasing repeatedly', () => {
    render(<PomodoroView />);
    const decreaseButton = screen.getByText('−');

    for (let i = 0; i < 30; i++) {
      fireEvent.click(decreaseButton);
    }

    const timer = screen.getByText((_, element) =>
      element?.classList.contains('timerCountdown'),
    );
    expect(timer).toBeTruthy();

    // The timer text should be a valid mm:ss format
    const timeText = timer.textContent || '';
    expect(timeText).toMatch(/^\d{2}:\d{2}$/);

    // Parse minutes and seconds to total seconds
    const [minutesStr, secondsStr] = timeText.split(':');
    const totalSeconds =
      parseInt(minutesStr, 10) * 60 + parseInt(secondsStr, 10);

    // Assert timer never goes below zero
    expect(totalSeconds).toBeGreaterThanOrEqual(0);
  });

  it('calls electronAPI.openOrFocusMainHome when settings button is clicked', () => {
    const openMainMock = vi.fn();

    (window as any).electronAPI = {
      getPetState: vi.fn().mockResolvedValue([]),
      openOrFocusMainHome: openMainMock,
      onPetStateUpdate: vi.fn(),
      removePetStateUpdateListener: vi.fn(),
    };

    render(<PomodoroView />);

    const settingsButton = screen.getByTestId('settings-button');
    fireEvent.click(settingsButton); // fires click event

    expect(openMainMock).toHaveBeenCalledTimes(1);
  });
});
