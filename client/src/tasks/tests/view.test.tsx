import {describe, vi, it, expect, beforeEach, afterEach} from 'vitest';
// See home-page view tests for example using React mock.
import {act, fireEvent, render, screen, within} from '@testing-library/react';
import '@testing-library/jest-dom';
import View from '../view';
import taskControllerInstance from '../controller';
import {CustomDate} from '../helpers';

describe('Task View', () => {
  beforeEach(() => {
    // Load a fresh controller for each test.
    taskControllerInstance.reset();

    // tell vitest we use mocked time
    vi.useFakeTimers();

    // Set fake time (note that 5 is actually 6 for June)
    vi.setSystemTime(new Date(2025, 5, 28, 0, 0, 0));
  });

  afterEach(() => {
    // restoring date after each test run
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  /**
   * An active tasks is defined as starting from today through next week.
   */
  describe('upcoming week task rendering', () => {
    it('shows no upcoming tasks for the week', async () => {
      // Create tasks with wrong dates
      taskControllerInstance.handleCreateTask(
        'dummy task',
        'dummy',
        1,
        new CustomDate(new Date(2025, 5, 27, 0, 0, 0)),
      );
      taskControllerInstance.handleCreateTask(
        'dummy task 2',
        'dummy',
        1,
        new CustomDate(new Date(2025, 6, 6, 0, 0, 0)),
      );
      // Expect text with no tasks
      act(() => {
        render(<View />);
      });
      expect(screen.queryByTestId('no-tasks-msg')).toBeInTheDocument();
      expect(screen.queryByTestId('task-card')).not.toBeInTheDocument();
    });
    it('shows only upcoming tasks for the week', () => {
      // Create tasks with wrong dates
      taskControllerInstance.handleCreateTask(
        'dummy task',
        'dummy',
        1,
        new CustomDate(new Date(2025, 5, 27, 0, 0, 0)),
      );
      taskControllerInstance.handleCreateTask(
        'dummy task 2',
        'dummy',
        1,
        new CustomDate(new Date(2025, 6, 3, 0, 0, 0)),
      );
      taskControllerInstance.handleCreateTask(
        'dummy task 3',
        'dummy',
        1,
        new CustomDate(new Date(2025, 6, 5, 0, 0, 0)),
      );
      taskControllerInstance.handleCreateTask(
        'dummy task 4',
        'dummy',
        1,
        new CustomDate(new Date(2025, 6, 6, 0, 0, 0)),
      );
      // Expect two task cards rendered
      render(<View />);
      expect(screen.queryByTestId('no-tasks-msg')).not.toBeInTheDocument();
      expect(screen.getAllByTestId('task-card')).toHaveLength(2);
    });
  });

  describe('task creation', () => {
    it('open new task editor', async () => {
      // Expect no task editor visible initially
      act(() => {
        render(<View />);
      });
      expect(screen.queryByTestId('new-task-card')).not.toBeVisible();
      // Click button to open task editor
      act(() => {
        screen.queryByTestId('open-new-task-button').click();
      });
      // Expect task editor to be visible
      expect(screen.queryByTestId('new-task-card')).toBeVisible();
      // Expect EOD deadline by default
      expect(
        within(
          within(screen.getByTestId('new-task-card')).getByTestId(
            'task-card-deadline',
          ),
        ).getByTestId('task-editable'),
      ).toHaveValue('2025-06-28T23:59');
    });
    it('submit created task', async () => {
      // Create the mock screen
      act(() => {
        render(<View />);
      });
      act(() => {
        // Click button to open task editor
        screen.queryByTestId('open-new-task-button').click();
        // Update fields
        fireEvent.change(
          within(
            within(screen.getByTestId('new-task-card')).getByTestId(
              'task-card-title',
            ),
          ).getByTestId('task-editable'),
          {target: {value: 'dummy test title'}},
        );
        // Update fields
        fireEvent.change(
          within(
            within(screen.getByTestId('new-task-card')).getByTestId(
              'task-card-desc',
            ),
          ).getByTestId('task-editable'),
          {target: {value: 'dummy test description'}},
        );
        // Submit task
        screen.getByTestId('save-task-btn').click();
      });
      // Expect a single card
      expect(screen.queryByTestId('no-tasks-msg')).not.toBeInTheDocument();
      expect(screen.getAllByTestId('task-card')).toHaveLength(1);
      // Single card should contain correct details
      expect(
        within(screen.getByTestId('task-card')).getByTestId('task-card-title'),
      ).toHaveTextContent('dummy test title');
      expect(
        within(screen.getByTestId('task-card')).getByTestId('task-card-desc'),
      ).toHaveTextContent('dummy test description');
    });
    it('prevents invalid fields', async () => {
      // Create the mock screen
      act(() => {
        render(<View />);
      });
      act(() => {
        // Click button to open task editor
        screen.queryByTestId('open-new-task-button').click();
        // Submit task
        screen.getByTestId('save-task-btn').click();
      });
      // Show error messages (and keep in editing mode)
      within(screen.getByTestId('new-task-card'))
        .queryAllByTestId('task-editable')
        .forEach(element => {
          expect(element).toBeVisible();
        });
      within(screen.getByTestId('new-task-card'))
        .queryAllByText('Please enter a value')
        .forEach(element => {
          expect(element).toBeVisible();
        });
      within(screen.getByTestId('new-task-card'))
        .queryAllByText('Please enter a date')
        .forEach(element => {
          expect(element).toBeVisible();
        });
    });
  });

  describe('task editing', () => {
    it('opens task editor', async () => {
      // Create a fake task
      taskControllerInstance.handleCreateTask(
        'dummy task',
        'dummy',
        1,
        new CustomDate(new Date(2025, 5, 29, 0, 0, 0)),
      );
      act(() => {
        render(<View />);
      });
      // Click the edit icon
      act(() => {
        within(screen.getByTestId('task-card'))
          .getByTestId('task-edit-btn')
          .click();
      });
      // Expect editor UI
      expect(
        within(
          within(screen.getByTestId('task-card')).getByTestId(
            'task-card-title',
          ),
        ).getByTestId('task-editable'),
      ).toBeInTheDocument();
      expect(
        within(
          within(screen.getByTestId('task-card')).getByTestId(
            'task-card-deadline',
          ),
        ).getByTestId('task-editable'),
      ).toBeInTheDocument();
      expect(
        within(
          within(screen.getByTestId('task-card')).getByTestId('task-card-desc'),
        ).getByTestId('task-editable'),
      ).toBeInTheDocument();
      expect(
        within(screen.getByTestId('task-card')).getByTestId('save-task-btn'),
      ).toBeInTheDocument();
      expect(
        within(screen.getByTestId('task-card')).getByTestId('cancel-task-btn'),
      ).toBeInTheDocument();
    });
    it('edits a task correctly', async () => {
      // Create a fake task
      taskControllerInstance.handleCreateTask(
        'dummy task',
        'dummy',
        1,
        new CustomDate(new Date(2025, 5, 29, 0, 0, 0)),
      );
      act(() => {
        render(<View />);
      });
      act(() => {
        // Click the edit icon
        screen.getByTestId('task-edit-btn').click();
      });
      act(() => {
        // Update fields
        fireEvent.change(
          within(
            within(screen.getByTestId('task-card')).getByTestId(
              'task-card-title',
            ),
          ).getByTestId('task-editable'),
          {target: {value: 'dummy test title'}},
        );
        // Update fields
        fireEvent.change(
          within(
            within(screen.getByTestId('task-card')).getByTestId(
              'task-card-desc',
            ),
          ).getByTestId('task-editable'),
          {target: {value: 'dummy test description'}},
        );
        // Submit task
        within(screen.getByTestId('task-card'))
          .getByTestId('save-task-btn')
          .click();
      });
      // Expect a single card
      expect(screen.queryByTestId('no-tasks-msg')).not.toBeInTheDocument();
      expect(screen.getAllByTestId('task-card')).toHaveLength(1);
      // Single card should contain correct details
      expect(
        within(screen.getByTestId('task-card')).getByTestId('task-card-title'),
      ).toHaveTextContent('dummy test title');
      expect(
        within(screen.getByTestId('task-card')).getByTestId('task-card-desc'),
      ).toHaveTextContent('dummy test description');
    });
    it('prevents invalid fields', async () => {
      // Create a fake task
      taskControllerInstance.handleCreateTask(
        'dummy task',
        'dummy',
        1,
        new CustomDate(new Date(2025, 5, 29, 0, 0, 0)),
      );
      // Create the mock screen
      act(() => {
        render(<View />);
      });
      act(() => {
        // Click the edit icon
        screen.getByTestId('task-edit-btn').click();
        // Submit task
        screen.getByTestId('save-task-btn').click();
      });
      // Show error messages (and keep in editing mode)
      within(screen.getByTestId('task-card'))
        .queryAllByTestId('task-editable')
        .forEach(element => {
          expect(element).toBeVisible();
        });
      within(screen.getByTestId('task-card'))
        .queryAllByText('Please enter a value')
        .forEach(element => {
          expect(element).toBeVisible();
        });
      within(screen.getByTestId('task-card'))
        .queryAllByText('Please enter a date')
        .forEach(element => {
          expect(element).toBeVisible();
        });
    });
  });

  describe('task deletion and cancel', () => {
    it('prompts user to confirm deletion', async () => {
      // Create a fake task
      taskControllerInstance.handleCreateTask(
        'dummy task',
        'dummy',
        1,
        new CustomDate(new Date(2025, 5, 29, 0, 0, 0)),
      );
      act(() => {
        render(<View />);
      });
      act(() => {
        // Click the edit icon
        screen.getByTestId('task-delete-btn').click();
      });
      // Modal does not render unless it is shown
      expect(screen.queryAllByRole('dialog')).toHaveLength(1);
    });
    it('cancel deletion prompt does not affect tasks', async () => {
      // Create a fake task
      taskControllerInstance.handleCreateTask(
        'dummy task',
        'dummy',
        1,
        new CustomDate(new Date(2025, 5, 29, 0, 0, 0)),
      );
      act(() => {
        render(<View />);
      });
      act(() => {
        // Click the edit icon
        screen.getByTestId('task-delete-btn').click();
      });
      act(() => {
        // Click the cancel button
        within(screen.getByRole('dialog'))
          .getByRole('button', {name: 'Cancel'})
          .click();
      });
      // Expect the task to still be there
      expect(screen.queryByTestId('no-tasks-msg')).not.toBeInTheDocument();
      expect(screen.getAllByTestId('task-card')).toHaveLength(1);
      // Single card should contain correct details
      expect(
        within(screen.getByTestId('task-card')).getByTestId('task-card-title'),
      ).toHaveTextContent('dummy task');
      expect(
        within(screen.getByTestId('task-card')).getByTestId('task-card-desc'),
      ).toHaveTextContent('dummy');
    });
    it('confirm deletion prompt removes task card', async () => {
      // Create a fake task
      taskControllerInstance.handleCreateTask(
        'dummy task',
        'dummy',
        1,
        new CustomDate(new Date(2025, 5, 29, 0, 0, 0)),
      );
      act(() => {
        render(<View />);
      });
      act(() => {
        // Click the edit icon
        screen.getByTestId('task-delete-btn').click();
      });
      act(() => {
        // Click the cancel button
        within(screen.getByRole('dialog'))
          .getByRole('button', {name: 'Confirm'})
          .click();
      });
      // Expect the task to still be there
      expect(screen.queryByTestId('no-tasks-msg')).toBeInTheDocument();
      expect(screen.queryByTestId('task-card')).not.toBeInTheDocument();
    });
  });
});
