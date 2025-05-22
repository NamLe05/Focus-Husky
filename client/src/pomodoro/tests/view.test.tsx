import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import PomodoroView from '../view';

describe('PomodoroView - timer control buttons', () => {
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
  const totalSeconds = parseInt(minutesStr, 10) * 60 + parseInt(secondsStr, 10);

  // Assert timer never goes below zero
  expect(totalSeconds).toBeGreaterThanOrEqual(0);
});
});
