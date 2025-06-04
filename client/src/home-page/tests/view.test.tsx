import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {render, screen, fireEvent} from '@testing-library/react';
import React, { act } from 'react';
import View from '../view';
import {MemoryRouter} from 'react-router-dom'; // Import this
import taskControllerInstance from '../../tasks/controller';

const INITIAL_DATE = new Date('2025-05-20T17:18:00');
const ONE_MINUTE_LATER = new Date('2025-05-20T17:19:00');

describe('View component - time updates', () => {
  let OriginalDate: typeof Date;

  beforeEach(() => {
    // Mock the electronAPI
    (window as any).electronAPI = {
      openPomodoroWindow: vi.fn(),
      openPetWindow: vi.fn(),
      onNavigateHome: vi.fn(),
      removeNavigateHomeListener: vi.fn(),
    };

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
    const {rerender} = render(
      <MemoryRouter>
        <View />
      </MemoryRouter>,
    );

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

    vi.advanceTimersByTime(60 * 1000);
    rerender(
      <MemoryRouter>
        <View />
      </MemoryRouter>,
    );

    const updatedTimeText = '5/20/2025 | 5:19 PM';
    expect(
      screen.queryByText(content => content.includes(updatedTimeText)),
    ).toBeTruthy();
  });
});

describe('View component - Pomodoro button', () => {
  beforeEach(() => {
    (window as any).electronAPI = {
      openPomodoroWindow: vi.fn(),
      openPetWindow: vi.fn(),
      onNavigateHome: vi.fn(),
      removeNavigateHomeListener: vi.fn(),
    };
  });


  // Stat card tests
  describe('View component - Stats and To Do list', () => {
  beforeEach(() => {
    (window as any).electronAPI = {
      openPomodoroWindow: vi.fn(),
      openPetWindow: vi.fn(),
      onNavigateHome: vi.fn(),
      removeNavigateHomeListener: vi.fn(),
      getFocusCount: vi.fn().mockResolvedValue(5),
      getTotalTime: vi.fn().mockResolvedValue(3661),
    };
  });

  it('renders correct stats info based on electronAPI responses', async () => {
    render(
      <MemoryRouter>
        <View />
      </MemoryRouter>
    );

    // Wait for "Sessions Completed :" label to appear and check the sibling's textContent
    const sessionsCompleted = await screen.findByText('Sessions Completed :');
    const sessionsValue = sessionsCompleted.nextElementSibling;
    expect(sessionsValue && sessionsValue.textContent).toBe('5');

    // Wait for "Total Time Focused :" label to appear and check the sibling's textContent
    const totalTimeFocused = await screen.findByText('Total Time Focused :');
    const totalTimeValue = totalTimeFocused.nextElementSibling;
    expect(totalTimeValue && totalTimeValue.textContent).toBe('01:01:01');
  });

  it('renders To Do list with "No tasks pending 🎉" when there are no tasks', () => {
    render(
      <MemoryRouter>
        <View />
      </MemoryRouter>
    );

    // Since todoTasks starts empty, the "No tasks pending 🎉" message should appear
    const noTasksMessage = screen.getByText('No tasks pending 🎉');
    expect(noTasksMessage).not.toBeNull();
  });
});


  // Pomodoro Timer tests

  it('calls electronAPI.openPomodoroWindow when Pomodoro start button is clicked', () => {
    render(
      <MemoryRouter>
        <View />
      </MemoryRouter>,
    );

    const startButton = screen.getByRole('button');
    fireEvent.click(startButton);

    expect(window.electronAPI.openPomodoroWindow).toHaveBeenCalledTimes(1);
  });

  it('shows "Start Pomodoro Timer" initially when window is closed', async () => {
    (window as any).electronAPI.isPomodoroWindowOpen = vi.fn().mockResolvedValue(false);

    await act(async () => {
      render(
        <MemoryRouter>
          <View />
        </MemoryRouter>
      );
    });

    expect(screen.getByText('Start Pomodoro Timer')).toBeTruthy();
  });

  it('shows "Close Pomodoro Timer" initially when window is open', async () => {
    (window as any).electronAPI.isPomodoroWindowOpen = vi.fn().mockResolvedValue(true);

    await act(async () => {
      render(
        <MemoryRouter>
          <View />
        </MemoryRouter>
      );
    });

    expect(screen.getByText('Close Pomodoro Timer')).toBeTruthy();
  });

  it('calls openPomodoroWindow when button clicked if Pomodoro is closed, and changes text', async () => {
    (window as any).electronAPI.isPomodoroWindowOpen = vi.fn().mockResolvedValue(false);
    (window as any).electronAPI.openPomodoroWindow = vi.fn();
    (window as any).electronAPI.closePomodoroWindow = vi.fn();

    await act(async () => {
      render(
        <MemoryRouter>
          <View />
        </MemoryRouter>
      );
    });

    const button = screen.getByRole('button');
    expect(screen.getByText('Start Pomodoro Timer')).toBeTruthy();

    await act(async () => {
      fireEvent.click(button);
    });

    expect(window.electronAPI.openPomodoroWindow).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Close Pomodoro Timer')).toBeTruthy();
  });

  it('calls closePomodoroWindow when button clicked if Pomodoro is open, and changes text', async () => {
    (window as any).electronAPI.isPomodoroWindowOpen = vi.fn().mockResolvedValue(true);
    (window as any).electronAPI.openPomodoroWindow = vi.fn();
    (window as any).electronAPI.closePomodoroWindow = vi.fn();

    await act(async () => {
      render(
        <MemoryRouter>
          <View />
        </MemoryRouter>
      );
    });

    const button = screen.getByRole('button');
    expect(screen.getByText('Close Pomodoro Timer')).toBeTruthy();

    await act(async () => {
      fireEvent.click(button);
    });

    expect(window.electronAPI.closePomodoroWindow).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Start Pomodoro Timer')).toBeTruthy();
  });
});
