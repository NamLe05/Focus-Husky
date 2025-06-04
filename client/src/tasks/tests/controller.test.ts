import {describe, vi, it, expect, beforeEach} from 'vitest';
import {TaskController} from '../controller';
import {CustomDate, getTodayMidnight} from '../helpers';
import * as RewardsController from '../../rewards-store/controller';
import {v4 as uuid} from 'uuid';

vi.mock('../../pet/petCelebration', () => ({celebratePet: vi.fn()}));

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
    // Reset mocks before setup
    vi.resetAllMocks();

    // Mock the API
    (window as any).electron = {
      dbInsert: vi.fn().mockImplementation(() => Promise.resolve(uuid())),
      dbGetAll: vi.fn().mockResolvedValue([]),
      dbUpdate: vi.fn(),
      dbRemove: vi.fn(),
    };
  });

  describe('Task creation', () => {
    it('should call view update with correct task list', async () => {
      const newTaskId = await controller.handleCreateTask(
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
    it('should not allow empty titles', async () => {
      await controller.handleCreateTask('', 'sample', 0, getTodayMidnight());
      expect(mockErrorCallback).toHaveBeenCalledWith(
        'createError',
        expect.anything(),
      );
    });
    it('should not allow empty descriptions', async () => {
      await controller.handleCreateTask('Sample', '', 0, getTodayMidnight());
      expect(mockErrorCallback).toHaveBeenCalledWith(
        'createError',
        expect.anything(),
      );
    });
    it('should not allow invalid dates', async () => {
      await controller.handleCreateTask(
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
    it('should call view update with correct task list', async () => {
      const newTaskId = await controller.handleCreateTask(
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
    it('should not allow empty titles', async () => {
      const newTaskId = await controller.handleCreateTask(
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
    it('should not allow empty descriptions', async () => {
      const newTaskId = await controller.handleCreateTask(
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
    it('should not allow invalid dates', async () => {
      const newTaskId = await controller.handleCreateTask(
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
    it('allow partial updates', async () => {
      const newTaskId = await controller.handleCreateTask(
        'Sample',
        'sample',
        0,
        getTodayMidnight(),
      );
      controller.handleTaskUpdate(newTaskId, {
        title: 'Edited Sample Title',
      });
      expect(mockViewUpdateCallback).toHaveBeenNthCalledWith(2, [
        [
          newTaskId,
          {
            title: 'Edited Sample Title',
            description: 'sample',
            status: 'not started',
            course: 0,
            deadline: getTodayMidnight(),
            imported: false,
          },
        ],
      ]);
    });
  });

  describe('Task completion', () => {
    it('update the task status to completed', async () => {
      const newTaskId = await controller.handleCreateTask(
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

    it('25 points added to rewards when task is completed', async () => {
      const check = vi.spyOn(RewardsController, 'taskCompletePoints');

      const newTaskId = await controller.handleCreateTask(
        'Sample',
        'sample',
        0,
        getTodayMidnight(),
      );

      controller.markComplete(newTaskId);
      expect(check).toHaveBeenCalled();
    });
  });

  describe('Task deletion', () => {
    it('remove the task from the list when deleted', async () => {
      const newTaskId = await controller.handleCreateTask(
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
