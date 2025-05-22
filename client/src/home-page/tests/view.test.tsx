import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {render, screen, fireEvent} from '@testing-library/react';
import React from 'react';
import View from '../view';

const INITIAL_DATE = new Date('2025-05-20T17:18:00');
const ONE_MINUTE_LATER = new Date('2025-05-20T17:19:00');

describe('View component - time updates', () => {
  let OriginalDate: typeof Date;

  beforeEach(() => {
    OriginalDate = Date;

    vi.useFakeTimers();

    vi.stubGlobal(
      'Date',
      class extends OriginalDate {
        constructor(...args: any[]) {
          super();
          if (args.length === 0) {
            return new OriginalDate(INITIAL_DATE);
          }
          // @ts-ignore
          return new OriginalDate(...args);
        }
        static now() {
          return INITIAL_DATE.getTime();
        }
      },
    );
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('renders initial date and time, then updates after 1 minute', () => {
    const {rerender} = render(<View />);

    const initialTimeText = '5/20/2025 | 5:18 PM';
    expect(
      screen.queryByText(content => content.includes(initialTimeText)),
    ).toBeTruthy();

    // Advance global Date mock to 1 minute later
    const newTimeMs = ONE_MINUTE_LATER.getTime();

    vi.stubGlobal(
      'Date',
      class extends OriginalDate {
        constructor(...args: any[]) {
          super();
          if (args.length === 0) {
            return new OriginalDate(newTimeMs);
          }
          // @ts-ignore
          return new OriginalDate(...args);
        }
        static now() {
          return newTimeMs;
        }
      },
    );

    // Advance timers by 60 seconds (your interval is 10 seconds, but advancing by 1 minute is fine)
    vi.advanceTimersByTime(60 * 1000);

    // Rerender to reflect new time in the component (in case useEffect depends on state updates)
    rerender(<View />);

    const updatedTimeText = '5/20/2025 | 5:19 PM';
    expect(
      screen.queryByText(content => content.includes(updatedTimeText)),
    ).toBeTruthy();
  });
});

describe('View component - Pomodoro button', () => {
  it('calls electronAPI.openPomodoroWindow when Pomodoro start button is clicked', () => {
    const openPomodoroWindowMock = vi.fn();
    (window as any).electronAPI = {
      openPomodoroWindow: openPomodoroWindowMock,
    };

    render(<View />);

    const startButton = screen.getByRole('button');

    fireEvent.click(startButton);

    expect(openPomodoroWindowMock).toHaveBeenCalledTimes(1);
  });
});
