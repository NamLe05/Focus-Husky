import {
  TaskModel,
  TaskState,
  TaskId,
  TaskStatus,
  CanvasTaskModel,
  TaskAction,
} from './model';
import {CourseId, Course} from './course';

export type TaskError = 'deleteError' | 'completeError' | 'syncError';

export class TaskController {
  // Collection of all user tasks
  private tasks: Map<TaskId, TaskModel>;
  private courses: Map<CourseId, Course>;

  // TEMPORARY: Collect user token for testing purposes.
  private userToken?: string;

  // View update callback
  // Send latest list of tasks to the client
  private viewUpdateCallback: (tasks: [TaskId, TaskState][]) => void;

  // Action callback
  // Send an action to the view to process
  private actionCallback: (action: TaskAction) => void;

  // Error callback
  // Send an error to the view to process
  private errorCallback: (error: TaskError, msg: string) => void;

  // Task with action being taken on
  private activeTask?: TaskId;

  /**
   * Create a new task controller instance
   * @param viewUpdateCallback Callback to notify view of updates
   */
  constructor(
    viewUpdateCallback: (tasks: [TaskId, TaskState][]) => void,
    actionCallback: (action: TaskAction) => void,
    errorCallback: (error: TaskError, msg: string) => void,
  ) {
    this.tasks = new Map();
    this.courses = new Map();
    this.viewUpdateCallback = viewUpdateCallback;
    this.actionCallback = actionCallback;
    this.errorCallback = errorCallback;
    this.userToken = undefined;
    this.activeTask = undefined;
    this.courses.set(0, {
      id: 0,
      name: 'Personal',
      course_code: 'PERS',
      course_format: '',
      time_zone: '',
    });

    // TODO: Load existing tasks from database.

    // Query new tasks from Canvas.
  }

  /**
   * Handle create task user action
   */
  public handleCreateTask(
    title: string,
    description: string,
    course: CourseId,
    deadline: Date,
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
    // Get task ID
    const createdTaskId = createdTask.getId();
    // Save task in temporary state
    this.tasks.set(createdTaskId, createdTask);
    // Save task to database
    this.saveTaskToDatabase(createdTaskId);
    // Update the view
    this.viewUpdateCallback(this.getTaskList());
  }

  public handleTaskUpdate(
    id: TaskId,
    title: string,
    description: string,
    course: CourseId,
    deadline: Date,
    link?: URL,
    status?: TaskStatus,
  ) {
    const taskToUpdate = this.tasks.get(id);
    taskToUpdate.setState({
      title,
      description,
      course,
      deadline,
      link,
      imported: taskToUpdate.getState().imported,
      status,
    });
    this.viewUpdateCallback(this.getTaskList());
  }

  public markComplete(id?: TaskId) {
    let taskToUpdate: TaskModel;
    if (id === undefined && this.activeTask !== undefined) {
      // Delete active task
      taskToUpdate = this.tasks.get(this.activeTask);
    } else if (id !== undefined) {
      // Delete specified task
      taskToUpdate = this.tasks.get(id);
    } else {
      this.errorCallback(
        'completeError',
        'Failed to mark task as completed. Please try again.',
      );
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
    this.viewUpdateCallback(this.getTaskList());
  }

  public deleteTask(id?: TaskId) {
    if (id === undefined && this.activeTask !== undefined) {
      // Delete active task
      this.tasks.delete(this.activeTask);
    } else if (id !== undefined) {
      // Delete specified task
      this.tasks.delete(id);
    } else {
      this.errorCallback(
        'deleteError',
        'Failed to delete task. Please try again.',
      );
    }
    // Update the view
    this.viewUpdateCallback(this.getTaskList());
  }

  public triggerAction(action: TaskAction, id: TaskId) {
    this.activeTask = id;
    this.actionCallback(action);
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

  private saveTaskToDatabase(taskId: TaskId): void {
    const task = this.tasks.get(taskId);
    if (!task) return;

    console.log(`Saving task ${taskId} to database:`, task.getState());
    // TODO: call database APIs
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
      this.viewUpdateCallback(this.getTaskList());
    } catch (e) {
      this.errorCallback(
        'syncError',
        'Canvas sync failed. Check your token and please try again.',
      );
    }
  }

  public handleTokenUpdate(token: string) {
    this.userToken = token;
  }

  public validateToken(): boolean {
    return this.userToken !== undefined;
  }
}
