import {describe, vi, it, expect, beforeEach} from 'vitest';
import {TaskController} from '../controller';
import {CustomDate, getTodayMidnight} from '../helpers';

describe('Task Model', () => {
  let controller: TaskController;
  let mockViewUpdateCallback: ReturnType<typeof vi.fn>;
  let mockActionCallback: ReturnType<typeof vi.fn>;
  let mockErrorCallback: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Load a fresh controller for each test.
    controller = new TaskController();

    // Create mock callback functions
    mockViewUpdateCallback = vi.fn();
    mockActionCallback = vi.fn();
    mockErrorCallback = vi.fn();

    // Set callbacks
    controller.setCallbacks(
      mockViewUpdateCallback,
      mockActionCallback,
      mockErrorCallback,
    );

    // Reset mocks after setup
    vi.resetAllMocks();
  });

  describe('Task creation', () => {
    it('should call view update with correct task list', () => {
      const newTaskId = controller.handleCreateTask(
        'Sample',
        'sample',
        0,
        getTodayMidnight(),
      );
      expect(mockViewUpdateCallback).toHaveBeenCalledWith([
        [
          newTaskId,
          {
            title: 'Sample',
            description: 'sample',
            status: 'not started',
            course: 0,
            deadline: getTodayMidnight(),
            imported: false,
          },
        ],
      ]);
    });
    it('should not allow empty titles', () => {
      controller.handleCreateTask('', 'sample', 0, getTodayMidnight());
      expect(mockErrorCallback).toHaveBeenCalledWith(
        'createError',
        expect.anything(),
      );
    });
    it('should not allow empty descriptions', () => {
      controller.handleCreateTask('Sample', '', 0, getTodayMidnight());
      expect(mockErrorCallback).toHaveBeenCalledWith(
        'createError',
        expect.anything(),
      );
    });
    it('should not allow invalid dates', () => {
      controller.handleCreateTask(
        'Sample',
        'sample',
        0,
        new CustomDate('fake'),
      );
      expect(mockErrorCallback).toHaveBeenCalledWith(
        'createError',
        expect.anything(),
      );
    });
  });
  describe('Task editing', () => {
    it('should call view update with correct task list', () => {
      const newTaskId = controller.handleCreateTask(
        'Sample',
        'sample',
        0,
        getTodayMidnight(),
      );
      controller.handleTaskUpdate(newTaskId, {
        title: 'Edited Sample',
        description: 'edited sample',
        status: 'not started',
        course: 0,
        deadline: getTodayMidnight(),
        imported: false,
      });

      expect(mockViewUpdateCallback).toHaveBeenNthCalledWith(2, [
        [
          newTaskId,
          {
            title: 'Edited Sample',
            description: 'edited sample',
            status: 'not started',
            course: 0,
            deadline: getTodayMidnight(),
            imported: false,
          },
        ],
      ]);
    });
    it('should not allow empty titles', () => {
      const newTaskId = controller.handleCreateTask(
        'Sample',
        'sample',
        0,
        getTodayMidnight(),
      );
      controller.handleTaskUpdate(newTaskId, {
        title: '',
        description: 'sample',
        status: 'not started',
        course: 0,
        deadline: getTodayMidnight(),
        imported: false,
      });
      expect(mockErrorCallback).toHaveBeenCalledWith(
        'updateError',
        expect.anything(),
      );
    });
    it('should not allow empty descriptions', () => {
      const newTaskId = controller.handleCreateTask(
        'Sample',
        'sample',
        0,
        getTodayMidnight(),
      );
      controller.handleTaskUpdate(newTaskId, {
        title: 'Sample',
        description: '',
        status: 'not started',
        course: 0,
        deadline: getTodayMidnight(),
        imported: false,
      });
      expect(mockErrorCallback).toHaveBeenCalledWith(
        'updateError',
        expect.anything(),
      );
    });
    it('should not allow invalid dates', () => {
      const newTaskId = controller.handleCreateTask(
        'Sample',
        'sample',
        0,
        getTodayMidnight(),
      );
      controller.handleTaskUpdate(newTaskId, {
        title: 'Sample',
        description: 'sample',
        status: 'not started',
        course: 0,
        deadline: new CustomDate('fake'),
        imported: false,
      });
      expect(mockErrorCallback).toHaveBeenCalledWith(
        'updateError',
        expect.anything(),
      );
    });
  });

  describe('Task completion', () => {
    it('update the task status to completed', () => {
      const newTaskId = controller.handleCreateTask(
        'Sample',
        'sample',
        0,
        getTodayMidnight(),
      );
      controller.markComplete(newTaskId);
      expect(mockViewUpdateCallback).toHaveBeenCalledWith([
        [
          newTaskId,
          {
            title: 'Sample',
            description: 'sample',
            status: 'completed',
            course: 0,
            deadline: getTodayMidnight(),
            imported: false,
          },
        ],
      ]);
    });
    it('evoke an error if no id is provided', () => {
      controller.markComplete();
      expect(mockErrorCallback).toHaveBeenCalledWith(
        'completeError',
        'Failed to mark task as completed. Please try again.',
      );
      expect(mockViewUpdateCallback).not.toHaveBeenCalled();
    });
  });

  describe('Task deletion', () => {
    it('remove the task from the list when deleted', () => {
      const newTaskId = controller.handleCreateTask(
        'Sample',
        'sample',
        0,
        getTodayMidnight(),
      );
      controller.deleteTask(newTaskId);
      expect(mockViewUpdateCallback).toHaveBeenCalledWith([]);
    });
    it('evoke an error if no id is provided', () => {
      controller.deleteTask();
      expect(mockErrorCallback).toHaveBeenCalledWith(
        'deleteError',
        'Failed to delete task. Please try again.',
      );
      expect(mockViewUpdateCallback).not.toHaveBeenCalled();
    });
  });
});
