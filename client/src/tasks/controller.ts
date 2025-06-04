import {
  TaskModel,
  TaskState,
  TaskId,
  CanvasTaskModel,
  TaskAction,
} from './model';
import {CourseId, Course} from './course';
import {CustomDate} from './helpers';
import { celebratePet } from '../pet/petCelebration';
import { taskCompletePoints } from '../rewards-store/controller';

export type TaskError =
  | 'deleteError'
  | 'completeError'
  | 'syncError'
  | 'updateError'
  | 'createError';

export class TaskController {
  // Database file name
  private static readonly FILE_NAME = 'tasks.db';

  // Collection of all user tasks
  private tasks: Map<TaskId, TaskModel>;
  private courses: Map<CourseId, Course>;

  // TEMPORARY: Collect user token for testing purposes.
  private userToken?: string;

  // View update callback
  // Send latest list of tasks to the client
  private viewUpdateCallback?: (tasks: [TaskId, TaskState][]) => void;

  // Action callback
  // Send an action to the view to process
  private actionCallback?: (action: TaskAction) => void;

  // Error callback
  // Send an error to the view to process
  private errorCallback?: (error: TaskError, msg: string) => void;

  // Task with action being taken on
  private activeTask?: TaskId;

  /**
   * Create a new task controller instance
   */
  constructor() {
    this.reset();

    // TODO: Load existing tasks from database.

    // Query new tasks from Canvas.
  }

  public reset() {
    this.tasks = new Map();
    this.courses = new Map();
    this.userToken = undefined;
    this.activeTask = undefined;
    this.courses.set(0, {
      id: 0,
      name: 'Personal',
      course_code: 'PERS',
      course_format: '',
      time_zone: '',
    });
    try {
      window.electron
        .dbGetAll(TaskController.FILE_NAME)
        .then((docs: Array<TaskState & {_id: string}>) => {
          // Insert each
          for (const doc of docs) {
            // Create task using task model
            const link = 'link' in doc ? doc.link : undefined;
            const status = 'status' in doc ? doc.status : undefined;
            const createdTask = new TaskModel(
              doc.title,
              doc.description,
              doc.course,
              new CustomDate(doc.deadline),
              doc._id,
              link,
              status,
            );
            // Get task ID
            const createdTaskId = createdTask.getId();
            // Save task in temporary state
            this.tasks.set(createdTaskId, createdTask);
          }
        });
    } catch (err) {
      // Ignore for now.
    }
  }

  public setCallbacks(
    viewUpdateCallback: (tasks: [TaskId, TaskState][]) => void,
    actionCallback: (action: TaskAction) => void,
    errorCallback: (error: TaskError, msg: string) => void,
  ) {
    this.viewUpdateCallback = viewUpdateCallback;
    this.actionCallback = actionCallback;
    this.errorCallback = errorCallback;
    this.viewUpdateCallback(this.getTaskList());
  }

  /**
   * Handle create task user action
   */
  public handleCreateTask(
    title: string,
    description: string,
    course: CourseId,
    deadline: CustomDate,
    link?: URL,
  ) {
    // Create task using task model
    const createdTask = new TaskModel(
      title,
      description,
      course,
      deadline,
      undefined,
      link,
    );
    // Verify the validity of the task state
    // Validate the new state
    if (!createdTask.isValid()) {
      // Throw an error
      if (this.errorCallback !== undefined) {
        this.errorCallback(
          'createError',
          'Tried to create a task with invalid fields',
        );
      }
      return;
    }
    // Get task ID
    const createdTaskId = createdTask.getId();
    // Save task in temporary state
    this.tasks.set(createdTaskId, createdTask);
    // Save task to database
    try {
      window.electron.dbInsert({
        filename: TaskController.FILE_NAME,
        document: createdTask.getState(),
      });
    } catch (err) {
      // TODO: Handle errors with database
    }
    // Update the view
    if (this.viewUpdateCallback !== undefined) {
      this.viewUpdateCallback(this.getTaskList());
    }
    return createdTaskId;
  }

  public handleTaskUpdate(id: TaskId, task: TaskState) {
    const taskToUpdate = this.tasks.get(id);
    // Save old task state
    const oldTaskState = taskToUpdate.getState();
    // Update the task state
    taskToUpdate.setState(task);
    // Validate the new state
    if (!taskToUpdate.isValid()) {
      // Revert the state
      taskToUpdate.setState(oldTaskState);
      // Throw an error
      if (this.errorCallback !== undefined) {
        this.errorCallback(
          'updateError',
          'Tried to update a task with invalid fields',
        );
      }
      return;
    }
    // Update in disk
    // TODO: Await and handle any errors in UI
    try {
      window.electron.dbUpdate(
        TaskController.FILE_NAME,
        taskToUpdate.getId(),
        task,
      );
    } catch (err) {
      // Ignore for now.
    }
    // Update in view
    if (this.viewUpdateCallback !== undefined) {
      this.viewUpdateCallback(this.getTaskList());
    }
  }

  public markComplete(id?: TaskId) {
    let taskToUpdate: TaskModel;
    if (id === undefined && this.activeTask !== undefined) {
      // Delete active task
      taskToUpdate = this.tasks.get(this.activeTask);
      taskCompletePoints();
    } else if (id !== undefined) {
      // Delete specified task
      taskToUpdate = this.tasks.get(id);
      taskCompletePoints();
    } else {
      if (this.errorCallback !== undefined) {
        this.errorCallback(
          'completeError',
          'Failed to mark task as completed. Please try again.',
        );
      }
      return;
    }
    taskToUpdate.setState({
      title: taskToUpdate.getState().title,
      description: taskToUpdate.getState().description,
      course: taskToUpdate.getState().course,
      deadline: taskToUpdate.getState().deadline,
      link: taskToUpdate.getState().link,
      imported: taskToUpdate.getState().imported,
      status: 'completed',
    });
    // TODO: Await and handle any errors in UI
    try {
      window.electron.dbUpdate(
        TaskController.FILE_NAME,
        taskToUpdate.getId(),
        taskToUpdate.getState(),
      );
    } catch (err) {
      // Ignore for now.
    }
    if (this.viewUpdateCallback !== undefined) {
      this.viewUpdateCallback(this.getTaskList());
    }
    // Trigger pet celebration
    celebratePet();
  }

  public deleteTask(id?: TaskId) {
    if (id === undefined && this.activeTask !== undefined) {
      // Delete active task
      this.tasks.delete(this.activeTask);
    } else if (id !== undefined) {
      // Delete specified task
      this.tasks.delete(id);
    } else {
      if (this.errorCallback !== undefined) {
        this.errorCallback(
          'deleteError',
          'Failed to delete task. Please try again.',
        );
      }
      return;
    }
    // Update the database
    try {
      window.electron.dbRemove(
        TaskController.FILE_NAME,
        id === undefined ? this.activeTask : id,
      );
    } catch (err) {
      // Ignore for now.
    }
    // Update the view
    if (this.viewUpdateCallback !== undefined) {
      this.viewUpdateCallback(this.getTaskList());
    }
  }

  public triggerAction(action: TaskAction, id: TaskId) {
    this.activeTask = id;
    if (this.actionCallback !== undefined) {
      this.actionCallback(action);
    }
  }

  // Transform models into UI friendly state
  private getTaskList(): [TaskId, TaskState][] {
    const taskList: [TaskId, TaskState][] = [...this.tasks.entries()].map(
      ([taskId, taskModel]) => [taskId, taskModel.getState()],
    );
    // Filter all tasks for the next week
    // Sort in ascending order by deadline.
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekAfter = new Date();
    weekAfter.setDate(weekAfter.getDate() + 7);
    weekAfter.setHours(23, 59, 59, 0);
    const filteredTaskList = taskList
      .filter(
        ([, taskState]) =>
          taskState.deadline >= today && taskState.deadline <= weekAfter,
      )
      .sort((a, b) => +a[1].deadline - +b[1].deadline);
    return filteredTaskList;
  }

  public async syncCanvas() {
    if (this.userToken === undefined) return;
    // Call the IPC
    console.log('calling the IPC');
    try {
      const [courses, assignments] = await window.electron.api.invoke(
        'getCanvasAssignments',
        this.userToken,
      );
      console.log(assignments);
      for (const course of courses) {
        this.courses.set(course.id, course);
      }
      for (const assignment of assignments) {
        const newTask = new CanvasTaskModel(assignment);
        this.tasks.set(newTask.getId(), newTask);
      }
      // After the sync is complete, update the view.
      if (this.viewUpdateCallback !== undefined) {
        this.viewUpdateCallback(this.getTaskList());
      }
    } catch (e) {
      if (this.errorCallback !== undefined) {
        this.errorCallback(
          'syncError',
          'Canvas sync failed. Check your token and please try again.',
        );
      }
    }
  }

  public handleTokenUpdate(token: string) {
    this.userToken = token;
  }

  public validateToken(): boolean {
    return this.userToken !== undefined;
  }
}

const taskControllerInstance: TaskController = new TaskController();

export default taskControllerInstance;
